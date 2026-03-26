# Project LINK — Project Specification

> **Companion document to** `brainstorm.md`. This spec translates the working context into structured product and engineering requirements for implementation.

---

## 1. Product Requirements

### 1.1 Target Audience

| Role | Primary Interface | Core Need |
| :--- | :--- | :--- |
| Barangay Health Worker (BHW) | PWA (mobile-first, offline) | Fast, offline-capable point-of-care data entry |
| Rural Health Midwife (RHM) | PWA + Web | TCL management, record validation, ST generation |
| Public Health Nurse (PHN) | Web | City-wide ST review, MCT consolidation |
| Disease Surveillance Officer (DSO) | Web | Real-time disease alerts, PIDSR case filing |
| PHIS Coordinator | Web | Data quality audits, report export |
| City Health Officer (CHO) | Web + Mobile (read-only) | GIS/ML dashboards, final report sign-off |
| System Administrator | Web | User management, RLS policies, barangay mapping |

---

### 1.2 Core Problems Solved

1. **Encoder Bottleneck** — One person encodes 192+ reports/month. Single point of failure. → Solved by automated ST/MCT pipeline.
2. **30-Day Detection Lag** — Outbreaks discovered only at monthly tally. → Solved by real-time WebSocket PIDSR alerts.
3. **Data Silos** — 32 stations are islands; no cross-station patient search. → Solved by unified patient ITR with city-wide search.
4. **Shadow Data Loss** — BHWs use personal notepads; data lost in transcription. → Solved by offline-first PWA with IndexedDB sync.
5. **Summary-Only Digitization** — Only aggregate counts reach digital systems; patient-level data is destroyed. → Solved by digitizing at point of care.
6. **RA 11332 Non-Compliance** — 24-hour Category I reporting structurally impossible with paper. → Solved by automated category detection + instant WebSocket broadcast.

---

### 1.3 Detailed User Interaction Flows

#### Flow 1: BHW Field Entry (Offline-First)

1. BHW opens PWA on mobile device. App loads from service worker cache if offline.
2. BHW searches for the patient by name or unified patient ID. If new patient, taps **"New Patient"** and fills in demographic form (name, birthdate, address, purok).
3. BHW selects the service type rendered for the visit (Maternal Care, Immunization, NCD Check-in, TB-DOTS, Nutrition Assessment).
4. BHW fills the service-specific form:
   - **Maternal:** LMP, BP, weight, AOG (auto-calculated from LMP), complaints.
   - **Immunization:** Vaccine name (from EPI schedule), lot number, date given, site.
   - **NCD:** BP reading, blood sugar (if tested), current medications, symptoms.
   - **TB-DOTS:** Date of drug intake, drug regimen, side effects noted.
   - **Nutrition:** Height, weight, MUAC; WAZ/HAZ/WHZ computed automatically.
5. BHW taps **"Submit"**. Record is saved to IndexedDB with status `PENDING_SYNC`.
6. A background sync job (Service Worker) detects connectivity and pushes `PENDING_SYNC` records to Supabase via the FastAPI `/sync` endpoint.
7. On successful sync, record status transitions: `PENDING_SYNC` → `PENDING_VALIDATION`. Midwife receives an in-app notification.
8. If the record flags a high-risk condition (BP > 140/90, severe wasting, Category I disease), the system automatically annotates it with a risk flag before promotion.

---

#### Flow 2: Midwife TCL Validation & ST Generation

**Part A — Daily Validation**

1. Midwife logs in to web or PWA. Dashboard shows a count of **"Pending Records"** awaiting validation.
2. Midwife opens the Pending Review queue, which lists BHW-submitted entries sorted by submission date and service type.
3. For each record, Midwife reviews the fields against the source paper form (if applicable).
   - Taps/clicks **"Approve"** → record status transitions to `VALIDATED`; ITR is updated.
   - Taps/clicks **"Return"** with a rejection reason → record status transitions to `RETURNED`; BHW receives notification with the reason to correct and resubmit.
4. Validated records are automatically appended to the appropriate TCL (e.g., Maternal Care TCL, EPI Registry, TB Register).

**Part B — End-of-Month ST Generation**

1. On or after the BHS monthly cutoff date, Midwife navigates to **Reports → Generate Summary Table**.
2. System displays a pre-flight check: count of `VALIDATED` records for the period, list of any `RETURNED` or `PENDING_VALIDATION` records still outstanding.
3. Midwife reviews and resolves outstanding records or proceeds to generate with current validated data.
4. Midwife clicks **"Generate ST"**. The auto-tally engine aggregates all `VALIDATED` TCL entries for that BHS and period into a structured Summary Table (ST) aligned with FHSIS indicators.
5. ST is displayed for review. Midwife can annotate remarks per indicator row.
6. Midwife clicks **"Submit ST to PHN"**. ST status becomes `SUBMITTED`. PHN receives in-app notification.

---

#### Flow 3: PHN MCT Consolidation

1. PHN logs in. The MCT Dashboard shows a grid of all 32 BHS with their ST submission status (`NOT SUBMITTED`, `SUBMITTED`, `REVIEWED`, `APPROVED`).
2. PHN clicks into a submitted ST for a specific BHS to review indicator values.
3. PHN can flag individual indicator rows with comments (e.g., "denominator mismatch — please verify"). Flagged rows are returned to the Midwife with an in-app note.
4. When the PHN is satisfied, they click **"Approve ST"** for that BHS. Status changes to `APPROVED`.
5. Once all 32 BHS STs are `APPROVED` (or the PHN proceeds with a documented partial set), the PHN clicks **"Generate MCT"**.
6. The MCT engine merges all 32 approved STs row-by-row into the Monthly Consolidation Table, summing numerators and denominators per FHSIS indicator.
7. PHN reviews the MCT summary. The system highlights indicators where BHS-level values diverged significantly from the city average (automated outlier detection).
8. PHN clicks **"Submit MCT to PHIS Coordinator"**. MCT status becomes `PENDING_DQC`.

---

#### Flow 4: PHIS Coordinator DQC & Report Export

1. PHIS Coordinator logs in. Dashboard shows MCT submissions awaiting DQC.
2. Coordinator runs the automated **Data Quality Check (DQC)**, which validates:
   - Numerators ≤ denominators for all coverage indicators.
   - Mandatory FHSIS fields are not null.
   - Disease case counts reconcile with the PIDSR log for the same period.
3. DQC results are displayed as a checklist. Coordinator resolves or overrides each flagged item with a documented justification.
4. Coordinator clicks **"Approve MCT"**. System generates:
   - **M1 Report** (monthly field health services report) — Excel + PDF
   - **M2 Report** (monthly disease report) — Excel + PDF
   - Formats conform exactly to DOH DM 2024-0007 field names and formulas.
5. Reports are emailed to the City Health Officer and stored in the audit-logged export history.
6. City Health Officer logs in (or opens email), reviews the final report, and clicks **"Sign Off"** to formally close the reporting period.

---

#### Flow 5: PIDSR Disease Alert (Real-Time)

1. Midwife or DSO enters a new disease case via the **PIDSR Entry** form. Fields include: patient link, disease classification (Category I/II/III), symptom onset date, exposure history, case status.
2. On form save, the backend checks if the disease is a **Category I** notifiable disease (per AO 2021-0057 list).
3. If Category I:
   - A `disease_alerts` record is inserted immediately.
   - A WebSocket message is broadcast to all active DSO sessions.
   - DSO receives a real-time banner notification with patient barangay, disease name, and time of onset.
4. DSO opens the alert, reviews the case, and begins the electronic Case Investigation Form (CIF) workflow.
5. DSO validates and closes the alert. The system records `validated_at` timestamp. The gap between `case_onset_date` and `validated_at` is surfaced as a compliance metric on the DSO dashboard (target: < 24 hours per RA 11332).
6. Validated cases feed into the GIS heatmap as a PostGIS point and trigger ML risk overlay recalculation.

---

#### Flow 6: GIS Map & ML Dashboard (CHO/PHN Read-Only)

1. User navigates to **Intelligence → Disease Map**. MapLibre GL JS renders a choropleth of Dasmariñas barangays colored by case density.
2. User can toggle heatmap layers: Dengue, TB, Maternal Risk, Malnutrition.
3. Clicking a barangay polygon opens a sidebar with the BHS's current indicator snapshot and any active disease alerts.
4. User navigates to **Intelligence → Forecasting**. Prophet-generated outbreak risk curves are shown per disease type for the next 30/60/90 days.
5. ITRs flagged as "High-Risk" by the `scikit-learn` risk classifier are rendered as distinct point markers on the map.

---

### 1.4 Milestones & Phased Roadmap

#### Phase 1 — Infrastructure & Foundation
**Goal:** Functional, authenticated skeleton. Nothing clinical yet.
- Supabase project setup: schema, RLS policies per role, PostGIS extension enabled.
- FastAPI project with Docker Compose, environment config, and health-check endpoint.
- React + TypeScript frontend with Tailwind and shadcn/ui design system initialized.
- Vercel CI/CD pipeline connected to the frontend repo.
- PWA manifest, service worker shell, and IndexedDB abstraction layer in place.
- User authentication (Supabase Auth) with role-based route guards on the frontend.
- System Admin panel: create/deactivate users, assign roles and BHS.

**Exit Criteria:** A logged-in user sees a role-appropriate dashboard shell. Role guards block unauthorized routes.

---

#### Phase 2 — EHR / ITR & TCL Entry
**Goal:** BHWs can capture visits; Midwives can validate and manage records.
- Unified Patient Registry (create, search by name/ID, view ITR).
- BHW offline entry forms for all 5 service types (Maternal, Immunization, NCD, TB-DOTS, Nutrition).
- IndexedDB sync engine with background sync and conflict resolution.
- Midwife validation queue (approve / return with reason).
- TCL views: Maternal Care, EPI Registry, TB Register, NCD List, Nutrition Masterlist.
- Automated computations: AOG from LMP, WHO Z-scores, PhilPEN risk score, EPI schedule.
- High-risk auto-flagging (BP > 140/90, severe wasting, age > 35 with pregnancy).
- Audit log for all record state transitions.

**Exit Criteria:** BHW submits an offline visit; it syncs, appears in Midwife queue; Midwife approves it; ITR and TCL are updated. All computations verified against DOH standards.

---

#### Phase 3 — FHSIS Reporting Pipeline (ST → MCT → M1/M2)
**Goal:** Automate the full reporting chain from BHS to city level.
- Auto-tally ST engine (aggregates validated TCL by FHSIS indicator per BHS per month).
- Midwife ST generation UI with pre-flight check and remark annotations.
- PHN MCT Dashboard (32-BHS grid, per-ST review, outlier highlighting).
- MCT merge engine (sums 32 STs into city-wide MCT per DOH DM 2024-0007 formulas).
- PHIS Coordinator DQC checklist and override audit trail.
- M1/M2 report export service (Excel via `openpyxl`, PDF via `WeasyPrint`).
- City Health Officer sign-off workflow with digital timestamp.
- PIDSR entry form + Category I WebSocket alert system (DSO dashboard).
- Electronic CIF workflow and 24-hour compliance metric display.

**Exit Criteria:** Full reporting cycle executable end-to-end in the system. M1/M2 output matches manually calculated reference reports. WebSocket alert fires within 2 seconds of Category I case save.

---

#### Phase 4 — Spatial Intelligence & Predictive Analytics
**Goal:** Transform validated data into geographic and predictive insights.
- PostGIS geometry columns populated for all `disease_cases` and `patients` (barangay-level geocoding).
- MapLibre GL JS disease map with choropleth and heatmap layers (Dengue, TB, Maternal, Nutrition).
- Barangay polygon click → BHS snapshot sidebar.
- Celery + Redis background task queue for ML jobs.
- Prophet-based outbreak forecasting pipeline (per-disease 30/60/90-day curves).
- `scikit-learn` ITR risk classifier (binary: high-risk / standard), trained on historical MCT data.
- Risk overlay layer on the GIS map (high-risk ITR point markers).
- Inventory & Supply Chain Lite: stock item management, usage logging against patient visits, low-stock threshold alerts.

**Exit Criteria:** City Health Officer can open the map, view live case density, toggle disease layers, and see ML forecast curves. Inventory alerts fire when stock falls below threshold.

---

## 2. Technical Requirements & Engineering Design

### 2.1 Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Database** | Supabase (PostgreSQL 15+) | Managed Postgres with built-in Auth, RLS, Realtime, and Storage. |
| **Spatial DB** | PostGIS extension | GeoJSON geometry storage; `ST_AsGeoJSON()` for RFC 7946 API output. |
| **Backend API** | FastAPI (Python 3.12+) | Async-native; Pydantic v2 for FHSIS field validation; OpenAPI docs auto-generated. |
| **Python Dep. Mgmt** | uv | Fast resolver; `pyproject.toml` + `uv.lock`; use `uv add` / `uv sync`. |
| **Background Tasks** | Celery + Redis | ML job queue; report generation; defaulter-check scheduled tasks. |
| **Frontend** | React **19** + TypeScript | Type-safe FHSIS forms; React Compiler enabled via `babel-plugin-react-compiler`. |
| **Build Tool** | Vite **8** | Frontend bundler; `@tailwindcss/vite` plugin; `@` alias resolves to `src/`. |
| **Styling** | Tailwind CSS **v4** | CSS-first config (no `tailwind.config.js`); all tokens defined in `src/index.css`. |
| **UI Components** | shadcn/ui (**base-vega** style) | Uses `@base-ui/react` primitives (not Radix); `mist` base color; icons via `lucide-react`. |
| **Package Manager** | npm | `package-lock.json` is the lock file; do not use pnpm or yarn. |
| **PWA / Offline** | Vite PWA plugin + Workbox | Service worker generation; precaching; background sync strategy. |
| **Offline Storage** | IndexedDB (via Dexie.js) | Structured offline storage for BHW pending records with sync queue. |
| **Map Rendering** | MapLibre GL JS | Open-source; GeoJSON-native; choropleth + heatmap layers from PostGIS output. |
| **ML / Analytics** | scikit-learn + Prophet | Risk classification (sklearn); time-series outbreak forecasting (Prophet). |
| **Report Export** | openpyxl + WeasyPrint | DOH-formatted Excel (M1/M2) and PDF generation server-side. |
| **Real-Time** | Supabase Realtime (WebSockets) | PIDSR Category I alert broadcast to DSO sessions. |
| **Hosting (Web/PWA)** | Vercel | CDN-edge delivery; CI/CD on push to `main`. |
| **Hosting (API/ML)** | DigitalOcean App Platform | Dockerized FastAPI + Celery workers; managed Redis add-on. |
| **Containerization** | Docker + Docker Compose | Multi-stage builds; `docker compose up` is the **single local dev command** for the full stack. |
| **Auth** | Supabase Auth (JWT) | Row-Level Security enforcement at the DB layer; role claim in JWT. |

---

### 2.2 Technical Architecture

#### Repository & Folder Structure

```
project-link/
├── backend/
│   ├── app/              # FastAPI application (routers, models, services, schemas)
│   │   ├── api/          # Route handlers, one sub-package per endpoint group
│   │   ├── core/         # Config, auth, database session
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic v2 request/response schemas
│   │   ├── services/     # Business logic (tally engine, ML, report export)
│   │   └── main.py       # FastAPI app factory & lifespan
│   ├── pyproject.toml    # uv-managed dependencies
│   └── uv.lock
├── frontend/
│   ├── src/
│   │   ├── components/   # Shared UI components (shadcn + custom)
│   │   ├── lib/          # Utilities, Supabase client, Dexie DB
│   │   └── hooks/        # Custom React hooks
│   ├── components.json   # shadcn config (base-vega style, mist color)
│   └── package.json
├── e2e/                  # Playwright end-to-end tests
├── docs/                 # architecture.md, changelog.md, project_status.md
├── .env                  # Local secrets (gitignored)
├── .env.example          # Env var reference (committed)
├── docker-compose.yml    # Local full-stack orchestration
└── CLAUDE.md
```

> `backend/main.py` is a temporary FastAPI smoke-test file. All real application code lives under `backend/app/`.

#### System Overview

```
[BHW PWA]─────offline────►[IndexedDB]──sync──►[FastAPI /sync]─►[Supabase DB]
[Midwife/Nurse Web App]──────────────────────►[FastAPI REST API]─►[Supabase DB]
[DSO Web App]◄──WebSocket (Realtime)──────────────────────────────[Supabase DB]
[CHO Web App]──────────────────────►[FastAPI ML/GIS endpoints]──►[PostGIS / Celery]
```

#### API Design Conventions

- Base URL: `/api/v1/`
- Auth: Bearer JWT (Supabase-issued) on all endpoints.
- All responses: `{ data, meta, error }` envelope.
- Soft-delete: `DELETE` endpoints set `deleted_at`; never hard-delete clinical records.
- Pagination: `?page=1&page_size=25` on all list endpoints.

**Key Endpoint Groups:**

| Group | Prefix | Notes |
| :--- | :--- | :--- |
| Auth | `/auth/` | Supabase Auth passthrough; role claim injection. |
| Patients | `/patients/` | CRUD + city-wide search; cross-BHS read requires `nurse_phn` or above. |
| Visits | `/visits/{type}/` | One sub-router per service type (maternal, immunization, ncd, tb, nutrition). |
| Sync | `/sync/` | Accepts batched IndexedDB payload from PWA; idempotent upsert. |
| Reports | `/reports/` | ST generation, MCT generation, M1/M2 export. |
| Alerts | `/alerts/` | Disease case CRUD; Category I triggers Supabase Realtime broadcast. |
| GIS | `/gis/` | Returns RFC 7946 GeoJSON for map layers. |
| ML | `/ml/` | Forecast curves, risk-score batch endpoint. |
| Inventory | `/inventory/` | Stock items, transactions, low-stock status. |
| Admin | `/admin/` | User management, BHS registry, RLS config. |

---

### 2.3 Database Schema (First Draft)

> All clinical tables include: `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`, `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ`, `deleted_at TIMESTAMPTZ` (soft delete per RA 10173). RLS policies enforce role-based access at the DB layer.

---

#### Core / Registry Tables

```sql
-- Geographic unit for each BHS
CREATE TABLE barangays (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  city        TEXT NOT NULL DEFAULT 'Dasmariñas',
  geometry    GEOMETRY(MultiPolygon, 4326),  -- PostGIS
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 32 Barangay Health Stations
CREATE TABLE health_stations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barangay_id  UUID REFERENCES barangays(id),
  name         TEXT NOT NULL,
  address      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- System users (extends Supabase Auth users)
CREATE TABLE user_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN (
                    'system_admin','city_health_officer','phis_coordinator',
                    'dso','nurse_phn','midwife_rhm','bhw')),
  health_station_id UUID REFERENCES health_stations(id), -- NULL for city-level roles
  purok_assignment  TEXT,  -- BHW only
  is_active        BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

#### Patient & ITR Tables

```sql
-- Unified patient identity (one record across all 32 BHS)
CREATE TABLE patients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_id        TEXT UNIQUE NOT NULL,  -- generated: DASMA-YYYYMMDD-XXXXX
  last_name         TEXT NOT NULL,
  first_name        TEXT NOT NULL,
  middle_name       TEXT,
  birthdate         DATE NOT NULL,
  sex               TEXT CHECK (sex IN ('M','F')),
  civil_status      TEXT,
  address           TEXT,
  barangay_id       UUID REFERENCES barangays(id),
  purok             TEXT,
  contact_number    TEXT,
  philhealth_number TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

-- Individual Treatment Record header (one per patient per BHS enrollment)
CREATE TABLE itrs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID REFERENCES patients(id),
  health_station_id UUID REFERENCES health_stations(id),
  enrolled_at       TIMESTAMPTZ DEFAULT now(),
  social_history    JSONB,  -- smoking, alcohol, allergies
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);
```

---

#### Visit / TCL Tables

```sql
-- Maternal care visits
CREATE TABLE maternal_visits (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID REFERENCES patients(id),
  health_station_id UUID REFERENCES health_stations(id),
  submitted_by      UUID REFERENCES user_profiles(id),  -- BHW or Midwife
  validated_by      UUID REFERENCES user_profiles(id),
  status            TEXT DEFAULT 'PENDING_VALIDATION'
                    CHECK (status IN ('PENDING_SYNC','PENDING_VALIDATION','VALIDATED','RETURNED')),
  visit_date        DATE NOT NULL,
  lmp               DATE,
  edc               DATE,   -- auto-calculated: lmp + 280 days
  aog_weeks         INTEGER, -- auto-calculated
  gravida           INTEGER,
  para              INTEGER,
  bp_systolic       INTEGER,
  bp_diastolic      INTEGER,
  weight_kg         NUMERIC(5,2),
  is_high_risk      BOOLEAN DEFAULT false,  -- auto-flagged
  high_risk_reasons TEXT[],
  services_given    TEXT[],  -- e.g. ['TT2','Fe/Folate','Deworming']
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

-- Immunization records (EPI)
CREATE TABLE immunization_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID REFERENCES patients(id),
  health_station_id UUID REFERENCES health_stations(id),
  submitted_by      UUID REFERENCES user_profiles(id),
  validated_by      UUID REFERENCES user_profiles(id),
  status            TEXT DEFAULT 'PENDING_VALIDATION'
                    CHECK (status IN ('PENDING_SYNC','PENDING_VALIDATION','VALIDATED','RETURNED')),
  date_given        DATE NOT NULL,
  vaccine_name      TEXT NOT NULL,  -- BCG, Penta1-3, OPV1-3, IPV, MCV1-2, etc.
  dose_number       INTEGER,
  lot_number        TEXT,
  site              TEXT,
  given_by          TEXT,
  next_due_date     DATE,  -- auto-calculated per EPI schedule
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

-- NCD visits (HTN, DM — PhilPEN)
CREATE TABLE ncd_visits (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID REFERENCES patients(id),
  health_station_id UUID REFERENCES health_stations(id),
  submitted_by      UUID REFERENCES user_profiles(id),
  validated_by      UUID REFERENCES user_profiles(id),
  status            TEXT DEFAULT 'PENDING_VALIDATION'
                    CHECK (status IN ('PENDING_SYNC','PENDING_VALIDATION','VALIDATED','RETURNED')),
  visit_date        DATE NOT NULL,
  bp_systolic       INTEGER,
  bp_diastolic      INTEGER,
  fasting_blood_sugar NUMERIC(6,2),
  bmi               NUMERIC(5,2),
  risk_level        TEXT CHECK (risk_level IN ('LOW','MEDIUM','HIGH')),  -- PhilPEN
  current_medications TEXT[],
  referred_to_physician BOOLEAN DEFAULT false,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

-- TB-DOTS treatment records
CREATE TABLE tb_dots_cases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID REFERENCES patients(id),
  health_station_id UUID REFERENCES health_stations(id),
  submitted_by      UUID REFERENCES user_profiles(id),
  validated_by      UUID REFERENCES user_profiles(id),
  status            TEXT DEFAULT 'PENDING_VALIDATION'
                    CHECK (status IN ('PENDING_SYNC','PENDING_VALIDATION','VALIDATED','RETURNED')),
  case_type         TEXT,  -- New, Relapse, Treatment After Failure, etc.
  treatment_start   DATE,
  regimen           TEXT,
  treatment_phase   TEXT CHECK (treatment_phase IN ('INTENSIVE','CONTINUATION')),
  sputum_result     TEXT,
  outcome           TEXT,  -- Cured, Treatment Completed, Died, Lost to Follow-up
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

-- TB drug intake logs (daily check-ins)
CREATE TABLE tb_dot_checkins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tb_case_id     UUID REFERENCES tb_dots_cases(id),
  logged_by      UUID REFERENCES user_profiles(id),  -- BHW
  checkin_date   DATE NOT NULL,
  drugs_taken    BOOLEAN DEFAULT true,
  side_effects   TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Child nutrition assessments
CREATE TABLE nutrition_visits (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID REFERENCES patients(id),
  health_station_id UUID REFERENCES health_stations(id),
  submitted_by      UUID REFERENCES user_profiles(id),
  validated_by      UUID REFERENCES user_profiles(id),
  status            TEXT DEFAULT 'PENDING_VALIDATION'
                    CHECK (status IN ('PENDING_SYNC','PENDING_VALIDATION','VALIDATED','RETURNED')),
  visit_date        DATE NOT NULL,
  age_months        INTEGER,
  weight_kg         NUMERIC(5,2),
  height_cm         NUMERIC(5,2),
  muac_cm           NUMERIC(4,2),
  waz               NUMERIC(5,2),  -- computed: Weight-for-Age Z-score
  haz               NUMERIC(5,2),  -- computed: Height-for-Age Z-score
  whz               NUMERIC(5,2),  -- computed: Weight-for-Height Z-score
  nutritional_status TEXT,  -- Normal, Underweight, Stunted, Wasted, Severely Wasted
  is_high_risk      BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);
```

---

#### PIDSR / Disease Surveillance Tables

```sql
-- PIDSR disease cases
CREATE TABLE disease_cases (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID REFERENCES patients(id),
  health_station_id   UUID REFERENCES health_stations(id),
  reported_by         UUID REFERENCES user_profiles(id),
  validated_by        UUID REFERENCES user_profiles(id),
  disease_name        TEXT NOT NULL,
  icd10_code          TEXT,
  category            TEXT CHECK (category IN ('I','II','III')),  -- RA 11332
  case_classification TEXT CHECK (case_classification IN ('SUSPECT','PROBABLE','CONFIRMED')),
  date_of_onset       DATE,
  date_reported       TIMESTAMPTZ DEFAULT now(),
  validated_at        TIMESTAMPTZ,
  outcome             TEXT,
  location_geometry   GEOMETRY(Point, 4326),  -- PostGIS point for GIS layer
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ
);

-- Real-time alerts (Category I trigger)
CREATE TABLE disease_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_case_id UUID REFERENCES disease_cases(id),
  alert_type      TEXT DEFAULT 'CATEGORY_I_IMMEDIATE',
  message         TEXT,
  broadcast_at    TIMESTAMPTZ DEFAULT now(),
  acknowledged_by UUID REFERENCES user_profiles(id),
  acknowledged_at TIMESTAMPTZ
);
```

---

#### Reporting Tables

```sql
-- BHS-level monthly Summary Table
CREATE TABLE summary_tables (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  health_station_id UUID REFERENCES health_stations(id),
  generated_by      UUID REFERENCES user_profiles(id),
  reviewed_by       UUID REFERENCES user_profiles(id),
  period_year       INTEGER NOT NULL,
  period_month      INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  status            TEXT DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT','SUBMITTED','RETURNED','APPROVED')),
  indicators        JSONB NOT NULL,  -- keyed by FHSIS indicator code
  remarks           JSONB,           -- per-indicator remarks from Midwife/PHN
  submitted_at      TIMESTAMPTZ,
  approved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ,
  UNIQUE (health_station_id, period_year, period_month)
);

-- City-level Monthly Consolidation Table
CREATE TABLE monthly_consolidation_tables (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_by    UUID REFERENCES user_profiles(id),
  approved_by     UUID REFERENCES user_profiles(id),
  signed_by       UUID REFERENCES user_profiles(id),
  period_year     INTEGER NOT NULL,
  period_month    INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  status          TEXT DEFAULT 'DRAFT'
                  CHECK (status IN ('DRAFT','PENDING_DQC','APPROVED','SIGNED')),
  indicators      JSONB NOT NULL,
  dqc_log         JSONB,  -- DQC check results and override justifications
  approved_at     TIMESTAMPTZ,
  signed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ,
  UNIQUE (period_year, period_month)
);

-- Export history for M1/M2/Q1/A1 reports
CREATE TABLE report_exports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mct_id      UUID REFERENCES monthly_consolidation_tables(id),
  exported_by UUID REFERENCES user_profiles(id),
  report_type TEXT CHECK (report_type IN ('M1','M2','Q1','A1')),
  file_url    TEXT,  -- Supabase Storage URL
  exported_at TIMESTAMPTZ DEFAULT now()
);
```

---

#### Supporting Tables

```sql
-- Append-only audit log (RA 10173 compliance)
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES user_profiles(id),
  action      TEXT NOT NULL,  -- e.g. 'VALIDATE_VISIT', 'GENERATE_ST', 'EXPORT_M1'
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT now()
);
-- NOTE: No UPDATE or DELETE on this table. INSERT only via RLS.

-- Inventory items per BHS
CREATE TABLE inventory_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  health_station_id UUID REFERENCES health_stations(id),
  item_name         TEXT NOT NULL,
  category          TEXT,  -- Vaccine, Medicine, Supply
  unit              TEXT,
  current_stock     INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

-- Stock transactions (usage per patient visit)
CREATE TABLE stock_transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id        UUID REFERENCES inventory_items(id),
  patient_id     UUID REFERENCES patients(id),
  logged_by      UUID REFERENCES user_profiles(id),
  transaction_type TEXT CHECK (transaction_type IN ('IN','OUT','ADJUSTMENT')),
  quantity       INTEGER NOT NULL,
  reference_id   UUID,  -- links to the visit record that consumed the item
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);
```

---

### 2.4 Infrastructure Provisioning

| Service | Provider | Action Required |
| :--- | :--- | :--- |
| **Local Dev** | Docker Compose | `docker compose up` starts FastAPI + Celery + Redis + (optional) local Supabase proxy together. |
| PostgreSQL + Auth + Realtime | Supabase | Create project; enable PostGIS; configure RLS policies per role; set JWT secret in FastAPI env. |
| File Storage (report exports) | Supabase Storage | Create `reports` bucket with RLS; signed URLs for downloads. |
| Backend API | DigitalOcean App Platform | Deploy Dockerized FastAPI app; set env vars (Supabase URL, JWT secret, Redis URL). |
| Background Workers | DigitalOcean (worker dyno) | Deploy Celery worker container pointing at Redis add-on. |
| Redis | DigitalOcean Managed Redis | Provision via add-on; used for Celery broker + result backend. |
| Frontend / PWA | Vercel | Connect GitHub repo; set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars; enable HTTPS (required for service workers). |
| Domain & SSL | Vercel + DigitalOcean | Configure custom domain; SSL auto-provisioned. |
| MapLibre Tiles | MapTiler (free tier) or self-hosted PMTiles | API key stored as Vercel env var; Dasmariñas barangay GeoJSON stored in Supabase Storage. |
| CI/CD | GitHub Actions | Run `pytest` on backend PRs; `tsc --noEmit` + Vitest on frontend PRs; auto-deploy to Vercel on merge to `main`. |

---

## 3. Key Technical Constraints & Decisions

| Constraint | Decision |
| :--- | :--- |
| Offline field entry | IndexedDB via Dexie.js; Workbox background sync; last-write-wins with server timestamp as tiebreaker. |
| Data privacy (RA 10173) | `deleted_at` soft delete on all clinical tables; no PII in logs; audit_logs INSERT-only via RLS. |
| Reporting accuracy (DOH DM 2024-0007) | FHSIS indicator codes and formulas maintained in a single versioned config file; unit-tested against reference outputs. |
| 24-hour disease reporting (RA 11332) | Category I detection fires synchronously in the `disease_cases` insert handler before the API returns 201. |
| Multi-BHS data isolation | Supabase RLS: BHW/Midwife rows filtered by `health_station_id`; PHN/above read all; enforced at DB layer, not just API. |
| ML model serving | Models trained offline on historical MCT data, serialized as `.pkl`, loaded at FastAPI startup; retrained monthly via Celery beat. |
| Local dev workflow | `docker compose up` from repo root. Frontend: `cd frontend && npm run dev`. Backend only: `cd backend && uv run uvicorn app.main:app --reload`. |
| Tailwind CSS v4 | No `tailwind.config.js`; all design tokens and theme overrides live in `frontend/src/index.css` using `@theme`. |
| shadcn components | Always install via `npx shadcn add <component>` from `frontend/`; never hand-write shadcn primitives. Uses `@base-ui/react`, not Radix. |
