"""
MedSafe AI — Medicine Repository
Encapsulates all database queries for medicines.
"""

from typing import List, Optional, Tuple

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.models import Medicine, Search


class MedicineRepository:

    @staticmethod
    def search(
        db: Session,
        query: str,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[Medicine], int]:
        """
        Full-text search over brand_name, generic_name, and active_ingredients.
        Returns (results, total_count).
        """
        q = query.strip().lower()
        base = db.query(Medicine).filter(
            or_(
                func.lower(Medicine.brand_name).contains(q),
                func.lower(Medicine.generic_name).contains(q),
                # JSON array cast to text for ingredient search
                func.cast(Medicine.active_ingredients, db.bind.dialect.name == "postgresql" and "text" or "TEXT").contains(q),
            )
        )
        total = base.count()
        results = base.offset((page - 1) * limit).limit(limit).all()
        return results, total

    @staticmethod
    def get_by_id(db: Session, medicine_id: str) -> Optional[Medicine]:
        return db.query(Medicine).filter(Medicine.id == medicine_id).first()

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[Medicine]:
        """Case-insensitive exact match on brand or generic name."""
        n = name.strip().lower()
        return db.query(Medicine).filter(
            or_(
                func.lower(Medicine.brand_name) == n,
                func.lower(Medicine.generic_name) == n,
            )
        ).first()

    @staticmethod
    def log_search(
        db: Session,
        search_term: str,
        medicine_id: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> None:
        """Record a search event for analytics."""
        entry = Search(
            search_term=search_term,
            medicine_id=medicine_id,
            user_id=user_id,
        )
        db.add(entry)
        db.commit()
