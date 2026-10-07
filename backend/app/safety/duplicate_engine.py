"""
MedSafe AI — Duplicate Active Ingredient Engine

Detects when two or more medicines in a user's list share
the same active ingredient. Does NOT calculate or suggest dosage.
"""

from collections import defaultdict
from typing import List

from sqlalchemy.orm import Session

from app.models.models import Medicine
from app.schemas.safety import DuplicateIngredientAlert
from app.utils.logging import get_logger

logger = get_logger(__name__)


def _normalize_ingredient(name: str) -> str:
    """Lowercase and strip whitespace for comparison."""
    return name.strip().lower()


class DuplicateIngredientEngine:
    """
    Checks a list of medicines for shared active ingredients.
    Uses only database-sourced ingredient data.
    """

    def __init__(self, db: Session):
        self.db = db

    def check_duplicates(self, medicine_ids: List[str]) -> List[DuplicateIngredientAlert]:
        """
        Returns a list of DuplicateIngredientAlert for every ingredient
        found in more than one medicine.
        """
        alerts: List[DuplicateIngredientAlert] = []

        if not medicine_ids:
            return alerts

        medicines = (
            self.db.query(Medicine)
            .filter(Medicine.id.in_(medicine_ids))
            .all()
        )

        # Map: normalized_ingredient -> list of medicine display names
        ingredient_map: dict = defaultdict(list)

        for med in medicines:
            ingredients = med.active_ingredients
            if not ingredients:
                continue
            if isinstance(ingredients, str):
                # Fallback: treat comma-separated string
                ingredients = [i.strip() for i in ingredients.split(",")]

            display_name = med.brand_name or med.generic_name

            for raw_ingredient in ingredients:
                normalized = _normalize_ingredient(raw_ingredient)
                ingredient_map[normalized].append(display_name)

        # Flag duplicates
        for ingredient, medicine_names in ingredient_map.items():
            # Deduplicate medicine names while preserving order
            seen = []
            for n in medicine_names:
                if n not in seen:
                    seen.append(n)
            if len(seen) > 1:
                alerts.append(
                    DuplicateIngredientAlert(
                        alert_type="duplicate_ingredient",
                        severity="warning",
                        ingredient=ingredient.title(),
                        found_in=seen,
                        description=(
                            f"The active ingredient '{ingredient.title()}' appears in "
                            f"{len(seen)} of your medicines: {', '.join(seen)}. "
                            "Taking multiple medicines containing the same active ingredient "
                            "may increase the risk of side effects."
                        ),
                        source="MedSafe AI — Active Ingredient Database",
                    )
                )
                logger.info(
                    "duplicate_ingredient_detected",
                    ingredient=ingredient,
                    medicines=seen,
                )

        return alerts
