import asyncio

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.job import FetchResult, JobRead
from app.services.apify_service import ApifyFetchError, expire_old_jobs, fetch_jobs_from_apify

router = APIRouter()


@router.get("", response_model=list[JobRead])
async def list_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.scalars(select(Job).where(Job.is_active.is_(True)).order_by(Job.posted_at.desc().nullslast()).limit(100)).all()


@router.post("/fetch-now", response_model=FetchResult)
async def fetch_now(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    x_internal_token: str | None = Header(default=None),
):
    if settings.internal_fetch_token and x_internal_token != settings.internal_fetch_token:
        raise HTTPException(status_code=403, detail="Invalid internal token")
    expire_old_jobs(db)
    try:
        return await fetch_jobs_from_apify(db, lookback_hours=24 * 7)
    except ApifyFetchError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/{job_id}", response_model=JobRead)
async def get_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.get(Job, job_id)
    if not job or not job.is_active:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
