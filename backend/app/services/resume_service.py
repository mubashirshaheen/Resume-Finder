import os
from pathlib import Path
from uuid import uuid4

from fastapi import BackgroundTasks, HTTPException, UploadFile, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.resume import Resume
from app.models.user import User
from app.services.matching_service import recalculate_user_matches
from app.services.ollama_service import ollama_service
from app.utils.pdf_parser import extract_pdf_text


def create_resume_upload(db: Session, user: User, file: UploadFile, background_tasks: BackgroundTasks) -> Resume:
    if file.content_type != "application/pdf" and not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = f"{user.id}-{uuid4().hex}.pdf"
    file_path = upload_dir / safe_name
    max_bytes = settings.max_upload_mb * 1024 * 1024
    size = 0

    with file_path.open("wb") as target:
        while chunk := file.file.read(1024 * 1024):
            size += len(chunk)
            if size > max_bytes:
                target.close()
                os.remove(file_path)
                raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="PDF is too large")
            target.write(chunk)

    db.execute(update(Resume).where(Resume.user_id == user.id).values(is_active=False))
    resume = Resume(
        user_id=user.id,
        original_filename=file.filename or "resume.pdf",
        file_path=str(file_path),
        file_type="application/pdf",
        processing_status="pending",
        is_active=True,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    background_tasks.add_task(process_resume, resume.id)
    return resume


async def process_resume(resume_id: int) -> None:
    db = SessionLocal()
    try:
        resume = db.get(Resume, resume_id)
        if resume is None:
            return
        resume.processing_status = "processing"
        db.commit()
        text = extract_pdf_text(resume.file_path)
        profile = await ollama_service.extract_resume_profile(text)
        resume.extracted_text = text
        resume.extracted_skills = profile["skills"]
        resume.extracted_keywords = profile["keywords"]
        resume.extracted_job_titles = profile["job_titles"]
        resume.experience_level = profile["experience_level"]
        resume.processing_status = "completed"
        db.commit()
        user = db.get(User, resume.user_id)
        if user:
            recalculate_user_matches(db, user)
    except Exception:
        db.rollback()
        resume = db.get(Resume, resume_id)
        if resume:
            resume.processing_status = "failed"
            db.commit()
    finally:
        db.close()


def get_active_resume(db: Session, user: User) -> Resume | None:
    return db.scalar(select(Resume).where(Resume.user_id == user.id, Resume.is_active.is_(True)).order_by(Resume.created_at.desc()))
