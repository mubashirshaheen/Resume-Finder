from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.resume import ResumeRead, ResumeStatus
from app.services.resume_service import create_resume_upload, get_active_resume

router = APIRouter()


@router.post("/upload", response_model=ResumeRead)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_resume_upload(db, current_user, file, background_tasks)


@router.get("/me", response_model=ResumeRead | None)
async def my_resume(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_active_resume(db, current_user)


@router.get("/status", response_model=ResumeStatus)
async def resume_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = get_active_resume(db, current_user)
    if not resume:
        return ResumeStatus()
    return ResumeStatus(id=resume.id, processing_status=resume.processing_status)
