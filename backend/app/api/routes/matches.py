from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.user_job_match import UserJobMatch
from app.schemas.match import MatchRead, MatchStatusUpdate
from app.services.matching_service import get_user_match, recalculate_user_matches

router = APIRouter()


@router.get("", response_model=list[MatchRead])
async def list_matches(
    level: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(UserJobMatch)
        .options(joinedload(UserJobMatch.job))
        .where(UserJobMatch.user_id == current_user.id)
        .order_by(UserJobMatch.match_score.desc(), UserJobMatch.created_at.desc())
    )
    if level:
        stmt = stmt.where(UserJobMatch.match_level == level)
    if status:
        stmt = stmt.where(UserJobMatch.status == status)
    return db.scalars(stmt.limit(200)).unique().all()


@router.get("/{match_id}", response_model=MatchRead)
async def get_match(match_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    match = get_user_match(db, current_user, match_id)
    if match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.patch("/{match_id}/status", response_model=MatchRead)
async def update_match_status(
    match_id: int,
    payload: MatchStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.status not in {"new", "saved", "applied", "ignored"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    match = get_user_match(db, current_user, match_id)
    if match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    match.status = payload.status
    db.commit()
    db.refresh(match)
    return get_user_match(db, current_user, match_id)


@router.post("/recalculate")
async def recalculate(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"matched": recalculate_user_matches(db, current_user)}
