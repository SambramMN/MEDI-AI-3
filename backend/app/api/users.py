"""
MedSafe AI — Users API Router
GET    /api/users/profile
PUT    /api/users/profile
POST   /api/users/change-password
DELETE /api/users/account
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, UserProfile
from app.schemas.users import (
    PasswordChangeRequest,
    UserDetailResponse,
    UserProfileResponse,
    UserProfileUpdate,
)
from app.utils.dependencies import get_current_user
from app.utils.security import hash_password, verify_password

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get(
    "/profile",
    response_model=UserDetailResponse,
    summary="Get the current user's full profile",
)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the authenticated user's account and profile information."""
    profile_out = None
    if current_user.profile:
        p = current_user.profile
        profile_out = UserProfileResponse(
            user_id=p.user_id,
            age=p.age,
            allergies=p.allergies or [],
            existing_conditions=p.existing_conditions or [],
            updated_at=p.updated_at,
        )
    return UserDetailResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        profile=profile_out,
    )


@router.put(
    "/profile",
    response_model=UserProfileResponse,
    summary="Update health profile (optional)",
)
def update_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the authenticated user's optional health profile.

    All fields are optional.  Profile data is used only to provide
    more relevant safety information — it is never shared with analytics.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    if payload.age is not None:
        profile.age = payload.age
    if payload.allergies is not None:
        profile.allergies = payload.allergies
    if payload.existing_conditions is not None:
        profile.existing_conditions = payload.existing_conditions

    db.commit()
    db.refresh(profile)

    return UserProfileResponse(
        user_id=profile.user_id,
        age=profile.age,
        allergies=profile.allergies or [],
        existing_conditions=profile.existing_conditions or [],
        updated_at=profile.updated_at,
    )


@router.post(
    "/change-password",
    status_code=200,
    summary="Change the authenticated user's password",
)
def change_password(
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_PASSWORD", "message": "Current password is incorrect."},
        )
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"success": True, "message": "Password changed successfully."}


@router.delete(
    "/account",
    status_code=200,
    summary="Deactivate the authenticated user's account",
)
def deactivate_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft-delete the account by setting is_active=False."""
    current_user.is_active = False
    db.commit()
    return {"success": True, "message": "Account deactivated successfully."}
