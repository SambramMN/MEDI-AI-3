"""
MedSafe AI — OCR Module

Extracts text from images and PDFs using Tesseract,
then attempts to match detected text against the medicine database.

IMPORTANT: Results always carry requires_confirmation=True.
The user MUST confirm before any OCR result is treated as medication data.
"""

import io
import os
import re
from pathlib import Path
from typing import List, Optional, Tuple

from PIL import Image
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.models import Medicine, ScannerResult
from app.schemas.scanner import DetectedMedicineCandidate, ScannerResponse
from app.utils.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)

# Set Tesseract path if provided in config
if settings.tesseract_cmd:
    try:
        import pytesseract
        pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd
    except ImportError:
        pass


class OCRProcessor:

    def __init__(self, db: Session):
        self.db = db

    def process_upload(
        self,
        file_bytes: bytes,
        filename: str,
        user_id: Optional[str] = None,
    ) -> ScannerResponse:
        """
        Main entry point: extract text, detect medicines, persist result.
        """
        # Save file
        file_ref = self._save_file(file_bytes, filename)

        # Extract text
        extracted_text, confidence = self._extract_text(file_bytes, filename)

        # Detect medicine candidates
        candidates = self._detect_medicines(extracted_text)

        # Persist result
        result = ScannerResult(
            user_id=user_id,
            file_reference=file_ref,
            extracted_text=extracted_text,
            detected_medicines=[c.model_dump() for c in candidates],
            confidence=confidence,
        )
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)

        return ScannerResponse(
            result_id=result.id,
            extracted_text=extracted_text,
            detected_medicines=candidates,
            overall_confidence=confidence,
            requires_confirmation=True,
            created_at=result.created_at,
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _save_file(self, file_bytes: bytes, original_filename: str) -> str:
        """Save upload to configured directory, return stored filename."""
        upload_dir = Path(settings.upload_dir)
        upload_dir.mkdir(parents=True, exist_ok=True)
        safe_name = re.sub(r"[^a-zA-Z0-9._-]", "_", original_filename)
        import uuid as _uuid
        stored_name = f"{_uuid.uuid4()}_{safe_name}"
        (upload_dir / stored_name).write_bytes(file_bytes)
        return stored_name

    def _extract_text(self, file_bytes: bytes, filename: str) -> Tuple[str, float]:
        """
        Run Tesseract OCR on the provided file bytes.
        Returns (text, confidence_0_to_1).
        """
        try:
            import pytesseract
            from pytesseract import Output

            lower = filename.lower()

            if lower.endswith(".pdf"):
                text, confidence = self._extract_from_pdf(file_bytes)
            else:
                image = Image.open(io.BytesIO(file_bytes))
                # Pre-process: convert to grayscale for better accuracy
                image = image.convert("L")
                data = pytesseract.image_to_data(
                    image,
                    lang=settings.ocr_language,
                    output_type=Output.DICT,
                )
                text = pytesseract.image_to_string(image, lang=settings.ocr_language)
                # Calculate mean confidence of non-negative confidence values
                confs = [int(c) for c in data["conf"] if int(c) > 0]
                confidence = (sum(confs) / len(confs) / 100.0) if confs else 0.0

            return text.strip(), round(confidence, 4)

        except ImportError:
            logger.warning("pytesseract_not_installed")
            return "", 0.0
        except Exception as exc:
            logger.error("ocr_extraction_failed", error=str(exc))
            return "", 0.0

    def _extract_from_pdf(self, file_bytes: bytes) -> Tuple[str, float]:
        """Convert PDF pages to images then OCR each page."""
        try:
            from pdf2image import convert_from_bytes
            import pytesseract
            from pytesseract import Output

            images = convert_from_bytes(file_bytes, dpi=200)
            all_text = []
            all_confs = []

            for image in images:
                image = image.convert("L")
                data = pytesseract.image_to_data(
                    image,
                    lang=settings.ocr_language,
                    output_type=Output.DICT,
                )
                page_text = pytesseract.image_to_string(image, lang=settings.ocr_language)
                all_text.append(page_text)
                confs = [int(c) for c in data["conf"] if int(c) > 0]
                all_confs.extend(confs)

            text = "\n\n--- Page Break ---\n\n".join(all_text)
            confidence = (sum(all_confs) / len(all_confs) / 100.0) if all_confs else 0.0
            return text, confidence

        except ImportError:
            logger.warning("pdf2image_not_installed")
            return "", 0.0

    def _detect_medicines(self, text: str) -> List[DetectedMedicineCandidate]:
        """
        Attempt to match words/phrases in OCR text against the medicine database.
        Returns candidates; always marks requires_confirmation=True.
        """
        if not text:
            return []

        candidates: List[DetectedMedicineCandidate] = []
        seen_ids = set()

        # Tokenize: look at single words and 2-gram phrases
        words = re.findall(r"[A-Za-z][A-Za-z0-9\-]{2,}", text)
        phrases = words + [
            f"{words[i]} {words[i+1]}" for i in range(len(words) - 1)
        ]

        from sqlalchemy import func, or_

        for phrase in phrases:
            if len(phrase) < 3:
                continue
            phrase_lower = phrase.lower()

            match: Optional[Medicine] = (
                self.db.query(Medicine)
                .filter(
                    or_(
                        func.lower(Medicine.brand_name) == phrase_lower,
                        func.lower(Medicine.generic_name) == phrase_lower,
                    )
                )
                .first()
            )

            if match and match.id not in seen_ids:
                seen_ids.add(match.id)
                candidates.append(
                    DetectedMedicineCandidate(
                        detected_text=phrase,
                        matched_medicine_id=match.id,
                        matched_medicine_name=match.brand_name or match.generic_name,
                        confidence=0.75,  # heuristic; exact name match
                        requires_confirmation=True,
                    )
                )

        # Limit to top 10 candidates
        return candidates[:10]
