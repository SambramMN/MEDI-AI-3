"""
MedSafe AI — Medicine Service
Business logic layer for medicine search and lookup.
Integrates database queries + optional OpenFDA fallback.
"""

from typing import List, Optional

import httpx
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.models import Medicine
from app.repositories.medicine_repository import MedicineRepository
from app.schemas.medicines import MedicineSearchResponse, MedicineSearchResult, MedicineDetail
from app.utils.logging import get_logger
from app.utils.responses import MedicineNotFound

settings = get_settings()
logger = get_logger(__name__)


class MedicineService:

    @staticmethod
    def search_medicines(
        db: Session,
        query: str,
        page: int = 1,
        limit: int = 20,
        user_id: Optional[str] = None,
    ) -> MedicineSearchResponse:
        if limit > 100:
            limit = 100

        results, total = MedicineRepository.search(db, query, page, limit)

        # Log for analytics (non-blocking best-effort)
        try:
            first_result_id = results[0].id if results else None
            MedicineRepository.log_search(db, query, first_result_id, user_id)
        except Exception:
            pass

        return MedicineSearchResponse(
            results=[MedicineService._to_search_result(m) for m in results],
            total=total,
            page=page,
            limit=limit,
            query=query,
        )

    @staticmethod
    def get_medicine_detail(db: Session, medicine_id: str) -> MedicineDetail:
        medicine = MedicineRepository.get_by_id(db, medicine_id)
        if not medicine:
            raise MedicineNotFound()
        return MedicineService._to_detail(medicine)

    # ------------------------------------------------------------------
    # OpenFDA fallback (used when medicine is not in local DB)
    # ------------------------------------------------------------------

    @staticmethod
    async def search_openfda(query: str) -> List[dict]:
        """
        Query the OpenFDA drug label API as a fallback data source.
        Returns raw JSON results — caller must decide how to use them.
        """
        try:
            url = f"{settings.openfda_api_base}/label.json"
            params = {
                "search": f"(brand_name:{query}+OR+generic_name:{query})",
                "limit": 5,
            }
            if settings.openfda_api_key:
                params["api_key"] = settings.openfda_api_key

            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("results", [])
        except Exception as exc:
            logger.warning("openfda_search_failed", error=str(exc))
        return []

    # ------------------------------------------------------------------
    # Internal mappers
    # ------------------------------------------------------------------

    @staticmethod
    def _to_search_result(m: Medicine) -> MedicineSearchResult:
        return MedicineSearchResult(
            id=m.id,
            brand_name=m.brand_name,
            generic_name=m.generic_name,
            active_ingredients=m.active_ingredients if isinstance(m.active_ingredients, list) else [],
            drug_class=m.drug_class,
            dosage_form=m.dosage_form,
        )

    @staticmethod
    def _to_detail(m: Medicine) -> MedicineDetail:
        return MedicineDetail(
            id=m.id,
            brand_name=m.brand_name,
            generic_name=m.generic_name,
            active_ingredients=m.active_ingredients if isinstance(m.active_ingredients, list) else [],
            drug_class=m.drug_class,
            dosage_form=m.dosage_form,
            description=m.description,
            uses=m.uses,
            mechanism=m.mechanism,
            side_effects=m.side_effects,
            warnings=m.warnings,
            contraindications=m.contraindications,
            storage_information=m.storage_information,
            source=m.source,
            source_url=m.source_url,
            last_verified=m.last_verified,
        )
