from datetime import datetime

from pydantic import BaseModel


class ResumeRead(BaseModel):
    id: int
    original_filename: str
    file_type: str
    extracted_skills: list[str]
    extracted_keywords: list[str]
    extracted_job_titles: list[str]
    experience_level: str | None
    processing_status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ResumeStatus(BaseModel):
    id: int | None = None
    processing_status: str = "missing"
