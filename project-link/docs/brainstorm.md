# HSMS / Project LINK — Complete Working Context

## 1. Project Identity

**Project LINK (Local Information Network for Kalusugan)** is an integrated health station management system and a digital health information platform designed to transform how barangay health stations under City Health Office II (CHO II) in Dasmariñas City manage, analyze, and utilize community health data.

The system unifies fragmented patient records and public health program data into a centralized platform that:

- Streamlines documentation.
- Automates reporting.
- Enhances decision-making through real-time dashboards.
- Provides geographic disease mapping and ML-based predictive analytics.

By combining health information management, spatial intelligence, and proactive health forecasting, LINK empowers health workers and local health administrators to shift from reactive record-keeping to data-driven public health management.

### Project Tiers

Project LINK operates across two tiers to address the fragmented information flow between CHO 2 and its 32 Barangay Health Stations (BHS):

1. **BHS Tier (Primary Source Digitization)**
   - **Goal:** Digitizes paper-based clinical records (ITR and TCL) across 32 BHS.
   - **Features:** Offline-capable field entry for BHWs and Midwives.
   - **Workflow:** BHW field entry → Nurse/Midwife approval.
   - **Innovation:** A "Digital Validation Gate" ensures raw field data is reviewed and "promoted" to official status, maintaining data integrity.

2. **CHO Tier (Consolidation & Analytics)**
   - **Goal:** Aggregates validated data from all 32 BHS into a unified city-wide view.
   - **Features:** Live disease alerts (WebSockets), GIS disease mapping, and ML outbreak forecasting.
   - **Innovation:** The "Zero-Tally" System replaces the manual 5-day tally process with instant ST → MCT → M1/M2 report generation.

---

## 2. Problem Analysis

### 2.1 Current State (Before HSMS)

- **No Digital Infrastructure:** All 32 health stations operate entirely on paper. Existing desktops are only used as printers.
- **Data Silos:** Each health station is an island. There is no shared system to search or analyze patient data across the city.
- **Summary-Only Digitization:** Data enters digital systems only at the CHO level as aggregate counts, losing all patient-level detail.
- **Encoder Bottleneck:** A single person encodes reports for all 32 stations (192+ reports/month). If they are unavailable, the entire city's reporting fails.
- **Shadow Systems:** BHWs use personal phone notepads during visits and manually copy to paper later, leading to undetectable data loss.
- **Lagged Detection:** Defaulters (TB, prenatal, immunization) are only detected during monthly tallies, leading to at least a 30-day response lag.

### 2.2 Core Problem Statement

CHO 2 serves 164,691 people but lacks the tools to manage their health information as a connected, actionable body of data. The current manual compression and transcription of data introduce errors and destroy the granularity needed for timely intervention. Consequently, CHO 2 cannot identify at-risk populations, tracking treatment adherence, or spot emerging outbreaks in real-time.

### 2.3 Operational Failures

- **Slow Disease Signaling:** Outbreak detection relies on monthly tallies. RA 11332 (24-hour reporting) is structurally impossible to fulfill.
- **Fragile Compliance:** FHSIS compliance rests on a single point of failure (one encoder).
- **Memory-Dependent Care:** Treatment continuity depends on the personal memory of individual BHWs rather than a systemic safety net.

---

## 3. The Solution: Project LINK vs. Legacy

| Operational Domain | Current State (Fragmented & Reactive) | Future State with Project LINK (Integrated & Proactive) |
| :--- | :--- | :--- |
| **Health Data Governance** | Paper logbooks, duplicate identities, limited traceability. | **Centralized ITR** acting as a single source of truth with standardized records. |
| **Field Operations** | Manual documentation, delayed encoding, transcription errors. | **Offline-capable mobile capture** with automated sync and validation workflows. |
| **Public Health Reporting** | Manual tallying and consolidation bottlenecks. | **Automated aggregation** providing instant metrics and M1/M2 reports. |
| **Surveillance** | Delayed identification of trends via manual analysis. | **GIS mapping & ML analytics** for hotspot identification and predictive forecasting. |
| **Care Continuity** | Difficult to track transfers or missed follow-ups. | **City-wide patient search** and automated tracking of treatment adherence. |

---

## 4. User Roles & Access Matrix

| Role | Code | Access Mode | Clinical Scope | Data Scope | Primary Function |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **System Admin** | `system_admin` | Web only | None | System-wide | Manages RLS policies, users, and mapping. |
| **City Health Officer** | `cho` | Web + Mobile | Read-only | All 32 BHS | Monitors GIS/ML; signs final M1/M2. |
| **PHIS Coordinator** | `phis` | Web only | Read-only | All 32 BHS | Auditor: Performs final DQC; manages exports. |
| **Public Health Nurse** | `rhm` | Web only | Full CRUD | All 32 BHS | Aggregator: Reviews STs to generate MCT. |
| **Rural Health Midwife** | `phn` | Web + Mobile | Full CRUD | Own BHS Only | Record Keeper: Manages ITR/TCL; creates ST. |
| **Barangay Health Worker** | `bhw` | Mobile-first | Create (Pending) | Assigned Purok | Field Data Capture: Entry of point-of-care services. |

---

## 5. Project Structure

```text
backend/app/         # FastAPI, ML Models, Aggregation Logic
frontend/src/        # React TS, Tailwind, shadcn components
```

---

## 6. Critical Workflows

### 6.0 Workflow Reference Artifacts

The narrative in this document is anchored to two canonical process diagrams:

- `docs/diagrams/flowcharts/manual-fhsis-process-flowchart.md` for the legacy paper workflow
- `docs/diagrams/flowcharts/digital-fhsis-process-flowchart.md` for the Project LINK target workflow

These diagrams should be treated as the visual source of truth for hand-offs, validation gates, and return loops across BHW, Midwife, PHN, and PHIS roles.

### 6.1 ITR & TCL Entry (Point of Care)

- **Trigger:** BHW/Midwife logs a patient service.
- **Action:** System updates individual Treatment Record (ITR) and populates Target Client List (TCL).
- **Constraint:** IndexedDB used for offline-first capability in remote Puroks.

### 6.2 Automated ST Generation (BHS Level)

- **Trigger:** End-of-month cutoff at the BHS.
- **Action:** Midwife validates submissions, then triggers the auto-tally engine.
- **Output:** Generates Summary Table (ST) for health program accomplishments.
- **Flowchart Alignment:** Includes return/resubmission paths before records become validated.

### 6.3 The MCT Consolidation (City Level)

- **Trigger:** Nurse (PHN) initiates city-wide review.
- **Action:** Nurse reviews 32 automated STs.
- **Process:** Merges validated STs into the Monthly Consolidation Table (MCT).
- **Flowchart Alignment:** Consolidation runs only after required summary-table approvals are complete.

### 6.4 Reporting & Alerting

- **Trigger:** PHIS Coordinator verification of the MCT.
- **Output:** Auto-generation of official M1/M2 reports.
- **Emergency:** Category I cases trigger immediate WebSocket alerts to the DSO (RA 11332 compliance).
- **Flowchart Alignment:** PHIS data-quality check has an explicit return path before export/submission.

---

## 7. System Architecture (The Innovation)

Project LINK introduces a **"Zero-Tally"** architecture. By automating the data progression from **TCL → ST → MCT**, the system provides:

1. Digital Verification Trail: Logs every validation action for DOH audit compliance.
2. Defaulter Tracking Alerts: Automates follow-up lists for BHWs based on DOH windows (e.g., missed Measles vaccine).
3. Predictive Risk Overlay: Uses ML models on historical trends to forecast outbreaks and flags "High-Risk" ITRs in the GIS heatmap via `scikit-learn`.

---

## 8. Engineering Requirements & Technical Stack

| Layer | Technology | Implementation Detail |
| :--- | :--- | :--- |
| **Database & Auth** | Supabase (PostgreSQL) | PostGIS for mapping; RLS for data privacy. |
| **Backend API** | FastAPI | Async-native; handles MCT logic; ORM Pydantic. |
| **Frontend Web** | Next.js + React + TypeScript | Type-safety for FHSIS; Tailwind for responsive design. |
| **UI Components** | shadcn/ui | Accessible, high-contrast clinical dashboards. |
| **Map Rendering** | MapLibre GL JS | GeoJSON RFC 7946 native; choropleth + heatmap rendering of PostGIS output. |
| **Hosting (Web)** | Vercel | CI/CD for frontend assets. |
| **Hosting (API/ML)** | DigitalOcean | Dockerized FastAPI + Celery/Redis for background tasks. |
| **Containerization** | Docker + Compose | Multi-stage builds for Lean images; docker-compose for local orchestration. |

---

## 9. Implementation Milestones (MVP Plan)

- **Phase 1:** Frontend UI interfaces for all user roles to visualize the flow and of each users.

---

## 10. Compliance and Standards

| Standard | What It Requires | Where It Appears in the Codebase |
| :--- | :--- | :--- |
| **DOH DM 2024-0007** | FHSIS 2024 indicator names, field names, and report formulas—all must match exactly. | `tasks/report_generation.py`; FHSIS auto-report service; all M1/M2/Q1/A1 computed fields. |
| **RA 11332 / AO 2021-0057** | Category I notifiable disease reporting within 24 hours. | `disease_cases` → `disease_alerts` insert + WebSocket broadcast on case save; validated_at gap metric. |
| **RA 10173 (Data Privacy Act)** | No DELETE on clinical tables; no patient PII in logs; audit log retention. | `deleted_at TIMESTAMPTZ` on all clinical tables; `WHERE deleted_at IS NULL` on all reads; Supabase RLS policies; audit_logs append-only. |
| **RA 7883 (BHW Benefits)** | Informs BHW role design—BHW is a supervised field contributor, not a formal FHSIS reporting entity. | `bhw` role: CRUD with `PENDING` status; Midwife/Nurse approval gate before ST/MCT inclusion. |
| **ISO/IEC 25010** | Software quality evaluation framework (functional suitability, reliability, security, usability). | Thesis evaluation methodology and User Acceptance Testing (UAT) criteria. |
| **PhilPEN Protocol** | NCD management at primary care level—HTN/DM risk stratification. | `ncd_visits.risk_level` (PhilPEN low/medium/high); automated physician referral logic in NCD module. |
| **WHO Z-score Standards** | Weight-for-age (WAZ), height-for-age (HAZ), and weight-for-height (WHZ) classification. | `nutrition_visits` computed fields; nutritional status enums; ML at-risk trigger on severe wasting detection. |
| **RFC 7946** | GeoJSON format for all spatial API responses. | `func.ST_AsGeoJSON()` wrapping all geometry returns; MapLibre GL JS consumes GeoJSON natively for heatmaps. |

---

## 11. System Modules (Functional Breakdown)

### Module 1: Electronic Health Record (EHR) & ITR Manager

- **Purpose:** Replaces paper filing cabinets with a unified, searchable patient identity.

- **Key Features:**
  - **Unified Patient ID:** Prevents duplicate records across 32 BHS.
  - **Digital ITR:** Stores vitals, social history, and clinical notes.
  - **Cross-Station Interoperability:** Patient history follows them across all barangays.

### Module 2: Digital FHSIS Reporting Pipeline (ST & MCT)

- **Purpose:** Automates the manual tallying process to eliminate the "Encoder Bottleneck."

- **Key Features:**
  - **Automated TCL:** Digital forms for Maternal Care, Immunization, TB-DOTS, and NCDs.
  - **ST Engine:** One-click auto-generation of BHS-level summaries.
  - **MCT Dashboard:** Nurse review and city-wide merger of 32 STs.
  - **Export Service:** DOH-compliant Excel/PDF reports (M1, M2, Q1, A1).

### Module 3: PIDSR & WebSocket Alert System

- **Purpose:** Ensures compliance with RA 11332 (Mandatory Disease Reporting).

- **Key Features:**
  - **Immediate Alerts:** WebSockets send instant notifications to the DSO for Category I cases.
  - **Electronic PIDSR:** Replaces handwritten Case Investigation Forms (CIF).

### Module 4: Spatial Intelligence (GIS Mapping)

- **Purpose:** Visualizes health data for geographic resource allocation.

- **Key Features:**
  - **PostGIS Heatmaps:** Displays validated cases on a map of Dasmariñas.
  - **Cluster Detection:** Identifies hotspots for high-risk cases (Dengue, TB).

### Module 5: Predictive Analytics & Forecasting (ML)

- **Purpose:** Moves CHO from reactive to proactive management.

- **Key Features:**
  - **Outbreak Forecasting:** Uses Prophet library on historical MCT data.
  - **Risk Stratification:** `scikit-learn` flags high-risk ITRs based on PhilPEN and WHO standards.

### Module 6: Inventory & Supply Chain Lite

- **Purpose:** Tracks "last-mile" delivery of vaccines and medicine at the BHS.

- **Key Features:**
  - **Stock Transactions:** Log supply usage against patient visits.
  - **Low-Stock Alerts:** Threshold-based notifications for critical supplies.

---

## 12. Summary of Innovation (The "LINK" Advantage)

| Domain | Traditional Paper Process | Project LINK Digital Process |
| :--- | :--- | :--- |
| **Reporting** | 5 days of manual tallying per month. | 5 seconds for automated ST/MCT generation. |
| **Identity** | Patients have 32 different files at 32 stations. | One Unified ITR accessible city-wide. |
| **Response** | Outbreaks are found 30 days later. | Instant WebSocket alerts for critical cases. |
| **Planning** | Decisions based on "gut feel" or old data. | Decisions based on GIS Mapping and ML Forecasts. |

---

## 13. Digitized Program Modules (FHSIS-Aligned)

To make the system **"DOH-Ready,"** each program is digitized as a specific sub-module within the TCL (Target Client List) layer.

### 13.1 Maternal Care Module

- **Paper Process:** Manual ledgers for prenatal dates.

- **Digital Transformation:**
  - **AOG Calculation:** Auto-calculates EDC from LMP input.
  - **High-Risk Flagging:** Automated tagging for Physician Review if BP $>140/90$ or Age $>35$.
  - **Auto-Tally:** Populates M1 Indicator 1.1 (4+ prenatal visits).

### 13.2 Child Clinical & Immunization Module

- **Paper Process:** Manual checking of "Under-Five" cards.

- **Digital Transformation:**
  - **EPI Scheduler:** Generates a vaccine calendar based on birth date.
  - **Defaulter Alerts:** Push notifications for missed vaccines (e.g., Measles at 10 months).
  - **WHO Z-Score Integration:** Auto-calculates nutritional status from height/weight.

### 13.3 TB-DOTS & Infectious Disease Module

- **Paper Process:** Manual sputum tracking in TB registers.

- **Digital Transformation:**
  - **Adherence Tracking:** SMS reminders and BHW check-in logging.
  - **Surveillance Trigger:** Positive results automatically alert the DSO dashboard.

### 13.4 NCD (Non-Communicable Disease) & PhilPEN

- **Paper Process:** Isolated blood pressure checks on paper slips.

- **Digital Transformation:**
  - **Risk Stratification:** Uses PhilPEN algorithm for CV event risk scoring (Low/Medium/High).
  - **Longitudinal View:** Graphs showing BP/Blood Sugar trends over 12 months (impossible on paper).
