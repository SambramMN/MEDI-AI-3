"""
MedSafe AI — Pydantic Schemas for Users
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class UserProfileUpdate(BaseModel):
    age: Optional[int] = Field(None, ge=0, le=130)
    allergies: Optional[List[str]] = None
    existing_conditions: Optional[List[str]] = None


class UserProfileResponse(BaseModel):
    user_id: str
    age: Optional[int] = None
    allergies: Optional[List[str]] = None
    existing_conditions: Optional[List[str]] = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserDetailResponse(BaseModel):
    id: str
    name: str
    email: str
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileResponse] = None

    model_config = {"from_attributes": True}


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
