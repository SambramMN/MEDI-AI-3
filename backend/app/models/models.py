"""
MedSafe AI — SQLAlchemy ORM Models
All tables defined here.  Uses SQLAlchemy 2.x Mapped / mapped_column API.
"""

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

def UUID(as_uuid=False):
    return String(36).with_variant(PG_UUID(as_uuid=as_uuid), "postgresql")
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _uuid() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    profile: Mapped[Optional["UserProfile"]] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    medications: Mapped[List["Medication"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    safety_checks: Mapped[List["SafetyCheck"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    searches: Mapped[List["Search"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    scanner_results: Mapped[List["ScannerResult"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    ai_queries: Mapped[List["AIQuery"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    # Stored as JSON arrays of strings
    allergies: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=list)
    existing_conditions: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="profile")


# ---------------------------------------------------------------------------
# Medicine
# ---------------------------------------------------------------------------

class Medicine(Base):
    __tablename__ = "medicines"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    brand_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    generic_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    # Stored as JSON array of strings
    active_ingredients: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    drug_class: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    dosage_form: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    uses: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    mechanism: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    side_effects: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    warnings: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    contraindications: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    storage_information: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Data provenance
    source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    last_verified: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    interactions_as_a: Mapped[List["MedicineInteraction"]] = relationship(
        "MedicineInteraction",
        foreign_keys="MedicineInteraction.medicine_a_id",
        back_populates="medicine_a_rel",
    )
    interactions_as_b: Mapped[List["MedicineInteraction"]] = relationship(
        "MedicineInteraction",
        foreign_keys="MedicineInteraction.medicine_b_id",
        back_populates="medicine_b_rel",
    )
    medications: Mapped[List["Medication"]] = relationship(back_populates="medicine")
    searches: Mapped[List["Search"]] = relationship(back_populates="medicine")


# ---------------------------------------------------------------------------
# Drug Interactions
# ---------------------------------------------------------------------------

class MedicineInteraction(Base):
    __tablename__ = "medicine_interactions"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    medicine_a_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("medicines.id"), nullable=False, index=True
    )
    medicine_b_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("medicines.id"), nullable=False, index=True
    )
    # Severity: low | moderate | high | contraindicated
    severity: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    mechanism: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recommendation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    last_verified: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    medicine_a_rel: Mapped["Medicine"] = relationship(
        foreign_keys=[medicine_a_id], back_populates="interactions_as_a"
    )
    medicine_b_rel: Mapped["Medicine"] = relationship(
        foreign_keys=[medicine_b_id], back_populates="interactions_as_b"
    )


# ---------------------------------------------------------------------------
# User Medications (saved medication list)
# ---------------------------------------------------------------------------

class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    medicine_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=False), ForeignKey("medicines.id"), nullable=True
    )
    # What the user typed (before matching)
    entered_name: Mapped[str] = mapped_column(String(255), nullable=False)
    formulation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    user_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="medications")
    medicine: Mapped[Optional["Medicine"]] = relationship(back_populates="medications")


# ---------------------------------------------------------------------------
# Safety Checks
# ---------------------------------------------------------------------------

class SafetyCheck(Base):
    __tablename__ = "safety_checks"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    # Status: no_known_issue | potential_interaction | duplicate_ingredient | warning | insufficient_information
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="no_known_issue")
    result_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="safety_checks")
    alerts: Mapped[List["SafetyAlert"]] = relationship(
        back_populates="safety_check", cascade="all, delete-orphan"
    )


class SafetyAlert(Base):
    __tablename__ = "safety_alerts"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    safety_check_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), ForeignKey("safety_checks.id", ondelete="CASCADE"), nullable=False
    )
    # alert_type: interaction | duplicate_ingredient | warning
    alert_type: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    medicine_a: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    medicine_b: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recommendation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    safety_check: Mapped["SafetyCheck"] = relationship(back_populates="alerts")


# ---------------------------------------------------------------------------
# Search History
# ---------------------------------------------------------------------------

class Search(Base):
    __tablename__ = "searches"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    medicine_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=False), ForeignKey("medicines.id"), nullable=True
    )
    search_term: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped[Optional["User"]] = relationship(back_populates="searches")
    medicine: Mapped[Optional["Medicine"]] = relationship(back_populates="searches")


# ---------------------------------------------------------------------------
# Scanner Results
# ---------------------------------------------------------------------------

class ScannerResult(Base):
    __tablename__ = "scanner_results"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    # Stored filename, NOT the full path
    file_reference: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # JSON array of detected medicine candidate objects
    detected_medicines: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped[Optional["User"]] = relationship(back_populates="scanner_results")


# ---------------------------------------------------------------------------
# AI Queries
# ---------------------------------------------------------------------------

class AIQuery(Base):
    __tablename__ = "ai_queries"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=_uuid
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # JSON array of source references
    source_references: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    # Classification of the question
    query_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    # Whether request was refused (guardrail hit)
    was_refused: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped[Optional["User"]] = relationship(back_populates="ai_queries")
