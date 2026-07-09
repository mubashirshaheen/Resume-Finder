from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserSkillsUpdate, UserUpdate
from app.services.matching_service import recalculate_user_matches
from app.services.resume_service import get_active_resume

router = APIRouter()


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserRead)
async def update_me(payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.preferred_location is not None:
        current_user.preferred_location = payload.preferred_location
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/me/skills")
async def update_skills(payload: UserSkillsUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = get_active_resume(db, current_user)
    if resume:
        resume.extracted_skills = payload.extracted_skills
        resume.extracted_keywords = payload.extracted_keywords
        resume.extracted_job_titles = payload.extracted_job_titles
    current_user.preferred_location = payload.preferred_location
    db.commit()
    matched = recalculate_user_matches(db, current_user)
    return {"matched": matched}
