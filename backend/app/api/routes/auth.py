from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse
from app.schemas.user import UserRead
from app.services.auth_service import authenticate_user, create_user

router = APIRouter()


@router.post("/signup", response_model=UserRead)
async def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    return create_user(db, payload)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return TokenResponse(access_token=authenticate_user(db, payload))


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
