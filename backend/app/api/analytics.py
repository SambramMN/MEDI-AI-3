"""
MedSafe AI — Analytics API Router
GET /api/analytics/search-trends
GET /api/analytics/interactions
GET /api/analytics/safety-summary
GET /api/analytics/categories

These endpoints query the analytics views defined in the database.
Tableau can also connect directly to these views.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.utils.dependencies import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get(
    "/search-trends",
    summary="Medicine search trend analytics (Tableau-ready)",
)
def get_search_trends(
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Aggregated medicine search data for the given period.
    Suitable for Tableau Dashboard 3 (Medicine Search Trends).
    """
    result = db.execute(
        text("""
            SELECT
                DATE(s.created_at) AS date,
                m.id AS medicine_id,
                COALESCE(m.brand_name, m.generic_name) AS medicine_name,
                m.generic_name,
                m.drug_class,
                COUNT(*) AS search_count
            FROM searches s
            JOIN medicines m ON m.id = s.medicine_id
            WHERE s.created_at >= NOW() - INTERVAL ':days days'
            GROUP BY DATE(s.created_at), m.id, m.brand_name, m.generic_name, m.drug_class
            ORDER BY search_count DESC
        """),
        {"days": days},
    )
    return [dict(row._mapping) for row in result]


@router.get(
    "/interactions",
    summary="Drug interaction alert analytics (Tableau-ready)",
)
def get_interaction_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Aggregated interaction alert data.
    Suitable for Tableau Dashboard 2 (Interaction Analytics).
    """
    result = db.execute(
        text("""
            SELECT
                DATE(sc.created_at) AS date,
                sa.medicine_a,
                sa.medicine_b,
                sa.severity,
                COUNT(*) AS alert_count
            FROM safety_alerts sa
            JOIN safety_checks sc ON sc.id = sa.safety_check_id
            WHERE sa.alert_type = 'interaction'
              AND sc.created_at >= NOW() - INTERVAL ':days days'
            GROUP BY DATE(sc.created_at), sa.medicine_a, sa.medicine_b, sa.severity
            ORDER BY alert_count DESC
        """),
        {"days": days},
    )
    return [dict(row._mapping) for row in result]


@router.get(
    "/safety-summary",
    summary="Daily safety check summary (Tableau-ready)",
)
def get_safety_summary(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Daily aggregated safety metrics.
    Suitable for Tableau Dashboard 1 (Medication Safety Overview) and 4 (Safety Trends).
    """
    result = db.execute(
        text("""
            SELECT
                DATE(sc.created_at) AS date,
                COUNT(DISTINCT sc.id) AS total_checks,
                SUM(CASE WHEN sa.alert_type = 'interaction' THEN 1 ELSE 0 END) AS interaction_alerts,
                SUM(CASE WHEN sa.alert_type = 'duplicate_ingredient' THEN 1 ELSE 0 END) AS duplicate_alerts,
                SUM(CASE WHEN sa.alert_type = 'warning' THEN 1 ELSE 0 END) AS warning_alerts
            FROM safety_checks sc
            LEFT JOIN safety_alerts sa ON sa.safety_check_id = sc.id
            WHERE sc.created_at >= NOW() - INTERVAL ':days days'
            GROUP BY DATE(sc.created_at)
            ORDER BY date
        """),
        {"days": days},
    )
    return [dict(row._mapping) for row in result]


@router.get(
    "/categories",
    summary="Medicine category search distribution (Tableau-ready)",
)
def get_category_analytics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Search counts by drug class.
    Suitable for Tableau Dashboard 3 (Medicine Category Distribution).
    """
    result = db.execute(
        text("""
            SELECT
                COALESCE(m.drug_class, 'Unknown') AS drug_class,
                COUNT(*) AS search_count
            FROM searches s
            JOIN medicines m ON m.id = s.medicine_id
            WHERE s.created_at >= NOW() - INTERVAL ':days days'
              AND m.drug_class IS NOT NULL
            GROUP BY m.drug_class
            ORDER BY search_count DESC
        """),
        {"days": days},
    )
    return [dict(row._mapping) for row in result]
