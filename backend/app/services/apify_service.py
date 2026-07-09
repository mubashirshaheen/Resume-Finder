from datetime import UTC, datetime, timedelta
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.job import Job
from app.services.matching_service import match_jobs_against_users


class ApifyFetchError(RuntimeError):
    def __init__(self, message: str, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


DEFAULT_KEYWORDS = [
    "Software Engineer", "Developer", "Data Analyst", "Project Manager", "Sales", "Marketing",
    "Accountant", "HR", "Customer Support", "Designer", "DevOps", "QA Engineer", "Business Analyst",
]


def _parse_date(value: Any) -> datetime | None:
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def _job_payload(item: dict[str, Any], keyword: str) -> dict[str, Any] | None:
    url = item.get("jobUrl") or item.get("url") or item.get("link") or item.get("applyUrl")
    title = item.get("title") or item.get("jobTitle")
    if not url or not title:
        return None
    source_id = str(item.get("id") or item.get("jobId") or item.get("linkedinJobId") or url)
    posted_at = _parse_date(item.get("postedAt") or item.get("postedDate") or item.get("date"))
    fetched_at = datetime.now(UTC)
    return {
        "source": "apify_linkedin",
        "source_job_id": source_id,
        "title": title,
        "company": item.get("companyName") or item.get("company"),
        "location": item.get("location") or "United States",
        "description": item.get("description") or item.get("jobDescription"),
        "job_url": url,
        "posted_at": posted_at,
        "fetched_at": fetched_at,
        "keyword_source": keyword,
        "is_active": True,
        "expires_at": (posted_at or fetched_at) + timedelta(days=30),
    }


async def fetch_jobs_from_apify(db: Session, lookback_hours: int = 24) -> dict[str, int]:
    created_jobs: list[Job] = []
    fetched = created = updated = 0
    if not settings.apify_token:
        return {"fetched": 0, "created": 0, "updated": 0}

    headers = {"Authorization": f"Bearer {settings.apify_token}"}
    async with httpx.AsyncClient(timeout=180, headers=headers) as client:
        for keyword in DEFAULT_KEYWORDS:
            run_input = {
                "keywords": keyword,
                "location": "United States",
                "publishedAt": f"r{lookback_hours * 3600}",
                "rows": 50,
            }
            run_url = f"https://api.apify.com/v2/acts/{settings.apify_actor_id}/run-sync-get-dataset-items"
            try:
                response = await client.post(run_url, json=run_input)
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                detail = _apify_error_detail(exc.response)
                raise ApifyFetchError(
                    f"Apify rejected the job fetch for actor '{settings.apify_actor_id}' "
                    f"with HTTP {exc.response.status_code}: {detail}",
                    status_code=exc.response.status_code,
                ) from exc
            except httpx.HTTPError as exc:
                raise ApifyFetchError(f"Could not reach Apify: {exc}") from exc
            items = response.json()
            if not isinstance(items, list):
                continue
            for item in items:
                fetched += 1
                payload = _job_payload(item, keyword)
                if payload is None:
                    continue
                job = db.scalar(select(Job).where((Job.source_job_id == payload["source_job_id"]) | (Job.job_url == payload["job_url"])))
                if job is None:
                    job = Job(**payload)
                    db.add(job)
                    db.flush()
                    created += 1
                    created_jobs.append(job)
                else:
                    for key, value in payload.items():
                        setattr(job, key, value)
                    updated += 1
    db.commit()
    match_jobs_against_users(db, created_jobs)
    return {"fetched": fetched, "created": created, "updated": updated}


def _apify_error_detail(response: httpx.Response) -> str:
    try:
        payload = response.json()
    except ValueError:
        return response.text[:300] or "No response body"
    if isinstance(payload, dict):
        error = payload.get("error")
        if isinstance(error, dict):
            return str(error.get("message") or error.get("type") or error)
        return str(payload.get("message") or payload)
    return str(payload)


def expire_old_jobs(db: Session) -> int:
    now = datetime.now(UTC)
    jobs = db.scalars(select(Job).where(Job.is_active.is_(True), Job.expires_at.is_not(None), Job.expires_at < now)).all()
    for job in jobs:
        job.is_active = False
    db.commit()
    return len(jobs)
