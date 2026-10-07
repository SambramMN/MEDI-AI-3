"""
MedSafe AI — Safety Checker API Router
POST /api/safety/check
GET  /api/safety/history
"""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.schemas.safety import SafetyCheckRequest, SafetyCheckResponse
from app.services.safety_service import SafetyService
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/safety", tags=["Safety Checker"])


@router.post(
    "/check",
    response_model=SafetyCheckResponse,
    summary="Run a safety check on a medication combination",
)
def run_safety_check(
    payload: SafetyCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Run a full safety check for a medicine being added to an existing list.

    Checks for:
    - Known drug-drug interactions (from verified data)
    - Duplicate active ingredients

    **Status values:**
    - `no_known_issue` — No known interactions or duplicates found
    - `potential_interaction` — Known drug interaction(s) detected
    - `duplicate_ingredient` — Same active ingredient in multiple medicines
    - `warning` — General safety warning
    - `insufficient_information` — Data unavailable to complete the check

    **IMPORTANT:** Results are educational only. Always consult a healthcare professional.
    """
    service = SafetyService(db)
    return service.run_check(
        user_id=current_user.id,
        existing_medication_ids=payload.existing_medication_ids,
        new_medication_id=payload.new_medication_id,
    )


@router.get(
    "/history",
    summary="Get the authenticated user's safety check history",
)
def get_safety_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a summary of the user's past safety checks (most recent first)."""
    from app.models.models import SafetyCheck

    checks = (
        db.query(SafetyCheck)
        .filter(SafetyCheck.user_id == current_user.id)
        .order_by(SafetyCheck.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": c.id,
            "status": c.status,
            "result_summary": c.result_summary,
            "created_at": c.created_at.isoformat(),
            "alert_count": len(c.alerts),
        }
        for c in checks
    ]
