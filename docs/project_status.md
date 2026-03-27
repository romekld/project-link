# Project Status

**Last updated:** 2026-03-27
**Current phase:** Phase 1 — Infrastructure & Foundation (COMPLETE)

---

## Milestones

| Phase | Title | Status |
| :--- | :--- | :--- |
| **Phase 1** | Infrastructure & Foundation | **Complete** |
| **Phase 2** | EHR / ITR & TCL Entry | Not started |
| **Phase 3** | FHSIS Reporting Pipeline (ST → MCT → M1/M2) | Not started |
| **Phase 4** | Spatial Intelligence & Predictive Analytics | Not started |

---

## Phase 1 — What Was Accomplished

### TG1 — Supabase Foundation
- [x] Supabase project live at `https://kloypsasgyrqcyqdpddj.supabase.co`
- [x] PostGIS + uuid-ossp extensions enabled (`001_extensions.sql`)
- [x] Schema migrations applied: `city_barangays`, `barangays`, `health_stations`, `user_profiles`, `audit_logs` (migrations 002–006)
- [x] RLS policies applied for all tables (`007_rls_policies.sql`)
  - `city_barangays`, `barangays`, `health_stations` — public read
  - `user_profiles` — self-read, admin-read-all, self-update, admin-update; INSERT restricted to service role
  - `audit_logs` — INSERT-only (RA 10173 compliance)
- [x] JWT role claim trigger (`sync_role_to_jwt`) fires on `user_profiles` insert/update (`008_jwt_role_claim.sql`)
- [x] Seed data applied: 75 `city_barangays` (all Dasmariñas), 32 `barangays` (CHO2 scope), 32 `health_stations`
- [x] `reports` Storage bucket created with write-restricted RLS
- [x] `create-user` Edge Function deployed; enforces `system_admin` JWT check before creating auth users

### TG3 — Frontend Auth Core
- [x] `lib/supabase.ts` — Supabase JS singleton client wired to live project
- [x] `features/auth/components/auth-provider.tsx` — `onAuthStateChange` + session restore; `ChangePasswordDialog` overlay
- [x] `features/auth/hooks/use-auth.ts` — `useAuth()` exposes session, role, healthStationId, mustChangePassword, signOut
- [x] `app/providers.tsx` — `QueryClientProvider` + `AuthProvider` composition
- [x] Login page (`pages/auth/login.tsx`) — login-03 block; email + password; CHO2 access notice; no social buttons; redirects to role dashboard on success
- [x] `ChangePasswordDialog` — shadcn Dialog; skip (dismissed for session, reappears on next login) or set password (clears `must_change_password`); cannot be dismissed by Escape/outside click

### TG4 — Routing + Role Guards
- [x] TanStack Router configured in `app/router.tsx`
- [x] Routes: `/login`, `/bhw/*`, `/midwife/*`, `/phn/*`, `/phis/*`, `/dso/*`, `/cho/*`, `/admin/*`
- [x] Auth guard: no session → redirect `/login`
- [x] Role guard: wrong-role route → redirect to own dashboard root
- [x] `App.tsx` wired to `<RouterProvider>`
- [x] `frontend/.env` created with live Supabase URL + anon key

### TG5 — Shell UI (sidebar-07 pattern)
- [x] `AppBranding` — LINK logo placeholder + "CHO II Dasmariñas" subtitle
- [x] `NavMain` — collapsible nav driven by `NAV_CONFIG[role]`; all 7 roles configured
- [x] `NavQuickLinks` — quick access links driven by `QUICK_LINKS_CONFIG[role]`; hidden when sidebar collapsed to icons
- [x] `NavUser` — dropdown with Account, Settings, Log out; logout clears session and redirects
- [x] `AppSidebar` — composes branding + nav + quick links + user footer + rail
- [x] `AppShell` — `SidebarProvider` > `AppSidebar` + `SidebarInset` wrapping `<Outlet />`
- [x] 7 dashboard shell pages (bhw, midwife, phn, phis, dso, cho, admin)
- [x] `#root` CSS scaffold artifacts removed; layout fills viewport

### TG7 — Admin Panel
- [x] User list (`/admin/users`) — search by name, role filter, BHS filter; status badges; Edit + Deactivate/Activate actions with visual separation
- [x] Deactivate/Activate confirmation via `AlertDialog`
- [x] `UserForm` — two-column: form fields (left) + role summary card (right, updates on role change)
  - All fields per spec: full name, email (create), username, DOB, sex, mobile, role, BHS (conditional), purok (conditional), password (create)
  - BHS Assignment shown for `bhw`/`midwife_rhm`; Purok only for `bhw`
  - Mobile number validated as `+639XXXXXXXXX`
  - Password toggle (show/hide); minimum 12 chars on create
- [x] Create User page (`/admin/users/new`) — calls `create-user` Edge Function
- [x] Edit User page (`/admin/users/:id/edit`) — prefills from `user_profiles`; role/BHS change propagates via `sync_role_to_jwt` trigger

---

## Phase 1 Exit Criteria Verification

### Supabase Foundation
- [x] `city_barangays` seeded with 75 Dasmariñas barangays
- [x] `barangays` seeded with 32 CHO2 barangays linked to master registry
- [x] `health_stations` seeded with 32 BHS auto-named from barangays
- [x] RLS policies enforce role scoping at DB layer
- [x] JWT role claim trigger fires on `user_profiles` insert/update
- [x] `create-user` Edge Function deployed and callable by system_admin only

### Auth
- [x] Unauthenticated visit → `/login`
- [x] Login page uses login-03 layout with CHO2 access notice and no social buttons
- [x] Login → redirects to role dashboard
- [x] Wrong-role route → redirects to own dashboard root
- [x] `must_change_password = true` → change password dialog appears over dashboard
- [x] Skipping dialog keeps `must_change_password = true`; dialog reappears on next login
- [x] After password change → `must_change_password = false` → dialog gone

### Shell UI
- [x] All 7 role dashboard shells render with correct sidebar nav
- [x] sidebar-07 collapses to icons on desktop
- [x] sidebar-07 opens as sheet on mobile
- [x] NavMain collapsible sub-items expand/collapse
- [x] NavQuickLinks hidden when sidebar collapsed to icons
- [x] NavUser dropdown shows Account, Settings, Log out only
- [x] Logout clears session and redirects to `/login`

### Admin Panel
- [x] User list loads with search and role/BHS filter
- [x] Create User page renders two-column form
- [x] Create user → calls Edge Function → `must_change_password = true`
- [x] Edit User page prefills existing data
- [x] Role change on edit → JWT claim updated via DB trigger
- [x] Deactivate/reactivate with confirmation dialog; actions visually separated

---

## What Is Next (Phase 2 — EHR / ITR & TCL Entry)

Phase 2 goal: BHWs capture visits offline; Midwives validate and manage TCL records.

### Key deliverables
- Unified patient registry (search, register, ITR)
- 5 BHW entry forms (maternal, immunization, NCD, TB-DOTS, nutrition)
- Dexie.js IndexedDB store + Workbox PWA background sync
- Midwife validation queue
- TCL registry views (maternal, EPI, TB, NCD, nutrition)
- Automated clinical computations (AOG, EDC, risk flags)
- High-risk auto-flagging for BP > 140/90, severe wasting, Category I disease

### FastAPI Backend (deferred from Phase 1)
- `backend/app/` package structure
- JWT verification, DB session, health-check endpoint
- Docker Compose services for FastAPI + Celery + Redis
