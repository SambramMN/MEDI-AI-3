"""
MedSafe AI — FastAPI dependency: current authenticated user.
"""

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.utils.security import decode_token
from app.utils.responses import Unauthorized


def get_current_user(
    authorization: str = Header(..., description="Bearer <token>"),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that validates the JWT Bearer token
    and returns the authenticated User ORM object.
    """
    if not authorization.startswith("Bearer "):
        raise Unauthorized("Token must use Bearer scheme.")

    token = authorization[7:]
    token_data = decode_token(token)
    if not token_data:
        raise Unauthorized("Token is invalid or has expired.")

    user = db.query(User).filter(User.id == token_data.sub, User.is_active == True).first()
    if not user:
        raise Unauthorized("User account not found or is inactive.")

    return user


def get_optional_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> "User | None":
    """Like get_current_user but returns None instead of raising for public endpoints."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization[7:]
    token_data = decode_token(token)
    if not token_data:
        return None
    return db.query(User).filter(User.id == token_data.sub, User.is_active == True).first()
