# Project LINK — Project Status

> Last updated: 2026-04-20

---

## Milestones

| # | Milestone | Status |
|---|---|---|
| M1 | Repo setup, monorepo, infra, auth scaffold | Done |
| M2 | Dashboard shell, dynamic sidebar, role route entry points | Done |
| M3 | Users management UI (list, add, edit, status, reset) | Done |
| **M4** | **Auth + users management wired to Supabase DB** | **Done ✓** |
| M5 | Health data modules (ITR, TCL forms for BHW / Midwife) | Not started |
| M6 | ST / MCT consolidation and reporting pipeline | Not started |
| **M7** | **GIS mapping surface** | **In progress - frontend workspace** |
| M8 | ML / predictive analytics | Not started |
| M9 | PWA / offline sync (IndexedDB) | Not started |

---

## Accomplished

- Monorepo fully operational (`apps/web`, `apps/api`, `packages/supabase`).
- Next.js 16 App Router with Tailwind v4 + shadcn/ui (radix-nova / mist).
- Supabase remote project provisioned (`wxtyrjpicjqjgwxrwdmp`).
- All 5 DB migrations applied (enums, health_stations stub, profiles, RLS, email column).
- Auth wired end-to-end: login → Supabase Auth → role-based redirect.
- Forced password change flow: middleware gate + Server Action clears flag.
- Middleware covers: session refresh, public-path guard, `must_change_password` gate, role-prefix restriction.
- Admin users management fully wired to DB:
  - Live list from `profiles` table.
  - Create user (Supabase Auth + profile insert with rollback).
  - Edit user profile fields.
  - Bulk status toggle and bulk reset password.
- Seed script (`scripts/seed-admin.mjs`) for first `system_admin` account.
- `.mcp.json` removed from git tracking to protect credentials.
- Barangay GIS workspace started:
  - Admin Health Stations nav now exposes `Barangays`.
  - Registry mode renders Dasmarinas barangay boundaries from `docs/gis/dasmarinas_boundaries.geojson`.
  - CHO2 scope context is derived from `docs/gis/cho2_boundaries.geojson`.
  - Shared MapLibre map shell supports theme-aware CARTO/optional MapTiler basemaps, polygon hover/selection, and popup metadata.
  - Coverage Planner mode supports frontend staged add/remove changes with review/apply controls and batch reason UI.
- Admin user form role codes aligned with active enum slugs (`rhm`, `phn`, `phis`, `cho`).
---

## Next Steps

- Finish M7 backend alignment:
  - Adapt previous GIS reference migrations into current `packages/supabase/migrations`.
  - Replace local GeoJSON DTOs with `city_barangays`, `barangay_coverage_map_view`, geometry history, and import job queries.
  - Wire Coverage Planner apply flow to audited backend RPCs.
  - Add browser smoke tests for map click, popup, table selection, and coverage staging.
- Continue M5 health data modules:
  - Design `patients` / `itrs` / `tcl` data model and migrations.
- BHW mobile-first ITR entry form (offline-capable, IndexedDB buffered).
- Midwife/RHM approval gate: review and promote pending BHW entries.
- TCL module shells for: Maternal Care, Immunization, TB-DOTS, NCD.
- Role dashboards for `cho`, `phn`, `rhm` (currently shell only).
- BHW `/bhw` mobile dashboard (currently shell only).
