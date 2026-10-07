# MedSafe AI — Backend

**Intelligent Medication Safety & Drug Interaction Analytics Platform**

A production-grade FastAPI backend implementing medication safety checking, drug interaction detection, OCR-based medicine scanning, RAG-powered AI assistance, and Tableau-ready analytics.

---

## ⚠️ Medical Safety Notice

This system provides **educational information only**. It does **not**:
- Diagnose medical conditions
- Prescribe medicines
- Recommend personalised dosages
- Advise stopping prescription medication

Always consult a qualified healthcare professional (doctor or pharmacist) for personalised medical advice.

---

## 🗂️ Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI entry point
│   ├── config.py               # Environment-based settings
│   ├── database.py             # SQLAlchemy engine & session
│   │
│   ├── api/                    # API route handlers
│   │   ├── auth.py             # Registration, login, JWT
│   │   ├── medicines.py        # Medicine search & detail
│   │   ├── medications.py      # User medication list
│   │   ├── interactions.py     # Safety checker
│   │   ├── scanner.py          # OCR upload
│   │   ├── assistant.py        # AI assistant
│   │   ├── analytics.py        # Tableau-ready analytics
│   │   └── users.py            # User profile management
│   │
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response schemas
│   ├── services/               # Business logic layer
│   ├── repositories/           # Database query layer
│   ├── ai/                     # RAG assistant & guardrails
│   ├── safety/                 # Interaction & duplicate engines
│   ├── ocr/                    # Tesseract OCR processor
│   └── utils/                  # Security, logging, responses
│
├── tests/                      # Automated test suite
├── migrations/                 # Alembic database migrations
├── requirements.txt
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── alembic.ini
```

---

## 🚀 Quick Start

### 1. Clone and configure

```bash
cp .env.example .env
# Edit .env with your database URL, JWT secret, and LLM API key
```

### 2. Docker (recommended)

```bash
docker-compose up --build
```

The API will be available at: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs**

### 3. Local development

#### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Tesseract OCR (`apt install tesseract-ocr` or `brew install tesseract`)

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --port 8000
```

---

## 🔑 Authentication

All protected endpoints require a JWT Bearer token:

```bash
# Register
POST /api/auth/register
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass123!"
}

# Login
POST /api/auth/login
{
  "email": "jane@example.com",
  "password": "SecurePass123!"
}

# Use token
Authorization: Bearer <token>
```

---

## 💊 Key API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/medicines/search?q=paracetamol` | Search medicines | Optional |
| GET | `/api/medicines/{id}` | Medicine detail | No |
| POST | `/api/medications` | Add to medication list | Required |
| GET | `/api/medications` | Get medication list | Required |
| DELETE | `/api/medications/{id}` | Remove medication | Required |
| POST | `/api/safety/check` | Run safety check | Required |
| POST | `/api/scanner/upload` | OCR upload | Optional |
| POST | `/api/assistant/ask` | AI assistant | Optional |
| GET | `/api/analytics/search-trends` | Analytics | Required |
| GET | `/api/analytics/safety-summary` | Safety data | Required |

---

## ⚙️ Safety Checker

```bash
POST /api/safety/check
Authorization: Bearer <token>
{
  "existing_medication_ids": ["med-id-1", "med-id-2"],
  "new_medication_id": "med-id-3"
}
```

Response statuses:
- `no_known_issue` — No issues detected
- `potential_interaction` — Known drug interaction
- `duplicate_ingredient` — Same active ingredient found
- `insufficient_information` — Data unavailable

---

## 🤖 AI Assistant

The assistant uses RAG (Retrieval-Augmented Generation):
1. Question is classified for medical safety guardrails
2. Relevant documents retrieved from ChromaDB knowledge base
3. LLM synthesises an answer based **only** on retrieved facts
4. Response is validated before return

**Guardrails refuse:**
- Prescription requests
- Personalised dosage requests
- Diagnosis requests
- Advice to stop prescription medication

---

## 📷 OCR Scanner

```bash
POST /api/scanner/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image.png or document.pdf>
```

- Supports: JPEG, PNG, WebP, TIFF, PDF
- Maximum size: configurable via `MAX_UPLOAD_SIZE_MB`
- **Always returns `requires_confirmation: true`**
- Users must manually confirm detected medicines

---

## 📊 Tableau Integration

Connect Tableau directly to PostgreSQL using these views:

| View | Dashboard |
|------|-----------|
| `medicine_search_analytics` | Dashboard 3 — Search Trends |
| `interaction_analytics` | Dashboard 2 — Interaction Analytics |
| `safety_summary` | Dashboard 1 & 4 — Safety Overview |
| `medicine_category_analytics` | Dashboard 3 — Category Distribution |

Or use the REST analytics endpoints (`/api/analytics/*`) which Tableau Web Data Connector can consume.

---

## 🧪 Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html

# Run specific test module
pytest tests/test_auth.py -v
pytest tests/test_safety_engines.py -v
```

Test coverage includes:
- ✅ Authentication (register, login, invalid credentials, protected routes)
- ✅ Medicine search (brand, generic, unknown, pagination)
- ✅ Drug interaction engine (known, unknown, no interaction)
- ✅ Duplicate ingredient engine (same, different, combination)
- ✅ AI guardrails (all refusal categories + allowed queries)
- ✅ OCR scanner (file types, confirmation requirement)

---

## 🗃️ Database Migrations

```bash
# Apply all migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "description"

# Downgrade last migration
alembic downgrade -1
```

---

## 🌿 Environment Variables

See [`.env.example`](.env.example) for the complete list.

Key variables:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=<minimum-32-character-random-string>
LLM_API_KEY=<your-openai-or-other-api-key>
LLM_MODEL=gpt-4o-mini
TESSERACT_CMD=   # leave empty if tesseract is on PATH
CORS_ORIGINS=http://localhost:3000
```

---

## 🔒 Security Features

- ✅ bcrypt password hashing (no plaintext passwords ever stored)
- ✅ JWT access tokens with expiry
- ✅ Per-user authorization on all sensitive endpoints
- ✅ Rate limiting (via slowapi)
- ✅ File type + size validation for uploads
- ✅ SQL injection protection (SQLAlchemy ORM)
- ✅ CORS configuration
- ✅ All secrets via environment variables (no hardcoding)
- ✅ Structured audit logging

---

## 📡 Medicine Data Sources

The system integrates with:
- **OpenFDA Drug Label API** — official FDA drug information
- **RxNorm API** — standardized drug names and relationships
- Local PostgreSQL database for structured interaction data

Medicine data must be seeded before search is functional. A data import script can be run against the OpenFDA API using the `OPENFDA_API_BASE` endpoint.

---

## 🏗️ Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI |
| Database | PostgreSQL 16 |
| ORM | SQLAlchemy 2.x |
| Migrations | Alembic |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| AI/LLM | OpenAI (configurable provider) |
| Vector DB | ChromaDB |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| OCR | Tesseract + pdf2image |
| Rate Limiting | slowapi |
| Logging | structlog |
| Testing | pytest + httpx |
| Containerization | Docker + Docker Compose |
| Analytics | PostgreSQL views (Tableau-ready) |
