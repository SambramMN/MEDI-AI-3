"""
MedSafe AI — Safety Checker Service

Orchestrates interaction engine + duplicate ingredient engine.
Persists results to the safety_checks / safety_alerts tables.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.models import Medicine, Medication, SafetyAlert, SafetyCheck
from app.safety.interaction_engine import InteractionEngine, SEVERITY_RANK
from app.safety.duplicate_engine import DuplicateIngredientEngine
from app.schemas.safety import (
    DuplicateIngredientAlert,
    InteractionAlert,
    SafetyCheckResponse,
)
from app.utils.logging import get_logger

logger = get_logger(__name__)


class SafetyService:

    def __init__(self, db: Session):
        self.db = db
        self._interaction_engine = InteractionEngine(db)
        self._duplicate_engine = DuplicateIngredientEngine(db)

    def run_check(
        self,
        user_id: str,
        existing_medication_ids: List[str],
        new_medication_id: str,
    ) -> SafetyCheckResponse:
        """
        Run a full safety check and persist results.
        """
        all_medicine_ids = self._resolve_medicine_ids(
            existing_medication_ids, new_medication_id
        )

        interactions = self._interaction_engine.check_interactions(all_medicine_ids)
        duplicates = self._duplicate_engine.check_duplicates(all_medicine_ids)

        status = self._determine_status(interactions, duplicates)
        overall_severity = self._worst_severity(interactions)

        # Collect all unique source references
        sources = list(
            {alert.source for alert in interactions if alert.source}
            | {d.source for d in duplicates if d.source}
        )

        # Persist check record
        check = SafetyCheck(
            user_id=user_id,
            status=status,
            result_summary=f"{len(interactions)} interaction(s), {len(duplicates)} duplicate ingredient(s) detected.",
        )
        self.db.add(check)
        self.db.flush()  # get check.id before persisting alerts

        for alert in interactions:
            self.db.add(SafetyAlert(
                safety_check_id=check.id,
                alert_type="interaction",
                severity=alert.severity,
                medicine_a=alert.medicine_a,
                medicine_b=alert.medicine_b,
                description=alert.description,
                recommendation=alert.recommendation,
                source=alert.source,
            ))

        for dup in duplicates:
            self.db.add(SafetyAlert(
                safety_check_id=check.id,
                alert_type="duplicate_ingredient",
                severity="warning",
                medicine_a=dup.ingredient,
                description=dup.description,
                recommendation=(
                    "Consult a pharmacist or physician about taking multiple "
                    "medicines containing this ingredient."
                ),
                source=dup.source,
            ))

        self.db.commit()
        self.db.refresh(check)

        return SafetyCheckResponse(
            check_id=check.id,
            status=status,
            overall_severity=overall_severity,
            interactions=interactions,
            duplicate_ingredients=duplicates,
            warnings=self._build_warnings(interactions, duplicates),
            source_references=sources,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _resolve_medicine_ids(
        self, existing_medication_ids: List[str], new_medication_id: str
    ) -> List[str]:
        """
        Resolve medication IDs → their linked medicine IDs.
        Falls back to direct medicine ID lookup.
        """
        ids: List[str] = []

        # Try to treat as medication IDs first
        for med_id in existing_medication_ids + [new_medication_id]:
            med = self.db.query(Medication).filter(Medication.id == med_id).first()
            if med and med.medicine_id:
                ids.append(med.medicine_id)
            else:
                # Treat as direct medicine ID
                medicine = self.db.query(Medicine).filter(Medicine.id == med_id).first()
                if medicine:
                    ids.append(medicine.id)

        return list(dict.fromkeys(ids))  # deduplicate preserving order

    @staticmethod
    def _determine_status(
        interactions: List[InteractionAlert],
        duplicates: List[DuplicateIngredientAlert],
    ) -> str:
        if any(i.severity in ("high", "contraindicated") for i in interactions):
            return "potential_interaction"
        if interactions:
            return "potential_interaction"
        if duplicates:
            return "duplicate_ingredient"
        return "no_known_issue"

    @staticmethod
    def _worst_severity(interactions: List[InteractionAlert]) -> Optional[str]:
        if not interactions:
            return None
        return max(interactions, key=lambda i: SEVERITY_RANK.get(i.severity, 0)).severity

    @staticmethod
    def _build_warnings(
        interactions: List[InteractionAlert],
        duplicates: List[DuplicateIngredientAlert],
    ) -> List[str]:
        warnings = []
        for i in interactions:
            if i.severity in ("high", "contraindicated"):
                warnings.append(
                    f"⚠️ {i.severity.upper()}: {i.medicine_a} + {i.medicine_b} — {i.recommendation}"
                )
        for d in duplicates:
            warnings.append(
                f"⚠️ Duplicate ingredient '{d.ingredient}' found in: {', '.join(d.found_in)}"
            )
        return warnings
