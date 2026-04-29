# Changelog

All notable changes to Project LINK are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] - 2026-04-20

### Added
- **CHO analytics GIS workspace** - added a CHO-only `/cho/analytics/gis` route with route-specific dashboard chrome, typed mock analytics, a map-first `MapLibre + deck.gl` workspace, and a docked analytics rail with charts, drilldown, and compact alert feed.
- **Barangay GIS Workspace** - added a map-first admin workspace for city barangay registry inspection, GeoJSON import review scaffolding, and CHO2 Coverage Planner staging.
- **Shared GIS map foundation** - added reusable MapLibre shell, popup, layer, and style helpers under `features/gis-map`, with light/dark basemap behavior tied to the app theme.
- **Coverage Planner UI** - added staged add/remove workflow, batch reason review, reset/apply controls, map/table sync, and coverage summary panels.

### Changed
- **Health Stations navigation** - consolidated city barangay registry and coverage planning into the `Barangays` workspace instead of separate sidebar entries.
- **GIS data shaping** - derives registry and coverage context from `docs/gis/dasmarinas_boundaries.geojson` and `docs/gis/cho2_boundaries.geojson` for the frontend-first phase.
- **Admin user role slugs** - aligned user-management forms and mock data with active role codes (`rhm`, `phn`, `phis`, `cho`).

### Fixed
- **Map interaction polish** - barangay polygons now use theme-aware boundary colors, hover/selected/staged styling, and popup-based metadata instead of a permanent overlay.
- **GIS workspace layout** - made the left summary rail compact/sticky and moved title, tabs, and workspace actions into the main toolbar.

---
## [Unreleased] — 2026-04-12

### Added
- **Supabase Auth wiring** — login form now calls `signInWithPassword`; errors surface via `useActionState`; successful login redirects to the user's role home route.
- **Forced password change flow** — `/change-password` page with Server Action that calls `auth.updateUser` and clears `must_change_password` on the profile row.
- **Middleware** — session refresh, public-path redirect, protected-path guard, `must_change_password` gate, and role-based prefix restriction (`/admin` → `system_admin` only).
- **Supabase client layer** (`lib/supabase/`) — `createBrowserClient`, `createServerClient` (cookie-based), and service-role `createAdminClient`.
- **DB migrations (5)** — `user_role`/`user_status` enums, `health_stations` stub table (5 seeded BHS rows), `profiles` table (1-to-1 with `auth.users`), RLS policies + `get_my_role()` SECURITY DEFINER, `email` column on profiles.
- **Admin users queries** (`features/admin/users/queries.ts`) — `getUsers`, `getUser`, `getNextUserSeed`, `getHealthStations` — all read from live Supabase.
- **Admin users Server Actions** (`features/admin/users/actions.ts`) — `createUserAction` (auth + profile, with rollback), `updateUserAction`, `setUserStatusAction` (bulk), `resetPasswordsAction` (bulk).
- **Users page wired to DB** — `app/(dashboard)/admin/users/page.tsx` is now an async Server Component that calls `getUsers()` and passes `initialUsers` to the Client Component.
- **Add/Edit user pages wired to DB** — `AddUserPage` accepts `seed` prop from `getNextUserSeed()`; `EditUserPage` accepts `user: AdminUser | null` from `getUser(id)`.
- **Seed script** (`scripts/seed-admin.mjs`) — zero-dependency Node script that creates the first `system_admin` account using the Supabase Admin REST API.

### Changed
- **Role model simplification** — removed the separate reporting coordinator role from active Project LINK roles; the City Health Officer (`cho`) now owns final DQC, discrepancy returns, report approval, export, submission, and reporting-cycle closure.
- **Role-code references** — standardized role documentation so `phn` maps to Public Health Nurse and `rhm` maps to Rural Health Midwife.
- **FHSIS workflow documentation** — updated authored docs and Mermaid flowcharts so the reporting handoff chain is `BHW -> RHM -> PHN -> CHO`.
- `AdminUser` schema: replaced `passwordState: UserPasswordState` with `mustChangePassword: boolean`; added `healthStationId: string | null`.
- `UserRole` enum updated to new slugs: `bhw`, `rhm`, `phn`, `cho`, `system_admin`.
- `AdminUsersPage` accepts `initialUsers: AdminUser[]` prop instead of generating mock data internally.
- `users-mobile-cards.tsx`: updated `passwordState` reference → `mustChangePassword`.
- `users.ts` mock data: updated role slugs, replaced `passwordState` with `mustChangePassword`, added `healthStationId: null`.
- `buildDefaultFormValues`: `healthStationId` now reads from `user.healthStationId`; `mustChangePassword` reads from `user.mustChangePassword`.
- `supabase/config.toml` `project_id` corrected to remote project ref.
- `.gitignore`: added `.mcp.json` to prevent accidental credential commits.
- `pnpm-lock.yaml`: added `@supabase/ssr` and `@supabase/supabase-js` lockfile entries.

### Fixed
- Mock data generation no longer used on live pages; all data originates from the Supabase DB.

### Removed
- Removed the standalone reporting-coordinator userflow document; final DQC/export/submission workflow now lives in `docs/userflow/cho/cho-userflow.md`.

---

## [0.3.0] — 2026-04-11

### Added
- Users management UI: data table with faceted filters, column visibility, row selection, bulk actions.
- Users mobile card layout for small viewports.
- Add user form (multi-section: identity, contact, address, account, assignment).
- Edit user form pre-populated from user data.
- `users-stats.tsx` summary bar (active, inactive, invited, suspended counts).
- `users-columns.tsx` with sortable and filterable column definitions.

### Fixed
- Faceted filter popover width constraint.

---

## [0.2.0] — 2026-04-10

### Added
- Dynamic sidebar with role-aware navigation.
- System admin route group (`/admin/*`) with dedicated shell layout.
- M2 milestone: all major role route entry points scaffolded.
- Dashboard shell layout with header, sidebar, and content area.

---

## [0.1.0] — 2026-04-09

### Added
- Monorepo initialized: `apps/web`, `apps/api`, `packages/supabase`, `packages/eslint-config`, `packages/typescript-config`.
- Next.js 16 App Router scaffolded with Tailwind v4 + shadcn/ui (`style: radix-nova`, `baseColor: mist`).
- FastAPI scaffold in `apps/api`.
- Supabase CLI initialized in `packages/supabase`.
- Login page and auth route group.
- `CLAUDE.md`, `AGENTS.md`, `docs/project_spec.md`, `docs/brainstorm.md`.
