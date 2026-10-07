"""
MedSafe AI — Pytest Configuration & Fixtures
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.config import get_settings

settings = get_settings()

# Use SQLite in-memory for tests (no PostgreSQL needed to run tests)
TEST_DB_URL = "sqlite:///./test_medsafe.db"

test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def create_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    """Register and login a test user, return auth headers."""
    client.post("/api/auth/register", json={
        "name": "Test User",
        "email": "test@medsafe.com",
        "password": "TestPass123!",
    })
    response = client.post("/api/auth/login", json={
        "email": "test@medsafe.com",
        "password": "TestPass123!",
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_medicine(db):
    """Create a sample medicine for testing."""
    from app.models.models import Medicine
    import uuid

    med = Medicine(
        id=str(uuid.uuid4()),
        brand_name="Tylenol",
        generic_name="paracetamol",
        active_ingredients=["paracetamol"],
        drug_class="Analgesic",
        dosage_form="Tablet",
        description="Pain reliever and fever reducer.",
        uses="Relief of mild to moderate pain and fever.",
        mechanism="Inhibits prostaglandin synthesis in the CNS.",
        side_effects="Nausea, rash, liver damage in overdose.",
        warnings="Do not exceed recommended dose. Avoid alcohol.",
        source="OpenFDA",
        source_url="https://api.fda.gov/drug",
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


@pytest.fixture
def sample_medicine_2(db):
    """Second medicine for interaction testing."""
    from app.models.models import Medicine
    import uuid

    med = Medicine(
        id=str(uuid.uuid4()),
        brand_name="Ibuprofen",
        generic_name="ibuprofen",
        active_ingredients=["ibuprofen"],
        drug_class="NSAID",
        dosage_form="Tablet",
        description="Anti-inflammatory pain reliever.",
        source="OpenFDA",
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med
