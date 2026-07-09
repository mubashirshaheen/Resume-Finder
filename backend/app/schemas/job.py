from datetime import datetime

from pydantic import BaseModel


class JobRead(BaseModel):
    id: int
    source: str
    title: str
    company: str | None
    location: str | None
    description: str | None
    job_url: str
    posted_at: datetime | None
    fetched_at: datetime
    keyword_source: str | None
    is_active: bool
    expires_at: datetime | None

    model_config = {"from_attributes": True}


class FetchResult(BaseModel):
    fetched: int
    created: int
    updated: int
