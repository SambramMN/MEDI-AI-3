"""
MedSafe AI — OpenFDA Data Importer

Fetches medicine data from the OpenFDA Drug Label API and seeds
the local medicines table. Run this once to populate the database.

Usage:
    python -m app.utils.data_importer --limit 1000

Data source: https://open.fda.gov/apis/drug/label/
License: Public domain (US Government works, OpenFDA)
"""

import argparse
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.models import Medicine
from app.utils.logging import get_logger, setup_logging

setup_logging()
logger = get_logger(__name__)

OPENFDA_BASE = "https://api.fda.gov/drug/label.json"


def fetch_labels(skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """Fetch a page of drug labels from OpenFDA."""
    params = {
        "search": 'openfda.product_type:"HUMAN PRESCRIPTION DRUG" OR openfda.product_type:"HUMAN OTC DRUG"',
        "skip": skip,
        "limit": limit,
    }
    try:
        response = httpx.get(OPENFDA_BASE, params=params, timeout=30)
        response.raise_for_status()
        return response.json().get("results", [])
    except Exception as exc:
        logger.error("openfda_fetch_failed", error=str(exc), skip=skip)
        return []


def _extract_text(field: Any) -> Optional[str]:
    """Safely extract text from OpenFDA array field."""
    if isinstance(field, list):
        return " ".join(field)
    if isinstance(field, str):
        return field
    return None


def import_label(db: Session, label: Dict[str, Any]) -> Optional[Medicine]:
    """Convert an OpenFDA label to a Medicine row."""
    openfda = label.get("openfda", {})

    brand_names = openfda.get("brand_name", [])
    generic_names = openfda.get("generic_name", [])
    substance_names = openfda.get("substance_name", [])

    brand_name = brand_names[0].title() if brand_names else None
    generic_name = (generic_names[0] if generic_names else substance_names[0] if substance_names else None)

    if not generic_name and not brand_name:
        return None

    generic_name = generic_name or brand_name
    active_ingredients = [s.lower() for s in substance_names] if substance_names else []

    drug_classes = openfda.get("pharm_class_epc", [])
    drug_class = drug_classes[0] if drug_classes else None

    dosage_form = _extract_text(openfda.get("dosage_form"))

    medicine = Medicine(
        id=str(uuid.uuid4()),
        brand_name=brand_name,
        generic_name=generic_name.lower(),
        active_ingredients=active_ingredients,
        drug_class=drug_class,
        dosage_form=dosage_form,
        description=_extract_text(label.get("description")),
        uses=_extract_text(label.get("indications_and_usage")),
        mechanism=_extract_text(label.get("mechanism_of_action")),
        side_effects=_extract_text(label.get("adverse_reactions")),
        warnings=_extract_text(label.get("warnings")),
        contraindications=_extract_text(label.get("contraindications")),
        storage_information=_extract_text(label.get("storage_and_handling")),
        source="OpenFDA Drug Label API",
        source_url="https://open.fda.gov/apis/drug/label/",
        last_verified=datetime.now(timezone.utc),
    )
    return medicine


def run_import(total: int = 1000) -> None:
    """Import up to `total` medicines from OpenFDA."""
    db: Session = SessionLocal()
    try:
        imported = 0
        skip = 0
        batch_size = 100

        while imported < total:
            labels = fetch_labels(skip=skip, limit=min(batch_size, total - imported))
            if not labels:
                break

            for label in labels:
                medicine = import_label(db, label)
                if medicine:
                    # Avoid duplicates on re-run
                    existing = db.query(Medicine).filter(
                        Medicine.generic_name == medicine.generic_name,
                        Medicine.brand_name == medicine.brand_name,
                    ).first()
                    if not existing:
                        db.add(medicine)
                        imported += 1

            db.commit()
            skip += batch_size
            logger.info("import_progress", imported=imported, total=total)

    finally:
        db.close()
    logger.info("import_complete", total_imported=imported)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import medicine data from OpenFDA")
    parser.add_argument("--limit", type=int, default=500, help="Number of medicines to import")
    args = parser.parse_args()
    run_import(args.limit)
