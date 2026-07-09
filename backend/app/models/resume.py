from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(80), default="application/pdf")
    extracted_text: Mapped[str | None] = mapped_column(Text)
    extracted_skills: Mapped[list[str]] = mapped_column(JSONB, default=list)
    extracted_keywords: Mapped[list[str]] = mapped_column(JSONB, default=list)
    extracted_job_titles: Mapped[list[str]] = mapped_column(JSONB, default=list)
    experience_level: Mapped[str | None] = mapped_column(String(80))
    processing_status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="resumes")
