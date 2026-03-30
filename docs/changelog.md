# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — 2026-03-27

### Added

**Supabase Foundation (TG1)**
- PostgreSQL migrations 001–008: extensions (PostGIS, uuid-ossp), `city_barangays`, `barangays`, `health_stations`, `user_profiles`, `audit_logs`, RLS policies, JWT role claim trigger
- Seed data: 75 Dasmariñas city barangays, 32 CHO2 operational barangays, 32 health stations auto-named from barangay names (geometry deferred to Phase 4)
- RLS policies enforcing public read on reference tables; self/admin access on `user_profiles`; INSERT-only on `audit_logs` (RA 10173)
- `sync_role_to_jwt()` trigger — propagates `role` and `health_station_id` into `auth.users.raw_app_meta_data` on every `user_profiles` insert/update
- `reports` Storage bucket with write-restricted RLS
- `create-user` Edge Function (Deno) — verifies `system_admin` JWT before creating auth users via service role; sets `must_change_password = true`; cleans up auth user if profile insert fails

**Frontend Auth Core (TG3)**
- `lib/supabase.ts` — Supabase JS singleton client wired to live project via `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `features/auth/components/auth-provider.tsx` — `onAuthStateChange` + session restore; manages `mustChangePassword` state and session-scoped dialog dismissal
- `features/auth/hooks/use-auth.ts` — `useAuth()` exposing `session`, `role`, `healthStationId`, `mustChangePassword`, `signOut`
- `features/auth/components/change-password-dialog.tsx` — controlled Dialog (no Escape/outside-click dismissal); skip persists `must_change_password = true`; on submit clears flag and refreshes session
- `app/providers.tsx` — `QueryClientProvider` + `AuthProvider` composition
- Login page (`pages/auth/login.tsx`) — login-03 layout; email + password; CHO2 access notice; no social buttons; redirects to role dashboard on success

**Routing + Role Guards (TG4)**
- TanStack Router (`app/router.tsx`) — `createRootRoute`, 7 role layout routes, 3 admin sub-routes (`/admin/users`, `/admin/users/new`, `/admin/users/$id/edit`)
- `requireAuth()` — redirects unauthenticated visitors to `/login`
- `requireRole(prefixes)` — redirects wrong-role access to the user's own dashboard root
- Login route `beforeLoad` redirects already-authenticated users to their dashboard
- `frontend/.env` created with live Supabase URL + anon key

**Shell UI (TG5, sidebar-07 pattern)**
- `components/layout/nav-config.ts` — `NAV_CONFIG` and `QUICK_LINKS_CONFIG` for all 7 roles
- `components/layout/app-branding.tsx` — LINK logo placeholder + "CHO II Dasmariñas" subtitle
- `components/layout/nav-main.tsx` — collapsible nav using `@base-ui/react` render prop pattern
- `components/layout/nav-quick-links.tsx` — hidden when sidebar collapsed to icon rail
- `components/layout/nav-user.tsx` — dropdown with Account, Settings, Log out
- `components/layout/app-sidebar.tsx` — `<Sidebar collapsible="icon">` composing branding + nav + user
- `components/layout/app-shell.tsx` — `SidebarProvider` wrapping `AppSidebar` + `SidebarInset` with `<Outlet />`
- 7 role dashboard shell pages (bhw, midwife, phn, phis, dso, cho, admin)

**Admin Panel (TG7)**
- User list (`/admin/users`) — search by name, role filter, BHS filter; status badges; Edit + Deactivate/Activate actions with `AlertDialog` confirmations
- `UserForm` — two-column: form fields (left 2/3) + sticky role summary card (right 1/3); all fields per spec including mobile validation (`+639XXXXXXXXX`), password toggle, 12-char minimum on create
- Create User page calls `create-user` Edge Function with session JWT
- Edit User page prefills from `user_profiles`; role/BHS changes propagate JWT claims via DB trigger

**New shadcn/ui components installed** — alert-dialog, badge, card, collapsible, dialog, dropdown-menu, input, label, separator, sheet, sidebar, skeleton, table, tooltip

### Changed
- `App.tsx` — replaced Vite scaffold stub with `<RouterProvider router={router} />`
- `app/providers.tsx` — replaced scaffold with `QueryClientProvider` + `AuthProvider`
- `app/router.tsx` — replaced stub with full TanStack Router configuration
- `lib/supabase.ts` — replaced placeholder with live Supabase client
- `types/database.ts` — replaced scaffold with `UserRole`, `UserProfile`, and `RecordStatus` types
- `index.css` — removed Vite scaffold `#root` constraints; layout now fills viewport with `min-height: 100svh`
- `components/ui/button.tsx` — patched for `@base-ui/react` render prop polymorphism (Phase 1 required `render` prop support)


**GIS Intelligence Page MVP (frontend-only spike, 2026-03-29)**
- Shared GIS feature module added in `frontend/src/features/intelligence/` with one reusable `IntelligenceMapPage`, role-aware view modes (`phn`, `dso`, `cho`), typed GIS contracts, and local fixture loaders
- Local frontend GeoJSON boundaries added: `frontend/src/features/intelligence/data/dasmarinas-boundaries.geojson` and `frontend/src/features/intelligence/data/cho2-boundaries.geojson`
- Mock disease heat overlay fixture added to support frontend interactions without backend/PostGIS wiring
- Explicit routes mounted to the shared page: `/phn/intelligence/map`, `/dso/intelligence/map`, `/cho/intelligence/map`
- `mapcn` map component integrated (`frontend/src/components/ui/map.tsx`) and used with shadcn UI controls (`Card`, `ToggleGroup`, `Badge`, `Tooltip`, `Sheet`, `Drawer`, `Alert`, `Skeleton`)
- GIS fixture tests added in `frontend/src/features/intelligence/fixtures.test.ts`

**GIS-related changes (2026-03-29)**
- `frontend/package.json` updated with GIS dependencies: `maplibre-gl`, `@types/geojson`, and `@turf/bbox`
- `frontend/src/app/router.tsx` updated so intelligence map routes resolve to explicit role pages instead of placeholder behavior
- `frontend/src/index.css` updated with `mapcn`/MapLibre popup and attribution style support

**Validation Notes (2026-03-29)**
- Frontend checks passed for GIS MVP implementation: `npm run lint`, `npm run build`, and `npx vitest run src/features/intelligence/fixtures.test.ts`
- Browser-driven Playwright validation was run against GIS routes (`/phn/intelligence/map`, `/dso/intelligence/map`, `/cho/intelligence/map`) and confirmed render + role-mode behavior
- Open issues captured during validation: MapLibre style/projection runtime console error, nested button markup in GIS layer controls (`TooltipTrigger` wrapping `ToggleGroupItem`), existing breadcrumb nested list-item warning, and mobile drawer interaction needing follow-up validation

**GIS UI refinement pass (2026-03-29)**
- Removed the Disease Map banner card to prioritize map workspace and reduce vertical clutter.
- Reworked desktop layout to a horizontal 80/20 split (`map/snapshot`) using responsive grid behavior, while keeping mobile map-first behavior.
- Converted layer controls into a collapsible panel with a compact edge toggle so overlays do not permanently occupy map space.
- Simplified disease visualization to a pure heatmap gradient by removing the extra point-circle layer.
- Added a basemap provider toggle (`Carto` <-> `MapTiler`) in map controls with local persistence via `localStorage` key `gis-map-provider`.
- Updated map style resolution to support provider-based style selection and safe fallback behavior when `VITE_MAPTILER_API_KEY` is unavailable.
- Frontend build re-validated after refinements with `npm run build`.


