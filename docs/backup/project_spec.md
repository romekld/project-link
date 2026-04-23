# Project LINK Project Specification

## Document Status

- Status: Locked baseline
- Last updated: 2026-04-10
- Companion document: `docs/architecture.md`
- Purpose: Product and phase reference aligned to the currently locked architecture and repository setup

## Workflow Diagram References

This specification is aligned with these process flow artifacts:

- `docs/diagrams/flowcharts/manual-fhsis-process-flowchart.md` (legacy as-is baseline)
- `docs/diagrams/flowcharts/digital-fhsis-process-flowchart.md` (target to-be workflow)

Where wording differs, the digital flowchart is the source of truth for validation gates, correction loops, and consolidation sequencing.

## 1. Executive Summary

Project LINK (Local Information Network for Kalusugan) is a health station management platform for CHO II and its barangay health stations. The system is being designed as a production-oriented web platform that supports field capture, validation, reporting, and future GIS intelligence through a phased rollout.

The system direction is now locked as:

- pure web application
- PWA-enabled experience
- offline-capable product direction
- monorepo architecture
- hybrid stack using Next.js, FastAPI, and Supabase

This document reflects the decisions that were actually finalized, not the older brainstorm assumptions.

## 2. Locked Product Decisions

### 2.1 Platform Direction

- The product is a pure web app
- The product includes PWA features
- Offline capability is part of the intended product design
- The project should follow the cleanest production path rather than the fastest thesis-only shortcut

### 2.2 Repository and Architecture

The repository structure is locked as:

```text
apps/
  web/
  api/
packages/
supabase/
docs/
```

The architecture model is:

- monorepo for code organization
- decoupled service boundaries at runtime

### 2.3 Application Boundaries

- `apps/web` is the internal dashboard application
- `apps/web` is not a public-facing marketing website
- `apps/api` is the FastAPI service boundary for heavier domain logic
- `supabase/` is the database/auth/configuration boundary
- `packages/*` is reserved for shared packages only when reuse is justified

### 2.4 Frontend and Backend Responsibilities

- Next.js may eventually handle basic CRUD and frontend-adjacent route logic
- FastAPI is reserved for complex logic such as health data validation, reporting workflows, and future analytics/ML
- Supabase remains the managed platform for database, auth, RLS, storage, and future realtime support

### 2.5 Phase Direction

- Phase 1 is frontend-first
- Phase 1 is not the full product implementation
- Phase 1 should build the UI foundation for all major user roles
- Phase 1 should preserve a clean path for future Supabase and FastAPI wiring

## 3. Product Vision

Project LINK is intended to become the operational system for:

- field-level patient and service data capture
- BHS-level review and validation
- CHO-level monitoring and reporting
- future GIS intelligence and risk support

The product is not being built as a disposable prototype. Even the early UI phase should preserve production-grade architectural boundaries.

## 4. Primary Users

| Role | Code | Primary Surface | Core Responsibility |
|---|---|---|---|
| System Admin | `system_admin` | Internal dashboard | Platform administration and configuration |
| City Health Officer | `cho` | Internal dashboard | Oversight, final data-quality review, reporting export/submission, and city-level monitoring |
| Public Health Nurse | `phn` | Internal dashboard | Consolidation review and city-level workflows |
| Rural Health Midwife | `rhm` | Internal dashboard, mobile-capable web | BHS workflows and record stewardship |
| Barangay Health Worker | `bhw` | Mobile-first internal web app | Field capture and follow-up workflows |

## 5. Current Technical Baseline

This section describes the current repo setup as of this rewrite.

### 5.1 Monorepo Root

The repo currently has:

- root `package.json`
- root `pnpm-workspace.yaml`
- root `turbo.json`
- root `pnpm-lock.yaml`

### 5.2 `apps/web`

Current direction:

- Next.js App Router application
- internal dashboard only
- TypeScript
- Tailwind CSS
- shadcn/ui initialized

Current implementation state:

- app is scaffolded and buildable
- still close to the default generated Next.js app after reinstall
- requires internal dashboard restructuring in future implementation work

### 5.3 `apps/api`

Current direction:

- FastAPI service boundary
- scaffolded only for now

Current implementation state:

- minimal FastAPI app exists
- suitable as a Phase 1 placeholder/service stub

### 5.4 `supabase/`

Current direction:

- Supabase CLI-managed project directory
- future home for migrations, policies, and project configuration

Current implementation state:

- initialized
- still minimal
- full schema and policy work is deferred beyond the current setup phase

## 6. Finalized Technical Direction

### 6.1 Frontend

| Area | Decision |
|---|---|
| Main app | Next.js App Router in `apps/web` |
| Frontend scope | Internal dashboard application only |
| UI stack | React, TypeScript, Tailwind, shadcn/ui |
| UX direction | Desktop-grade admin views plus mobile-first field workflows |
| PWA | Required |
| Offline | Product requirement, scaffolded before fully implemented |

### 6.2 Backend

| Area | Decision |
|---|---|
| Domain service | FastAPI in `apps/api` |
| Responsibility | Health-domain validation, reporting, integrations, analytics, future ML |
| Phase 1 state | Scaffold/minimal |

### 6.3 Data Platform

| Area | Decision |
|---|---|
| Primary platform | Supabase |
| Expected use | Postgres, Auth, RLS, Storage, future Realtime |
| Local repo boundary | `supabase/` |

### 6.4 Shared Code

| Area | Decision |
|---|---|
| Shared packages | `packages/*` |
| Current rule | Keep minimal until reuse is real |

## 7. Product Scope

### 7.1 Full Product Scope

The intended full product scope includes:

- unified patient registry
- longitudinal records
- TCL-driven workflows
- validation flows
- ST generation
- MCT consolidation
- reporting exports
- disease alerting
- GIS surfaces
- future risk and forecasting support

### 7.2 Phase 1 Scope

Phase 1 is the frontend foundation phase.

Phase 1 includes:

- all major internal user-role interfaces
- route structure and workflow shells in `apps/web`
- clickable role-based flows
- real local form state and client-side validation
- internal dashboard information architecture
- placeholders or stubs for backend-heavy capabilities
- PWA/offline-aware frontend structure

Phase 1 does not require:

- full production auth rollout
- full Supabase persistence
- final reporting engine
- final validation-gate logic
- full GIS implementation
- final analytics or ML implementation

## 8. Phase 1 Goal

### Phase 1 Title

Frontend Foundation and Internal Dashboard Structure

### Phase 1 Goal

Build the internal dashboard application in `apps/web` so it can accurately represent the workflows of all major user roles while staying cleanly separated from unfinished backend and data concerns.

### Phase 1 Success Criteria

- `apps/web` has a coherent internal dashboard structure
- the root route and future route tree reflect internal product use, not public marketing use
- all major roles have identifiable workflow entry points
- role workflows in the UI can be traced to the digital flowchart hand-offs (BHW -> RHM -> PHN -> CHO)
- UI architecture is ready for future backend and database wiring
- mock data and placeholders are isolated so they can be replaced later

## 9. Route and App Structure Direction for `apps/web`

The web app should be structured as an internal dashboard application, not a public site.

Recommended direction:

- App Router
- route groups when helpful for internal organization
- shared layouts at the proper route boundary
- reusable UI outside route folders
- route-local/private helper folders when needed

The app should grow toward internal routes such as:

- `/`
- `/dashboard`
- `/patients`
- `/roles`
- `/forms`
- `/reports`
- `/gis`

These are internal dashboard routes, not public-facing pages.

## 10. Responsibilities by Boundary

### `apps/web`

Owns:

- role-facing UI
- route structure
- dashboards
- forms
- local interaction logic
- PWA behavior
- offline scaffolding
- future frontend-adjacent basic CRUD

Should not own:

- heavy reporting logic
- final validation orchestration
- ML workloads
- backend-only business rules

### `apps/api`

Owns:

- health data validation services
- reporting workflows
- TCL to ST to MCT orchestration
- backend-only business logic
- future analytics and ML services

### `supabase/`

Owns:

- project configuration
- migrations
- RLS policies
- auth-related configuration
- seed and schema lifecycle

## 11. Deferred Decisions

These decisions remain intentionally open for later sessions:

- exact write boundaries between Next.js and FastAPI
- exact direct-read/write strategy between `apps/web` and Supabase
- detailed validation-gate data model
- GIS internal architecture
- full reporting engine design
- realtime implementation details
- exact auth rollout sequence for Phase 1 versus later phases

## 12. Current Gaps Between Locked Architecture and Current Setup

This section is important because the current repo setup is valid, but the implementation still needs to catch up to the locked architecture.

### `apps/web`

The current reinstall has left `apps/web` closer to the stock Next.js starter than the intended internal dashboard architecture.

That means future work still needs to:

- replace the stock landing page
- apply the internal dashboard route structure
- align metadata and layout to Project LINK
- cleanly organize internal route groups and shared UI

### `apps/api`

The API app is scaffolded but intentionally minimal. That is acceptable for Phase 1.

### `supabase/`

Supabase is initialized but not yet fully modeled. That is also acceptable for the current phase.

## 13. Immediate Next Implementation Priorities

The next practical priorities after this spec are:

1. structure `apps/web` according to internal-dashboard App Router best practice
2. define the role-based route map
3. establish the shared shell and navigation patterns
4. introduce mock data and placeholder workflow modules
5. keep `apps/api` and `supabase/` minimal until the frontend architecture stabilizes
6. ensure route and workflow shells map cleanly to `docs/diagrams/flowcharts/digital-fhsis-process-flowchart.md`

## 14. Summary

Project LINK is now specified as:

- a monorepo
- a pure web platform with PWA direction
- an internal dashboard-first web app in `apps/web`
- a FastAPI domain backend in `apps/api`
- a Supabase-backed data platform in `supabase/`
- a frontend-first Phase 1 that intentionally does not overbuild backend concerns

This specification replaces the older pre-lock assumptions and should be treated as the current product baseline moving forward.

