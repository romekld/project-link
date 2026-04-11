# Project LINK — Agent Reference

This is the primary reference file for all AI agents working in this repository. All project context, architecture, and constraints live here.

---

## Project Identity

**Project LINK (Local Information Network for Kalusugan)** — an integrated health station management system for City Health Office II (CHO II), Dasmariñas City. It digitizes paper-based records across 32 Barangay Health Stations (BHS) and consolidates them into a city-wide analytics platform.

---

## Documentation Map

| File | Purpose |
| :--- | :--- |
| `docs/project_spec.md` | Full product requirements, user flows, DB schema, and phased roadmap. |
| `docs/brainstorm.md` | Original working context and problem analysis. Reference only. |
| `docs/architecture.md` | System design, data flow, and technical decisions. |
| `docs/PLANS/changelog.md` | Version history and notable changes. |
| `docs/PLANS/project-status.md` | Current phase progress and milestone tracking. |
| `project-link/docs/PLANS/shadcn-admin-to-web-migration-checklist.md` | Reference checklist for mapping `apps/shadcn-admin` patterns to `apps/web` Next.js targets. |
| `project-link/docs/PLANS/frontend-architecture-agent-reference.md` | AI-agent implementation reference for `apps/web` architecture and dashboard layout conventions. |
| `docs/references/research/fhsis_mop/` | FHSIS Manual of Operations reference (DOH DM 2024-0007). |

Update the relevant `docs/` files after completing a major milestone or making a significant architectural change.

---

## Architecture

### Two-tier data model

**BHS Tier** — 32 barangay health stations. BHWs capture visits offline; Midwives validate and manage TCL records; Midwives generate end-of-month Summary Tables (ST).

**CHO Tier** — city-wide. Public Health Nurses consolidate 32 STs into a Monthly Consolidation Table (MCT); PHIS Coordinator runs DQC and exports M1/M2 reports; CHO monitors real-time disease alerts.

### Zero-Tally architecture

The core innovation: `TCL → ST → MCT` is fully automated. The auto-tally engine aggregates all `VALIDATED` TCL records for a BHS/period into an ST on demand. The MCT engine merges 32 approved STs into one city-wide table. No manual counting.

### Offline-first PWA

BHWs work in remote puroks without connectivity. The PWA uses **Dexie.js** (IndexedDB) as a local store. A Workbox service worker background-sync job flushes `PENDING_SYNC` records to `POST /api/v1/sync` when connectivity returns. The sync endpoint is idempotent (upsert by client-generated ID).

### Service boundaries

- `apps/web` — Next.js App Router, internal dashboard only (not public-facing). Handles UI and frontend-adjacent CRUD. May call Supabase directly or proxy through `apps/api`.
- `apps/api` — FastAPI. Reserved for health-domain validation, reporting workflows (PDF/XLSX export), analytics, and future ML. Currently minimal scaffold.
- `supabase/` — Postgres, Auth, RLS, Storage, and future Realtime. RLS is enforced at the DB layer; never rely solely on API-layer checks for BHS scoping.
- `packages/` — shared code only when reuse across apps is justified. Currently empty.

### User roles

| Code | Role | Primary Surface |
| :--- | :--- | :--- |
| `system_admin` | System Admin | Internal dashboard |
| `cho` | City Health Officer | Internal dashboard |
| `phis` | PHIS Coordinator | Internal dashboard |
| `rhm` | Public Health Nurse | Internal dashboard |
| `phn` | Rural Health Midwife | Dashboard + mobile-capable web |
| `bhw` | Barangay Health Worker | Mobile-first web app |

---

## Locked Tech Stack

### Frontend (`apps/web`)

| Area | Tool | Notes |
| :--- | :--- | :--- |
| Framework | Next.js 16 App Router | Breaking changes from earlier versions — read `node_modules/next/dist/docs/` before writing Next.js code |
| UI components | shadcn/ui | `style: radix-nova`, base color `mist`, icon library `lucide` |
| Styling | Tailwind v4 CSS-first | No `tailwind.config.js`; tokens in `app/globals.css` |
| Forms | React Hook Form + Zod | Zod for all schema validation |
| Server state | TanStack Query (React Query) | Data fetching, caching, background sync |
| Offline store | Dexie.js (IndexedDB) | Local persistence for BHW offline workflows |
| Service worker | Workbox | Background sync, PWA caching |
| Maps | MapLibre GL JS | GIS layer — barangay boundaries, disease heat maps |
| Localization | next-intl | Dynamic English/Filipino (Tagalog) toggle — **BHW/PWA surfaces only** for Phase 1; all other dashboards English-only; clinical field labels always in English per DOH standard |
| Import alias | `@/` maps to `apps/web/` | |
| RSC | Default to Server Components | `"use client"` only when necessary |

### Backend (`apps/api`)

| Area | Tool | Notes |
| :--- | :--- | :--- |
| Framework | FastAPI (Python) | Complex health-domain logic, reporting, analytics, future ML |
| Validation | Pydantic | Built into FastAPI |
| PDF export | reportlab | Server-side generation of official DOH M1/M2 reports |
| Excel export | openpyxl | Server-side generation of FHSIS .xlsx exports |

### Data Platform

| Area | Tool | Notes |
| :--- | :--- | :--- |
| Database | Supabase (Postgres) | Primary data store |
| Auth | Supabase Auth + `@supabase/ssr` | Admin invite-only — no self-registration |
| Realtime | Supabase Realtime | In-app disease alerts via WebSocket |
| RLS | Supabase RLS policies | Enforced at DB layer for all BHS-scoped data — never rely on API-layer checks alone |

### Deployment

| Service | Platform | Notes |
| :--- | :--- | :--- |
| `apps/web` | Vercel | Zero-config Next.js deployment |
| `apps/api` | Digital Ocean App Platform | Containerized FastAPI; uses GitHub Student Dev Pack credits |
| Database / Auth | Supabase hosted | |

### Testing

| Area | Tool | Notes |
| :--- | :--- | :--- |
| Unit / integration | Vitest | Configured in `apps/web`; run via `pnpm test` |
| End-to-end | Playwright | Configured at repo root in `e2e/`; includes mobile viewport for BHW PWA |
| CI | GitHub Actions | Runs lint + unit tests on every push; e2e on PRs to `main` |

---

## Monorepo Layout

The actual monorepo lives inside `project-link/` at the repo root. Run all commands from there unless noted otherwise.

```text
project-link/
  apps/
    web/          Next.js 16 App Router — internal dashboard + BHW PWA
    api/          FastAPI scaffold — health-domain logic, reporting, analytics
  packages/
    supabase/     Supabase CLI config and migrations
    eslint-config/
    typescript-config/
  turbo.json
  pnpm-workspace.yaml
  package.json
```

---

## Design & UI/UX Guidelines

### Visual Style

Clean and minimal. Prioritize information clarity over decoration. All layouts must be responsive and work on both desktop (web) and mobile (PWA).

### Copy Tone

- **Navigation, onboarding, empty states:** Casual, friendly, humanized. Short labels and plain instructions.
- **Clinical field labels, validation, alerts, confirmations:** Precise and unambiguous. Use exact clinical terminology (e.g. "Systolic BP", not "top number"). Error messages must state what is wrong and what the valid range is.

### Healthcare-Specific UX Patterns

**Clinical safety — confirmation on state changes:** Any irreversible status change (approving an ST, returning a record to BHW, Lost to Follow-up) requires an explicit confirmation step. Never place approve and reject/return actions adjacent without clear visual separation.

**Status visibility:** Every clinical record must show its current status (`PENDING_VALIDATION`, `VALIDATED`, `RETURNED`, etc.) as a persistent badge — visible in list views, not only on detail pages.

**High-risk flag prominence:** Patients flagged as high-risk (BP > 140/90, severe wasting, Category I disease) must carry a persistent color-coded indicator that survives list pagination.

**Offline/sync state (PWA):** Always show online/offline status and count of pending-sync records. Submitting while offline must feel intentional ("Saved locally — will sync when online").

**Touch targets (PWA):** Minimum 44×44px touch targets. BHWs work in field conditions, often one-handed.

**Progressive form saving (PWA):** Long clinical forms (maternal, NCD) must auto-save to IndexedDB as the user fills them out — recoverable if the app is closed mid-form.

**Keyboard navigation (web):** PHN and PHIS Coordinator dashboards are desktop-heavy. All tables, modals, and form flows must be fully keyboard-navigable.

**ARIA live regions for alerts:** WebSocket alerts must use ARIA live regions so they are announced to screen readers.

**Inline clinical validation:** Avoid generic messages like "Invalid value". Use: "LMP must be within the last 10 months" or "EDC is auto-calculated — do not edit directly".

---

## Critical Compliance Rules

These are non-negotiable and must be preserved in any code touching clinical data:

| Rule | Requirement |
| :--- | :--- |
| RA 10173 | No hard deletes on clinical tables. No PII in logs. `audit_logs` is append-only. |
| RA 11332 | Category I disease case → `disease_alerts` insert + WebSocket broadcast fires **before** the API returns 201. |
| DOH DM 2024-0007 | FHSIS indicator codes, field names, and M1/M2 formulas must match the standard exactly. |
| RLS | Data isolation is enforced at the DB layer. Never rely solely on API-layer checks for BHS scoping. |
