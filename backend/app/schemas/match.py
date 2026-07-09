from datetime import datetime

from pydantic import BaseModel

from app.schemas.job import JobRead


class MatchRead(BaseModel):
    id: int
    user_id: int
    job_id: int
    match_score: float
    match_level: str
    matched_skills: list[str]
    missing_skills: list[str]
    matched_keywords: list[str]
    match_reason: str | None
    status: str
    created_at: datetime
    updated_at: datetime
    job: JobRead

    model_config = {"from_attributes": True}


class MatchStatusUpdate(BaseModel):
    status: str
