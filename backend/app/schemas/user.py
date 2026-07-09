from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    preferred_location: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = None
    preferred_location: str | None = None


class UserSkillsUpdate(BaseModel):
    extracted_skills: list[str] = []
    extracted_keywords: list[str] = []
    extracted_job_titles: list[str] = []
    preferred_location: str | None = None
