"""
MedSafe AI — Auth API Router
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.utils.dependencies import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
    summary="Register a new user account",
)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Create a new user account.

    - **name**: Display name
    - **email**: Unique email address
    - **password**: Minimum 8 characters
    """
    user = AuthService.register(db, payload)
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        is_active=user.is_active,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive a JWT access token",
)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate with email and password.
    Returns a Bearer JWT token valid for the configured expiry period.
    """
    return AuthService.login(db, payload)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the currently authenticated user",
)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the profile of the authenticated user."""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        is_active=current_user.is_active,
    )
