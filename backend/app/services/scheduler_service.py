import asyncio
import logging
from datetime import UTC, datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler

from app.core.database import SessionLocal
from app.models.job import Job
from app.services.apify_service import ApifyFetchError, expire_old_jobs, fetch_jobs_from_apify

logger = logging.getLogger(__name__)


class SchedulerService:
    def __init__(self) -> None:
        self.scheduler = BackgroundScheduler(timezone="UTC")
        self.started = False

    def start(self) -> None:
        if self.started:
            return
        self.scheduler.add_job(self.fetch_on_schedule, "cron", hour=9, minute=0, id="daily_job_fetch", replace_existing=True)
        self.scheduler.add_job(
            self.fetch_on_startup,
            "date",
            run_date=datetime.now(UTC) + timedelta(seconds=3),
            id="startup_job_fetch",
            replace_existing=True,
        )
        self.scheduler.start()
        self.started = True

    def shutdown(self) -> None:
        if self.started:
            self.scheduler.shutdown(wait=False)
            self.started = False

    def fetch_on_startup(self) -> None:
        db = SessionLocal()
        try:
            latest = db.query(Job).order_by(Job.fetched_at.desc()).first()
            cutoff = datetime.now(UTC) - timedelta(days=2)
            hours = 24 if latest and latest.fetched_at and latest.fetched_at > cutoff else 24 * 7
        finally:
            db.close()
        self._run_fetch(hours)

    def fetch_on_schedule(self) -> None:
        self._run_fetch(24)

    def _run_fetch(self, hours: int) -> None:
        db = SessionLocal()
        try:
            expire_old_jobs(db)
            asyncio.run(fetch_jobs_from_apify(db, lookback_hours=hours))
        except ApifyFetchError as exc:
            logger.warning("Scheduled Apify job fetch skipped: %s", exc)
        except Exception:
            logger.exception("Scheduled job fetch failed")
        finally:
            db.close()


scheduler_service = SchedulerService()
