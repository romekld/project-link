# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Identity

**Project LINK (Local Information Network for Kalusugan)** — an integrated health station management system for City Health Office II (CHO II), Dasmariñas City. It digitizes paper-based records across 32 Barangay Health Stations (BHS) and consolidates them into a city-wide analytics platform.

Full product and technical requirements: `project_spec.md`. Original working context: `brainstorm.md`.

**Current phase:** Phase 1 (Infrastructure). The frontend (`App.tsx`) and backend (`backend/main.py`) are scaffold stubs only. No application code has been written yet.

---

## Commands

### Full stack (preferred)
```bash
docker compose up          # starts FastAPI + Celery + Redis together
```

### Frontend only
```bash
cd frontend
npm run dev                # dev server at http://localhost:5173
npm run build              # tsc + vite build
npm run lint               # eslint
```

### Backend only
```bash
cd backend
uv sync                    # install/sync dependencies from pyproject.toml
uv add <package>           # add a new dependency
uv run uvicorn app.main:app --reload   # dev server at http://localhost:8000
```

### E2E tests (Playwright)
```bash
cd e2e
npm ci
npx playwright install --with-deps
npx playwright test                          # all tests, all browsers
npx playwright test tests/example.spec.ts   # single file
npx playwright test --project=chromium      # single browser
```

### shadcn components
```bash
cd frontend
npx shadcn add <component>   # always install this way; never hand-write primitives
```

---

## Architecture

### Two-tier data model

**BHS Tier** — 32 barangay health stations. BHWs capture visits offline; Midwives validate and manage TCL records; Midwives generate end-of-month Summary Tables (ST).

**CHO Tier** — city-wide. Public Health Nurses consolidate 32 STs into a Monthly Consolidation Table (MCT); PHIS Coordinator runs DQC and exports M1/M2 reports; DSO monitors real-time disease alerts.

### Record status lifecycle
All clinical records flow through this state machine before reaching reports:
```
PENDING_SYNC → PENDING_VALIDATION → VALIDATED → (aggregated into ST) → (merged into MCT)
```
BHW-submitted records are always `PENDING_VALIDATION` until a Midwife or Nurse approves them. This is the **Digital Validation Gate** — BHW entries never go directly into FHSIS reports.

### Zero-Tally architecture
The core innovation: `TCL → ST → MCT` is fully automated. The auto-tally engine aggregates all `VALIDATED` TCL records for a BHS/period into an ST on demand. The MCT engine merges 32 approved STs into one city-wide table. No manual counting.

### Data isolation (RLS)
Supabase Row-Level Security enforces access at the **database layer**, not just the API:
- `bhw` / `midwife_rhm` — rows scoped to their `health_station_id`
- `nurse_phn` and above — read across all 32 BHS
- `audit_logs` — INSERT only; no UPDATE or DELETE permitted by any role

### Offline-first PWA
BHWs work in remote puroks without connectivity. The PWA uses **Dexie.js** (IndexedDB) as a local store. A Workbox service worker background-sync job flushes `PENDING_SYNC` records to `POST /api/v1/sync` when connectivity returns. The sync endpoint is idempotent (upsert by client-generated ID).

### Real-time disease alerts
When a `disease_cases` record is saved with `category = 'I'`, the backend inserts a `disease_alerts` row and broadcasts via **Supabase Realtime** (WebSocket) to all active DSO sessions — synchronously, before returning HTTP 201. This is the RA 11332 compliance path.

---

## Repo Structure

```
project-link/
├── backend/
│   ├── app/              # All real FastAPI code goes here
│   │   ├── api/          # Route handlers (one sub-package per endpoint group)
│   │   ├── core/         # Config, auth, DB session
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic v2 schemas
│   │   ├── services/     # Business logic (tally engine, ML, report export)
│   │   └── main.py       # App factory & lifespan
│   ├── pyproject.toml    # uv-managed deps
│   └── uv.lock
├── backend/main.py       # Temporary smoke-test stub — not the real app entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # shadcn UI + custom components
│   │   ├── lib/          # Supabase client, Dexie DB, utilities
│   │   └── hooks/        # Custom React hooks
│   └── components.json   # shadcn config
├── e2e/                  # Playwright tests (runs from its own package.json)
└── docs/                 # architecture.md, changelog.md, project_status.md
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8 |
| **Styling** | Tailwind CSS v4 (CSS-first, no config file) |
| **UI Components** | shadcn/ui — base-vega style, `@base-ui/react` primitives, `mist` base color |
| **Icons** | lucide-react |
| **PWA / Offline** | Vite PWA plugin + Workbox (service worker, background sync) |
| **Offline Storage** | Dexie.js (IndexedDB wrapper) |
| **Package Manager** | npm |
| **Backend** | FastAPI (Python 3.12+), uv, Pydantic v2, SQLAlchemy |
| **Background Tasks** | Celery + Redis |
| **Report Export** | openpyxl (Excel), WeasyPrint (PDF) |
| **ML / Analytics** | scikit-learn (risk classification), Prophet (outbreak forecasting) |
| **Database** | Supabase — PostgreSQL 15 + PostGIS, Auth, Realtime, Storage |
| **Map Rendering** | MapLibre GL JS + MapTiler tiles |
| **Hosting** | Vercel (frontend), DigitalOcean App Platform (API + Celery workers) |
| **Local Dev** | Docker Compose |
| **E2E Testing** | Playwright |

---

## Frontend Conventions

**Tailwind v4** — CSS-first. There is no `tailwind.config.js`. All design tokens and theme overrides live in `frontend/src/index.css` inside the `@theme inline { }` block. Do not create a config file.

**shadcn base-vega** — Uses `@base-ui/react` primitives, not Radix UI. Components are installed into `src/components/ui/`. The base color is `mist`. Always use `npx shadcn add` to install; check `components.json` for the current config before adding.

**Fonts** — Inter Variable (body/sans) and Geist Variable (headings) loaded via `@fontsource-variable`. Mapped as `--font-sans` and `--font-heading` in the `@theme` block.

**Dark mode** — toggled via the `.dark` class on a parent element (shadcn pattern). System preference is also handled via `@media (prefers-color-scheme: dark)` for non-shadcn elements.

**`@` alias** — resolves to `frontend/src/`. Use for all internal imports.

**React Compiler** — enabled via `babel-plugin-react-compiler`. Do not manually memoize with `useMemo`/`useCallback` unless profiling proves it necessary.

---

## Design & UI/UX Guidelines

### Visual Style
Clean and minimal. Prioritize information clarity over decoration. Use shadcn components for all interactive elements to maintain visual consistency. All layouts must be responsive and work on both desktop (web) and mobile (PWA).

### Component Patterns
- All interactive elements use shadcn/ui components. Do not introduce a new UI library to solve a problem a shadcn component can handle.
- Consistent modular spacing using Tailwind spacing scale. No arbitrary pixel values unless inside `@theme`.
- High-contrast rendering for clinical data — status badges, risk flags, and alert states must remain legible in bright outdoor conditions (PWA) and on low-quality clinic monitors (web).

### Copy Tone
- **Navigation, onboarding, empty states:** Casual, friendly, and humanized. Short labels and plain instructions.
- **Clinical field labels, validation messages, alerts, and confirmations:** Precise and unambiguous. Use exact clinical terminology (e.g. "Systolic BP", not "top number"). Error messages must state what is wrong and what the valid range or format is (e.g. "Systolic BP must be between 60–250 mmHg").

### Healthcare-Specific UX Patterns

**Clinical safety — confirmation on state changes**
Any action that changes a record's status irreversibly (approving an ST, returning a record to BHW, marking a TB case as Lost to Follow-up) must require an explicit confirmation step. Never place approve and reject/return actions adjacently without clear visual separation.

**Status visibility**
Every clinical record must display its current status (`PENDING_VALIDATION`, `VALIDATED`, `RETURNED`, etc.) as a persistent, scannable badge — visible in list views, not only on detail pages.

**High-risk flag prominence**
Patients flagged as high-risk (BP > 140/90, severe wasting, Category I disease) must carry a persistent, color-coded visual indicator that survives list pagination. A flag visible only on the detail page is insufficient.

**Offline/sync state (PWA)**
The BHW PWA must always show online/offline status and the count of records pending sync. Submitting a form while offline must feel intentional — not broken. Use clear UI feedback ("Saved locally — will sync when online").

**Touch targets (PWA)**
All interactive elements in the PWA must have a minimum 44×44px touch target. BHWs work in field conditions, often one-handed.

**Progressive form saving (PWA)**
Long clinical forms (maternal, NCD) must auto-save to IndexedDB as the user fills them out — not only on final submit. If the app is closed mid-form, data must be recoverable.

**Keyboard navigation (web)**
The PHN and PHIS Coordinator dashboards are desktop-heavy. All tables, modals, and form flows must be fully keyboard-navigable.

**ARIA live regions for alerts**
The DSO's Category I WebSocket alerts must use ARIA live regions so they are announced to screen readers, not just visually rendered.

**Inline clinical validation**
Form validation messages must be clinically specific. Avoid generic messages like "Invalid value". Use messages like "LMP must be within the last 10 months" or "EDC is auto-calculated — do not edit directly".

---

## Backend Conventions

**Python dependency management** — use `uv` exclusively. `pyproject.toml` + `uv.lock` are the source of truth. Never use `pip install` directly.

**Pydantic v2** — all request/response schemas. FHSIS field names must match DOH DM 2024-0007 exactly; they are not for renaming or abbreviating.

**Soft delete** — clinical tables have `deleted_at TIMESTAMPTZ`. `DELETE` endpoints set this field. All reads must include `WHERE deleted_at IS NULL`. Never hard-delete a clinical record (RA 10173).

**API envelope** — all responses: `{ "data": ..., "meta": ..., "error": ... }`.

---

## Critical Compliance Rules

These are non-negotiable and must be preserved in any code touching clinical data:

| Rule | Requirement |
| :--- | :--- |
| RA 10173 | No hard deletes on clinical tables. No PII in logs. `audit_logs` is append-only. |
| RA 11332 | Category I disease case → `disease_alerts` insert + WebSocket broadcast fires **before** the API returns 201. |
| DOH DM 2024-0007 | FHSIS indicator codes, field names, and M1/M2 formulas must match the standard exactly. |
| RLS | Data isolation is enforced at the DB layer. Never rely solely on API-layer checks for BHS scoping. |

---

## Repo Etiquette

### Branching
- Never commit directly to `main`.
- Always create a feature branch before starting any significant change.
- Branch naming: `feature/short-description` or `fix/short-description`.

### Git Workflow
1. Create a feature or fix branch from `main`.
2. Develop and commit on that branch.
3. Test locally (`docker compose up`) before pushing.
4. Push the branch and open a Pull Request into `main`.
5. Use the `/update-docs-and-commit` slash command when committing — this ensures relevant `docs/` files are updated alongside code changes.

### Commits
- One logical change per commit.
- Commit message describes **what changed and why**, not just what files were touched.

### Pull Requests
- All changes to `main` go through a PR — no exceptions.
- Never force-push to `main`.
- PR description must state what changed and why.

---

## Documentation

| File | Purpose |
| :--- | :--- |
| `project_spec.md` | Full product requirements, user flows, DB schema, and phased roadmap. |
| `brainstorm.md` | Original working context and problem analysis. Reference only. |
| `docs/architecture.md` | System design, data flow, and technical decisions. |
| `docs/changelog.md` | Version history and notable changes. |
| `docs/project_status.md` | Current phase progress and milestone tracking. |

Update the relevant `docs/` files after completing a major milestone or making a significant architectural change. Use the `/update-docs-and-commit` slash command when doing so.
