# MedSafe AI

**MedSafe AI — Intelligent Medication Safety & Drug Interaction Analytics Platform**

MedSafe AI is an AI-powered medication safety and medicine intelligence platform designed to help patients and healthcare providers understand drugs, evaluate potential multi-drug interactions, detect duplicate active pharmaceutical ingredients, scan prescriptions via OCR, and interact with a safety-guardrailed medical AI assistant.

---

## ⚠️ Important Medical Safety Notice
MedSafe AI is an informational and medication-safety support tool. It does **NOT**:
- Diagnose medical diseases
- Prescribe medications
- Recommend personalized drug regimens
- Automatically calculate personalized clinical dosages
- Instruct users to discontinue prescription treatments
- Generate unsupported medical advice

Always consult a qualified doctor or licensed pharmacist for medical decisions.

---

## 🌟 Features

- **Medicine Intelligence & Monographs:** Search by brand, generic, or active ingredient with indications, side effects, precautions, and contraindications.
- **Drug Interaction Screening:** Comprehensive matrix checking multi-drug combinations with severity levels (High, Moderate, Low) and trusted clinical guidance.
- **Duplicate Active Ingredient Detection:** Flags when different brand formulations share identical chemical entities (e.g. Paracetamol in multi-symptom cold products) to prevent accidental overdose.
- **Medicine Scanner (OCR):** Upload medicine box images, blister pack photos, or prescription PDFs to extract drug candidate names with user confirmation workflows.
- **AI Medicine Assistant:** Evidence-based RAG chat system explaining drug mechanisms and interactions, backed by strict medical refusal guardrails.
- **Personal Medication Management:** Maintain an active medication list with quick cross-referencing capabilities.
- **Safety Alerts Queue:** Prioritized queue of high-risk interactions and duplicate alerts with mark-as-reviewed tracking.
- **Contribution Skyline Analytics:** Interactive 3D isometric GitHub-style heatmap skyline visualizing medication checks and safety activity over time.
- **Tableau Analytics Portal:** Embedded enterprise BI dashboard backed by PostgreSQL sanitized analytics views.

---

## 🛠️ Technology Stack

### Frontend (`frontend/`)
- **Framework:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **UI Architecture:** shadcn/ui pattern (`src/components/ui/` and `src/components/common/`)
- **Routing:** React Router v7 with protected routes
- **Visualization:** `ContributionSkyline` (3D isometric canvas skyline) & Tableau embed
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT interceptors

### Backend (`backend/`)
- **Framework:** Python, FastAPI, Pydantic
- **Database & ORM:** PostgreSQL, SQLAlchemy, Alembic migrations
- **Authentication:** JWT with bcrypt password hashing
- **OCR:** Tesseract OCR image & PDF processor
- **AI / RAG:** Medical knowledge base vector retriever and safety guardrail filter

---

## 🚀 Frontend Setup & Development

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

App runs on `http://localhost:5173`.

---

## 🏗️ Production Build

```bash
cd frontend
npm run build
```

Production output will be generated in `frontend/dist`.

---

## ⚙️ Environment Variables

Create `frontend/.env` (refer to `frontend/.env.example`):

```env
# Frontend environment variables
VITE_API_BASE_URL=http://localhost:8000
```

> **Note:** Frontend environment variables are client-accessible and must **never** contain secret database credentials, private API keys, or JWT secrets.

---

## ☁️ Vercel Deployment

The frontend is configured for deployment to **Vercel** with client-side SPA routing (`vercel.json`).

### Steps to Deploy to Vercel:
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New Project** and select your GitHub repository (`SambramMN/MEDI-AI-3`).
3. Set the **Root Directory** to `frontend`.
4. Vercel automatically detects:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. In the **Environment Variables** section, add:
   - `VITE_API_BASE_URL`: `https://YOUR-BACKEND-DOMAIN` (the public URL of your deployed FastAPI backend)
6. Click **Deploy**.

---

## 🌐 Separate Backend Architecture

MedSafe AI follows a modern decoupled architecture:

```text
                  USER
                    │
                    ▼
             VERCEL FRONTEND
             (React 19 + Vite)
                    │
                    │ HTTPS REST API
                    ▼
             SEPARATE BACKEND
            (FastAPI on Render/Railway/Fly.io/AWS)
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
      PostgreSQL   AI/RAG   Medicine DB
                              │
                              ▼
                       Trusted Sources
```
- **Frontend:** Hosted on Vercel
- **Backend API:** Hosted separately on any Python-capable container platform (e.g. Render, Railway, AWS ECS, Fly.io)
- **Database:** Hosted on PostgreSQL (e.g. Supabase, Neon, AWS RDS)
