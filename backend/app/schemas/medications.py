"""
MedSafe AI — Pydantic Schemas for Medications (user's saved list)
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.medicines import MedicineSearchResult


class MedicationCreate(BaseModel):
    medicine_id: Optional[str] = Field(
        None, description="Matched medicine DB ID (optional if only entered_name given)"
    )
    entered_name: str = Field(..., min_length=1, max_length=255)
    formulation: Optional[str] = Field(None, max_length=100)
    user_notes: Optional[str] = Field(None, max_length=1000)


class MedicationResponse(BaseModel):
    id: str
    medicine_id: Optional[str] = None
    entered_name: str
    formulation: Optional[str] = None
    user_notes: Optional[str] = None
    created_at: datetime
    medicine: Optional[MedicineSearchResult] = None

    model_config = {"from_attributes": True}
