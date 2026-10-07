"""
MedSafe AI — Pydantic Schemas for Medicines
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MedicineSearchResult(BaseModel):
    id: str
    brand_name: Optional[str] = None
    generic_name: str
    active_ingredients: Optional[List[str]] = None
    drug_class: Optional[str] = None
    dosage_form: Optional[str] = None

    model_config = {"from_attributes": True}


class MedicineDetail(BaseModel):
    id: str
    brand_name: Optional[str] = None
    generic_name: str
    active_ingredients: Optional[List[str]] = None
    drug_class: Optional[str] = None
    dosage_form: Optional[str] = None
    description: Optional[str] = None
    uses: Optional[str] = None
    mechanism: Optional[str] = None
    side_effects: Optional[str] = None
    warnings: Optional[str] = None
    contraindications: Optional[str] = None
    storage_information: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    last_verified: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MedicineSearchResponse(BaseModel):
    results: List[MedicineSearchResult]
    total: int
    page: int
    limit: int
    query: str
