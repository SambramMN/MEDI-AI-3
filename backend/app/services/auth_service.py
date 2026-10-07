"""
MedSafe AI — Authentication Service
"""

from sqlalchemy.orm import Session

from app.models.models import User
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.responses import Unauthorized
from app.config import get_settings
from fastapi import HTTPException

settings = get_settings()


class AuthService:

    @staticmethod
    def register(db: Session, payload: UserRegisterRequest) -> User:
        """Register a new user.  Raises 409 if email already exists."""
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(
                status_code=409,
                detail={"code": "EMAIL_TAKEN", "message": "An account with this email already exists."},
            )
        user = User(
            name=payload.name,
            email=payload.email,
            password_hash=hash_password(payload.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login(db: Session, payload: UserLoginRequest) -> TokenResponse:
        """Validate credentials and return a JWT token."""
        user = db.query(User).filter(User.email == payload.email).first()
        if not user or not verify_password(payload.password, user.password_hash):
            raise Unauthorized("Invalid email or password.")
        if not user.is_active:
            raise Unauthorized("Account is deactivated.")

        token = create_access_token(user.id, user.email)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
        )
