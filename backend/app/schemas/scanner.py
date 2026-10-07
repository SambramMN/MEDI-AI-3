"""
MedSafe AI — Pydantic Schemas for OCR Scanner
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class DetectedMedicineCandidate(BaseModel):
    detected_text: str
    matched_medicine_id: Optional[str] = None
    matched_medicine_name: Optional[str] = None
    confidence: float
    requires_confirmation: bool = True


class ScannerResponse(BaseModel):
    result_id: str
    extracted_text: str
    detected_medicines: List[DetectedMedicineCandidate]
    overall_confidence: float
    requires_confirmation: bool = True
    created_at: datetime
    notice: str = (
        "OCR results are not confirmed medication data. "
        "Please review and confirm each detected medicine before using it."
    )
