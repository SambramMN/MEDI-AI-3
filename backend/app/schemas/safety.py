"""
MedSafe AI — Pydantic Schemas for Safety Checker
"""

from typing import List, Optional

from pydantic import BaseModel


class SafetyCheckRequest(BaseModel):
    existing_medication_ids: List[str]
    new_medication_id: str


class InteractionAlert(BaseModel):
    alert_type: str = "interaction"
    severity: str  # low | moderate | high | contraindicated
    medicine_a: str
    medicine_b: str
    description: str
    recommendation: str
    source: Optional[str] = None
    source_url: Optional[str] = None


class DuplicateIngredientAlert(BaseModel):
    alert_type: str = "duplicate_ingredient"
    severity: str = "warning"
    ingredient: str
    found_in: List[str]  # medicine names
    description: str
    source: Optional[str] = None


class SafetyCheckResponse(BaseModel):
    check_id: str
    status: str  # no_known_issue | potential_interaction | duplicate_ingredient | warning | insufficient_information
    overall_severity: Optional[str] = None
    interactions: List[InteractionAlert] = []
    duplicate_ingredients: List[DuplicateIngredientAlert] = []
    warnings: List[str] = []
    source_references: List[str] = []
    disclaimer: str = (
        "This information is for educational purposes only. "
        "Always consult a qualified healthcare professional before making any medication decisions."
    )
