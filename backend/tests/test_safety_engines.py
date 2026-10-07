"""
MedSafe AI — Interaction & Duplicate Ingredient Engine Tests
"""

import uuid
import pytest

from app.safety.interaction_engine import InteractionEngine
from app.safety.duplicate_engine import DuplicateIngredientEngine


class TestInteractionEngine:
    def test_known_interaction(self, db, sample_medicine, sample_medicine_2):
        """Set up a known interaction and verify it's detected."""
        from app.models.models import MedicineInteraction

        interaction = MedicineInteraction(
            id=str(uuid.uuid4()),
            medicine_a_id=sample_medicine.id,
            medicine_b_id=sample_medicine_2.id,
            severity="moderate",
            description="Concurrent use may increase risk of hepatotoxicity.",
            recommendation="Monitor liver function if used together.",
            source="Test Source",
        )
        db.add(interaction)
        db.commit()

        engine = InteractionEngine(db)
        alerts = engine.check_interactions([sample_medicine.id, sample_medicine_2.id])

        assert len(alerts) >= 1
        assert alerts[0].severity == "moderate"
        assert alerts[0].medicine_a in ("Tylenol", "Ibuprofen")

    def test_no_interaction(self, db, sample_medicine):
        """No interaction should be returned for a single medicine."""
        engine = InteractionEngine(db)
        alerts = engine.check_interactions([sample_medicine.id])
        assert alerts == []

    def test_unknown_combination(self, db):
        """Random IDs with no database entries should return no alerts."""
        engine = InteractionEngine(db)
        alerts = engine.check_interactions([str(uuid.uuid4()), str(uuid.uuid4())])
        assert alerts == []


class TestDuplicateIngredientEngine:
    def test_same_ingredient_detected(self, db):
        """Two medicines with the same active ingredient should trigger an alert."""
        from app.models.models import Medicine

        med_a = Medicine(
            id=str(uuid.uuid4()),
            generic_name="paracetamol_test_a",
            active_ingredients=["paracetamol"],
        )
        med_b = Medicine(
            id=str(uuid.uuid4()),
            generic_name="paracetamol_test_b",
            active_ingredients=["paracetamol", "caffeine"],
        )
        db.add_all([med_a, med_b])
        db.commit()

        engine = DuplicateIngredientEngine(db)
        alerts = engine.check_duplicates([med_a.id, med_b.id])

        assert len(alerts) >= 1
        ingredients = [a.ingredient.lower() for a in alerts]
        assert "paracetamol" in ingredients

    def test_different_ingredients_no_alert(self, db):
        """Medicines with completely different ingredients should not trigger duplicates."""
        from app.models.models import Medicine

        med_a = Medicine(
            id=str(uuid.uuid4()),
            generic_name="amoxicillin_test",
            active_ingredients=["amoxicillin"],
        )
        med_b = Medicine(
            id=str(uuid.uuid4()),
            generic_name="aspirin_test",
            active_ingredients=["aspirin"],
        )
        db.add_all([med_a, med_b])
        db.commit()

        engine = DuplicateIngredientEngine(db)
        alerts = engine.check_duplicates([med_a.id, med_b.id])
        assert alerts == []

    def test_combination_medicine(self, db):
        """Combination medicine sharing ingredient with standalone medicine detected."""
        from app.models.models import Medicine

        med_a = Medicine(
            id=str(uuid.uuid4()),
            brand_name="ColdRelief",
            generic_name="phenylephrine_test",
            active_ingredients=["phenylephrine", "chlorphenamine"],
        )
        med_b = Medicine(
            id=str(uuid.uuid4()),
            brand_name="SinusClear",
            generic_name="phenylephrine_mono_test",
            active_ingredients=["phenylephrine"],
        )
        db.add_all([med_a, med_b])
        db.commit()

        engine = DuplicateIngredientEngine(db)
        alerts = engine.check_duplicates([med_a.id, med_b.id])
        assert len(alerts) >= 1
