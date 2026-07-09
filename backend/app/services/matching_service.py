from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User
from app.models.user_job_match import UserJobMatch
from app.utils.text_cleaner import normalize_text


def _contains(needle: str, haystack: str) -> bool:
    return normalize_text(needle) in haystack if needle else False


def _level(score: float) -> str:
    if score >= 70:
        return "strong"
    if score >= 50:
        return "good"
    return "weak"


def calculate_match(user: User, resume: Resume, job: Job) -> dict:
    job_text = normalize_text(f"{job.title} {job.description}")
    title_text = normalize_text(job.title)
    location_text = normalize_text(job.location)
    preferred_location = normalize_text(user.preferred_location)
    skills = resume.extracted_skills or []
    keywords = resume.extracted_keywords or []
    titles = resume.extracted_job_titles or []

    candidate_terms = skills + keywords
    matched_terms = [term for term in candidate_terms if _contains(term, job_text)]
    matched_skills = [skill for skill in skills if _contains(skill, job_text)]
    missing_skills = [skill for skill in skills if skill not in matched_skills][:12]
    matched_keywords = [keyword for keyword in keywords if _contains(keyword, job_text)]

    skill_score = (len(matched_terms) / max(len(candidate_terms), 1)) * 40
    title_score = 30 if any(_contains(title, title_text) or _contains(title_text, normalize_text(title)) for title in titles) else 0
    if preferred_location:
        location_score = 30 if preferred_location in location_text or "united states" in location_text else 12
    else:
        location_score = 20 if "united states" in location_text or "remote" in location_text else 12

    score = round(min(skill_score + title_score + location_score, 100), 2)
    return {
        "match_score": score,
        "match_level": _level(score),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "matched_keywords": matched_keywords,
        "match_reason": f"{_level(score).title()} match based on resume terms, target titles, and location preference.",
    }


def match_user_against_jobs(db: Session, user: User) -> int:
    resume = db.scalar(select(Resume).where(Resume.user_id == user.id, Resume.is_active.is_(True), Resume.processing_status == "completed"))
    if resume is None:
        return 0
    jobs = db.scalars(select(Job).where(Job.is_active.is_(True))).all()
    return _upsert_matches(db, user, resume, jobs)


def match_jobs_against_users(db: Session, jobs: list[Job]) -> int:
    if not jobs:
        return 0
    users = db.scalars(select(User).join(Resume).where(Resume.is_active.is_(True), Resume.processing_status == "completed")).unique().all()
    total = 0
    for user in users:
        resume = db.scalar(select(Resume).where(Resume.user_id == user.id, Resume.is_active.is_(True), Resume.processing_status == "completed"))
        if resume:
            total += _upsert_matches(db, user, resume, jobs)
    return total


def recalculate_user_matches(db: Session, user: User) -> int:
    db.execute(delete(UserJobMatch).where(UserJobMatch.user_id == user.id))
    db.flush()
    return match_user_against_jobs(db, user)


def _upsert_matches(db: Session, user: User, resume: Resume, jobs: list[Job]) -> int:
    count = 0
    for job in jobs:
        data = calculate_match(user, resume, job)
        existing = db.scalar(select(UserJobMatch).where(UserJobMatch.user_id == user.id, UserJobMatch.job_id == job.id))
        if existing is None:
            existing = UserJobMatch(user_id=user.id, job_id=job.id)
            db.add(existing)
        for key, value in data.items():
            setattr(existing, key, value)
        count += 1
    db.commit()
    return count


def get_user_match(db: Session, user: User, match_id: int) -> UserJobMatch | None:
    return db.scalar(
        select(UserJobMatch)
        .options(joinedload(UserJobMatch.job))
        .where(UserJobMatch.id == match_id, UserJobMatch.user_id == user.id)
    )
