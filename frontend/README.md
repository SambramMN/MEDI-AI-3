# MedSafe AI — Frontend Web Application
**Intelligent Medication Safety & Drug Interaction Analytics Platform**

A modern healthcare SaaS application built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui** design patterns. It communicates with the MedSafe AI FastAPI backend to provide verified medicine intelligence, multi-drug interaction screening, OCR package text extraction, and an evidence-based medical RAG assistant.

---

## 🏥 Clinical Safety Disclaimer
> **IMPORTANT:** MedSafe AI is an informational screening support platform. It does **NOT** diagnose medical diseases, prescribe medication, recommend personalized drug regimens, or independently determine clinical dosages. Always consult a qualified physician or licensed pharmacist for medical decisions.

---

## 🛠️ Technology Stack
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS + PostCSS + Autoprefixer
- **UI Architecture:** shadcn/ui component hierarchy (`src/components/ui/` and `src/components/common/`)
- **Routing:** React Router v7
- **HTTP Client:** Centralized Axios instance with automatic JWT interceptors
- **Icons:** Lucide React
- **Analytics Visualization:**
  - `ContributionSkyline` (3D isometric interactive WebGL/Canvas skyline & 2D heatmap)
  - Tableau Public / Enterprise Server iframe & SQL analytics views integration

---

## 📁 Directory Structure & shadcn Conventions

```
frontend/
├── src/
│   ├── api/                      # Centralized API service layer
│   │   ├── axiosInstance.ts      # Axios client with auth tokens and error handling
│   │   ├── authApi.ts            # Register, Login, Me
│   │   ├── medicineApi.ts        # Medicine search & monograph details
│   │   ├── medicationApi.ts      # Saved user medication list
│   │   ├── interactionApi.ts     # Safety checker & check history
│   │   ├── scannerApi.ts         # OCR image/PDF upload & processing
│   │   ├── assistantApi.ts       # AI medicine assistant RAG queries
│   │   ├── analyticsApi.ts       # Aggregated usage & Tableau view queries
│   │   ├── userApi.ts            # Profile & password management
│   │   └── index.ts
│   ├── components/
│   │   ├── common/               # Reusable UI domain components
│   │   │   ├── SeverityBadge.tsx # High (Red), Moderate (Orange), Low (Blue), Safe (Teal)
│   │   │   ├── MedicalNoticeBanner.tsx # Clinical boundaries disclaimer banner
│   │   │   ├── MedicineCard.tsx  # Medicine presentation card with active ingredients
│   │   │   ├── InteractionCard.tsx # Detailed drug interaction report
│   │   │   ├── SafetyAlertCard.tsx # Prioritized alerts (duplicates & interactions)
│   │   │   ├── MedicineTable.tsx # Personal medication list table
│   │   │   ├── SearchBar.tsx     # Debounced medicine search bar
│   │   │   ├── FileUploader.tsx  # Drag-and-drop OCR image & PDF uploader
│   │   │   ├── ChatMessage.tsx   # AI Assistant conversation bubble with citations
│   │   │   ├── DashboardCard.tsx # Key metrics & KPI card
│   │   │   ├── Modal.tsx         # Accessible overlay dialog
│   │   │   ├── Toast.tsx         # Global notification feedback provider
│   │   │   ├── LoadingState.tsx  # Clinical spinners and skeleton states
│   │   │   ├── EmptyState.tsx    # Professional error/unavailable states
│   │   │   └── ProtectedRoute.tsx# Auth session route guard
│   │   ├── layout/
│   │   │   ├── Navbar.tsx        # Top navigation with responsive mobile menu
│   │   │   ├── Sidebar.tsx       # SaaS sidebar for clinical workflows
│   │   │   └── AppLayout.tsx     # Shell with header, sidebar, and footer
│   │   └── ui/                   # shadcn-standard UI components
│   │       ├── contribution-skyline.tsx # 3D isometric GitHub-style heatmap skyline
│   │       └── demo.tsx          # Standalone Skyline demo preview
│   ├── context/
│   │   └── AuthContext.tsx       # Auth provider for token & user sync
│   ├── pages/                    # 14 Full Application Views
│   │   ├── LandingPage.tsx       # Hero, Features, Workflow, Safety Notice
│   │   ├── LoginPage.tsx         # Authentication sign in
│   │   ├── RegisterPage.tsx      # User registration
│   │   ├── DashboardPage.tsx     # KPI cards, current medications, Skyline
│   │   ├── MedicineSearchPage.tsx# Full search with drug class & form filters
│   │   ├── MedicineDetailPage.tsx# Comprehensive verified drug monograph
│   │   ├── SafetyCheckerPage.tsx # Multi-medicine interaction cross-check
│   │   ├── MedicationListPage.tsx# Personal active drug list management
│   │   ├── InteractionResultsPage.tsx # Severity-filtered interaction list
│   │   ├── ScannerPage.tsx       # OCR package detection with user confirmation
│   │   ├── AssistantPage.tsx     # ChatGPT-style medical RAG chat
│   │   ├── SafetyAlertsPage.tsx  # Prioritized alerts with mark-as-reviewed
│   │   ├── ProfilePage.tsx       # Allergies, chronic conditions, password
│   │   ├── AnalyticsPage.tsx     # Trends, frequent pairs, 3D skyline
│   │   └── TableauPage.tsx       # Tableau viz embed & SQL view endpoints
│   ├── types/
│   │   └── index.ts              # Domain TypeScript interfaces
│   ├── App.tsx                   # Central router & protected layout
│   ├── index.css                 # Healthcare teal theme & design tokens
│   └── main.tsx                  # Application bootstrap
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

---

## 🎨 Why `/components/ui/` is the Required Path for shadcn

In the shadcn/ui component architecture, `/components/ui/` serves as the official destination for atomic, headless, and self-contained design primitives (like buttons, dialogs, and specialized graphics components like `contribution-skyline.tsx`).

1. **Standard CLI Path:** The shadcn CLI is preconfigured with `aliases.components: "@/components"` and `aliases.ui: "@/components/ui"`. Storing primitives here enables seamless future imports (`npx shadcn add ...`) without path collisions.
2. **Separation of Concerns:** Business logic and domain-specific cards (e.g. `MedicineCard`, `InteractionCard`, `MedicineTable`) reside in `src/components/common/`, while purely visual or mathematical canvas components (`contribution-skyline.tsx`) remain reusable across any context.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v20.17+` or `v22+`
- Backend API running on `http://localhost:8000` (FastAPI)

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Environment Setup
Create a `.env` file from `.env.example`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

### 5. Production Build & Verification
```bash
npm run build
npm run preview
```

---

## 🧪 Key Workflows to Explore
1. **Explore Landing Page (`/`):** Learn about MedSafe AI's safety guarantees and clinical boundaries.
2. **Register/Login (`/register`, `/login`):** Create an account or sign in with your credentials.
3. **Medicine Intelligence (`/medicines`):** Search by brand, generic, or active ingredient with drug-class filters.
4. **Interactive 3D Skyline (`/dashboard`, `/analytics`):** Switch between the 2D flat heatmap and 3D isometric skyline; drag to orbit around the activity landscape.
5. **OCR Scanner (`/scanner`):** Upload medicine boxes or prescription slips and edit/confirm detected drug candidate names before screening.
6. **Safety Checker (`/safety-checker`):** Select medications and run cross-checks to detect potential interactions or duplicate active molecules.
7. **AI Assistant (`/assistant`):** Ask clinical pharmacology questions protected by strict medical refusal guardrails.
8. **Tableau Analytics (`/tableau`):** Preview embedded Tableau worksheets or review the underlying PostgreSQL view schema.
