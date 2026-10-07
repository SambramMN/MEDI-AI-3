"""
MedSafe AI — Medications API Router (User's saved medication list)
POST   /api/medications
GET    /api/medications
DELETE /api/medications/{id}
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Medication, User
from app.schemas.medications import MedicationCreate, MedicationResponse
from app.services.medicine_service import MedicineService
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/medications", tags=["Medications"])


@router.post(
    "",
    response_model=MedicationResponse,
    status_code=201,
    summary="Add a medicine to your medication list",
)
def add_medication(
    payload: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add a medicine to the authenticated user's medication list.

    - **medicine_id**: Optional — the verified DB medicine ID
    - **entered_name**: What the user typed (always stored as-is)
    - **formulation**: Optional dosage form (e.g. tablet, syrup)
    - **user_notes**: Optional personal notes

    No sensitive medical history is required.
    """
    medication = Medication(
        user_id=current_user.id,
        medicine_id=payload.medicine_id,
        entered_name=payload.entered_name,
        formulation=payload.formulation,
        user_notes=payload.user_notes,
    )
    db.add(medication)
    db.commit()
    db.refresh(medication)
    return _to_response(medication)


@router.get(
    "",
    response_model=List[MedicationResponse],
    summary="Get your medication list",
)
def get_medications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all medications saved by the authenticated user."""
    medications = (
        db.query(Medication)
        .filter(Medication.user_id == current_user.id)
        .order_by(Medication.created_at.desc())
        .all()
    )
    return [_to_response(m) for m in medications]


@router.delete(
    "/{medication_id}",
    status_code=204,
    summary="Remove a medication from your list",
)
def delete_medication(
    medication_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Remove a medicine from the authenticated user's medication list.
    Users can only delete their own medications.
    """
    medication = (
        db.query(Medication)
        .filter(
            Medication.id == medication_id,
            Medication.user_id == current_user.id,
        )
        .first()
    )
    if not medication:
        raise HTTPException(
            status_code=404,
            detail={"code": "MEDICATION_NOT_FOUND", "message": "Medication not found."},
        )
    db.delete(medication)
    db.commit()


# ---------------------------------------------------------------------------
# Mapper
# ---------------------------------------------------------------------------

def _to_response(m: Medication) -> MedicationResponse:
    from app.schemas.medicines import MedicineSearchResult

    medicine_out = None
    if m.medicine:
        medicine_out = MedicineSearchResult(
            id=m.medicine.id,
            brand_name=m.medicine.brand_name,
            generic_name=m.medicine.generic_name,
            active_ingredients=m.medicine.active_ingredients or [],
            drug_class=m.medicine.drug_class,
            dosage_form=m.medicine.dosage_form,
        )

    return MedicationResponse(
        id=m.id,
        medicine_id=m.medicine_id,
        entered_name=m.entered_name,
        formulation=m.formulation,
        user_notes=m.user_notes,
        created_at=m.created_at,
        medicine=medicine_out,
    )
