"""
MedSafe AI — Medicines API Router
GET /api/medicines/search
GET /api/medicines/{medicine_id}
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.schemas.medicines import MedicineDetail, MedicineSearchResponse
from app.services.medicine_service import MedicineService
from app.utils.dependencies import get_optional_user

router = APIRouter(prefix="/api/medicines", tags=["Medicines"])


@router.get(
    "/search",
    response_model=MedicineSearchResponse,
    summary="Search medicines by brand name, generic name, or active ingredient",
)
def search_medicines(
    q: str = Query(..., min_length=2, description="Search query"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Search the medicine database.

    Searches across:
    - Brand names
    - Generic names
    - Active ingredients

    Returns paginated results.
    """
    user_id = current_user.id if current_user else None
    return MedicineService.search_medicines(db, q, page, limit, user_id)


@router.get(
    "/{medicine_id}",
    response_model=MedicineDetail,
    summary="Get complete verified medicine information",
)
def get_medicine(medicine_id: str, db: Session = Depends(get_db)):
    """
    Retrieve full medicine details by ID.

    Returns:
    - Description and uses
    - Mechanism of action
    - Side effects and warnings
    - Contraindications
    - Storage information
    - Verified source information

    All information is sourced from verified medical databases.
    """
    return MedicineService.get_medicine_detail(db, medicine_id)
