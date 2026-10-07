"""
MedSafe AI — OCR Scanner API Router
POST /api/scanner/upload
GET  /api/scanner/{result_id}
"""

import io
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.models import ScannerResult, User
from app.ocr.processor import OCRProcessor
from app.schemas.scanner import ScannerResponse
from app.utils.dependencies import get_current_user, get_optional_user

settings = get_settings()
router = APIRouter(prefix="/api/scanner", tags=["OCR Scanner"])

ALLOWED_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/tiff", "application/pdf"
}


@router.post(
    "/upload",
    response_model=ScannerResponse,
    summary="Upload an image or PDF to extract medicine names",
)
async def upload_scan(
    file: UploadFile = File(..., description="Image (JPEG/PNG/TIFF/WebP) or PDF"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Upload a medicine packet image or PDF for OCR processing.

    The system will:
    1. Extract text using OCR (Tesseract)
    2. Attempt to match detected words against the medicine database
    3. Return candidate matches with confidence scores

    **IMPORTANT:**
    - OCR results are NOT automatically added to your medication list
    - All detected medicines require manual confirmation
    - `requires_confirmation: true` is always set in the response
    """
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail={
                "code": "UNSUPPORTED_FILE_TYPE",
                "message": f"Supported types: JPEG, PNG, WebP, TIFF, PDF. Got: {file.content_type}",
            },
        )

    # Validate file size
    file_bytes = await file.read()
    if len(file_bytes) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=413,
            detail={
                "code": "FILE_TOO_LARGE",
                "message": f"Maximum file size is {settings.max_upload_size_mb} MB.",
            },
        )

    user_id = current_user.id if current_user else None
    processor = OCRProcessor(db)
    return processor.process_upload(file_bytes, file.filename or "upload", user_id)


@router.get(
    "/{result_id}",
    response_model=ScannerResponse,
    summary="Retrieve a previous OCR scan result",
)
def get_scan_result(
    result_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a previously processed OCR scan by ID."""
    result = (
        db.query(ScannerResult)
        .filter(
            ScannerResult.id == result_id,
            ScannerResult.user_id == current_user.id,
        )
        .first()
    )
    if not result:
        raise HTTPException(
            status_code=404,
            detail={"code": "SCAN_NOT_FOUND", "message": "Scan result not found."},
        )

    from app.schemas.scanner import DetectedMedicineCandidate

    detected = [
        DetectedMedicineCandidate(**d) if isinstance(d, dict) else d
        for d in (result.detected_medicines or [])
    ]

    return ScannerResponse(
        result_id=result.id,
        extracted_text=result.extracted_text or "",
        detected_medicines=detected,
        overall_confidence=result.confidence or 0.0,
        requires_confirmation=True,
        created_at=result.created_at,
    )
