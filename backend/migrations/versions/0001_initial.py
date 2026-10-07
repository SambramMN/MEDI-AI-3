"""
MedSafe AI — Initial Database Migration
Creates all tables and Tableau analytics views.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    # Tables                                                               #
    # ------------------------------------------------------------------ #

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "user_profiles",
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=False),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("age", sa.Integer, nullable=True),
        sa.Column("allergies", postgresql.JSON, nullable=True),
        sa.Column("existing_conditions", postgresql.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "medicines",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("brand_name", sa.String(255), nullable=True),
        sa.Column("generic_name", sa.String(255), nullable=False),
        sa.Column("active_ingredients", postgresql.JSON, nullable=True),
        sa.Column("drug_class", sa.String(255), nullable=True),
        sa.Column("dosage_form", sa.String(100), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("uses", sa.Text, nullable=True),
        sa.Column("mechanism", sa.Text, nullable=True),
        sa.Column("side_effects", sa.Text, nullable=True),
        sa.Column("warnings", sa.Text, nullable=True),
        sa.Column("contraindications", sa.Text, nullable=True),
        sa.Column("storage_information", sa.Text, nullable=True),
        sa.Column("source", sa.String(255), nullable=True),
        sa.Column("source_url", sa.String(512), nullable=True),
        sa.Column("last_verified", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_medicines_brand_name", "medicines", ["brand_name"])
    op.create_index("ix_medicines_generic_name", "medicines", ["generic_name"])
    op.create_index("ix_medicines_drug_class", "medicines", ["drug_class"])

    op.create_table(
        "medicine_interactions",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("medicine_a_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("medicines.id"), nullable=False),
        sa.Column("medicine_b_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("medicines.id"), nullable=False),
        sa.Column("severity", sa.String(50), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("mechanism", sa.Text, nullable=True),
        sa.Column("recommendation", sa.Text, nullable=True),
        sa.Column("source", sa.String(255), nullable=True),
        sa.Column("source_url", sa.String(512), nullable=True),
        sa.Column("last_verified", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_interactions_a", "medicine_interactions", ["medicine_a_id"])
    op.create_index("ix_interactions_b", "medicine_interactions", ["medicine_b_id"])

    op.create_table(
        "medications",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("medicine_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("medicines.id"), nullable=True),
        sa.Column("entered_name", sa.String(255), nullable=False),
        sa.Column("formulation", sa.String(100), nullable=True),
        sa.Column("user_notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_medications_user_id", "medications", ["user_id"])

    op.create_table(
        "safety_checks",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("status", sa.String(50), nullable=False, server_default="no_known_issue"),
        sa.Column("result_summary", sa.Text, nullable=True),
    )
    op.create_index("ix_safety_checks_user_id", "safety_checks", ["user_id"])

    op.create_table(
        "safety_alerts",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("safety_check_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("safety_checks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("alert_type", sa.String(50), nullable=False),
        sa.Column("severity", sa.String(50), nullable=False),
        sa.Column("medicine_a", sa.String(255), nullable=True),
        sa.Column("medicine_b", sa.String(255), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("recommendation", sa.Text, nullable=True),
        sa.Column("source", sa.String(255), nullable=True),
    )

    op.create_table(
        "searches",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("medicine_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("medicines.id"), nullable=True),
        sa.Column("search_term", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "scanner_results",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("file_reference", sa.String(512), nullable=True),
        sa.Column("extracted_text", sa.Text, nullable=True),
        sa.Column("detected_medicines", postgresql.JSON, nullable=True),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "ai_queries",
        sa.Column("id", postgresql.UUID(as_uuid=False), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("question", sa.Text, nullable=False),
        sa.Column("response", sa.Text, nullable=True),
        sa.Column("source_references", postgresql.JSON, nullable=True),
        sa.Column("query_type", sa.String(50), nullable=True),
        sa.Column("was_refused", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ------------------------------------------------------------------ #
    # Tableau Analytics Views                                              #
    # ------------------------------------------------------------------ #

    op.execute("""
        CREATE OR REPLACE VIEW medicine_search_analytics AS
        SELECT
            DATE(s.created_at)                          AS date,
            m.id                                        AS medicine_id,
            COALESCE(m.brand_name, m.generic_name)      AS medicine_name,
            m.generic_name,
            m.drug_class,
            COUNT(*)                                    AS search_count
        FROM searches s
        JOIN medicines m ON m.id = s.medicine_id
        GROUP BY DATE(s.created_at), m.id, m.brand_name, m.generic_name, m.drug_class;
    """)

    op.execute("""
        CREATE OR REPLACE VIEW interaction_analytics AS
        SELECT
            DATE(sc.created_at)   AS date,
            sa.medicine_a,
            sa.medicine_b,
            sa.severity,
            COUNT(*)              AS alert_count
        FROM safety_alerts sa
        JOIN safety_checks sc ON sc.id = sa.safety_check_id
        WHERE sa.alert_type = 'interaction'
        GROUP BY DATE(sc.created_at), sa.medicine_a, sa.medicine_b, sa.severity;
    """)

    op.execute("""
        CREATE OR REPLACE VIEW safety_summary AS
        SELECT
            DATE(sc.created_at)  AS date,
            COUNT(DISTINCT sc.id) AS total_checks,
            SUM(CASE WHEN sa.alert_type = 'interaction'          THEN 1 ELSE 0 END) AS interaction_alerts,
            SUM(CASE WHEN sa.alert_type = 'duplicate_ingredient' THEN 1 ELSE 0 END) AS duplicate_alerts,
            SUM(CASE WHEN sa.alert_type = 'warning'             THEN 1 ELSE 0 END) AS warning_alerts
        FROM safety_checks sc
        LEFT JOIN safety_alerts sa ON sa.safety_check_id = sc.id
        GROUP BY DATE(sc.created_at);
    """)

    op.execute("""
        CREATE OR REPLACE VIEW medicine_category_analytics AS
        SELECT
            COALESCE(m.drug_class, 'Unknown') AS drug_class,
            COUNT(*)                          AS search_count
        FROM searches s
        JOIN medicines m ON m.id = s.medicine_id
        WHERE m.drug_class IS NOT NULL
        GROUP BY m.drug_class;
    """)


def downgrade() -> None:
    op.execute("DROP VIEW IF EXISTS medicine_category_analytics;")
    op.execute("DROP VIEW IF EXISTS safety_summary;")
    op.execute("DROP VIEW IF EXISTS interaction_analytics;")
    op.execute("DROP VIEW IF EXISTS medicine_search_analytics;")

    op.drop_table("ai_queries")
    op.drop_table("scanner_results")
    op.drop_table("searches")
    op.drop_table("safety_alerts")
    op.drop_table("safety_checks")
    op.drop_table("medications")
    op.drop_table("medicine_interactions")
    op.drop_table("medicines")
    op.drop_table("user_profiles")
    op.drop_table("users")
