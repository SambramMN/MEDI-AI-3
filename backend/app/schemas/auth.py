"""
MedSafe AI — Pydantic Schemas for Authentication
"""

from pydantic import BaseModel, Field

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, examples=["Jane Smith"])
    email: str = Field(..., pattern=EMAIL_REGEX, max_length=255, examples=["jane.smith@example.com"])
    password: str = Field(..., min_length=8, max_length=128, examples=["SecureP@ss1"])


class UserLoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX, max_length=255, examples=["jane.smith@example.com"])
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class TokenData(BaseModel):
    """Internal: decoded JWT payload."""
    sub: str  # user id
    email: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    is_active: bool

    model_config = {"from_attributes": True}
