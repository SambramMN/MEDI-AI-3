"""
MedSafe AI — Pydantic Schemas for Analytics
"""

from datetime import date
from typing import Optional

from pydantic import BaseModel


class MedicineSearchAnalytics(BaseModel):
    date: date
    medicine_id: str
    medicine_name: str
    generic_name: Optional[str] = None
    drug_class: Optional[str] = None
    search_count: int


class InteractionAnalytics(BaseModel):
    date: date
    medicine_a: str
    medicine_b: str
    severity: str
    alert_count: int


class SafetySummaryAnalytics(BaseModel):
    date: date
    total_checks: int
    interaction_alerts: int
    duplicate_alerts: int
    warning_alerts: int


class MedicineCategoryAnalytics(BaseModel):
    drug_class: str
    search_count: int
