"""
MedSafe AI — Drug Interaction Engine

Checks pairs of medicines for known interactions using structured
database data only. Never invents interactions.
"""

from itertools import combinations
from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.models import Medicine, MedicineInteraction
from app.schemas.safety import InteractionAlert
from app.utils.logging import get_logger

logger = get_logger(__name__)

# Severity rank for determining the worst-case overall severity
SEVERITY_RANK = {
    "low": 1,
    "moderate": 2,
    "high": 3,
    "contraindicated": 4,
}


class InteractionEngine:
    """
    Queries structured interaction data for a set of medicine IDs.
    Returns only verified interactions — never fabricated data.
    """

    def __init__(self, db: Session):
        self.db = db

    def check_interactions(
        self,
        medicine_ids: List[str],
    ) -> List[InteractionAlert]:
        """
        Check all pairs of the provided medicine IDs for known interactions.
        Returns a list of InteractionAlert objects.
        """
        alerts: List[InteractionAlert] = []

        if len(medicine_ids) < 2:
            return alerts

        # Generate all unique pairs
        pairs = list(combinations(medicine_ids, 2))

        for id_a, id_b in pairs:
            interaction = self._query_interaction(id_a, id_b)
            if interaction:
                alert = self._build_alert(interaction)
                alerts.append(alert)
                logger.info(
                    "interaction_detected",
                    medicine_a=alert.medicine_a,
                    medicine_b=alert.medicine_b,
                    severity=alert.severity,
                )

        return alerts

    def _query_interaction(
        self, id_a: str, id_b: str
    ) -> Optional[MedicineInteraction]:
        """
        Query for an interaction between two medicines (in either order).
        """
        return (
            self.db.query(MedicineInteraction)
            .filter(
                or_(
                    (MedicineInteraction.medicine_a_id == id_a)
                    & (MedicineInteraction.medicine_b_id == id_b),
                    (MedicineInteraction.medicine_a_id == id_b)
                    & (MedicineInteraction.medicine_b_id == id_a),
                )
            )
            .first()
        )

    def _build_alert(self, interaction: MedicineInteraction) -> InteractionAlert:
        med_a_name = (
            interaction.medicine_a_rel.brand_name
            or interaction.medicine_a_rel.generic_name
        )
        med_b_name = (
            interaction.medicine_b_rel.brand_name
            or interaction.medicine_b_rel.generic_name
        )

        description = interaction.description or (
            "Interaction information could not be verified. "
            "Please consult a healthcare professional."
        )
        recommendation = interaction.recommendation or (
            "Consult a doctor or pharmacist before taking these medicines together."
        )

        return InteractionAlert(
            alert_type="interaction",
            severity=interaction.severity,
            medicine_a=med_a_name,
            medicine_b=med_b_name,
            description=description,
            recommendation=recommendation,
            source=interaction.source,
            source_url=interaction.source_url,
        )
