# Phase 1 Build Plan — Project LINK

## Context

Project LINK uses a **frontend-first** approach. FastAPI (TG2) is deferred to Phase 2/3. Supabase JS client + RLS handles all Phase 1 data operations directly.

**Decisions incorporated in this revision:**
- `login-03` block for the Login page (email/password only, no social buttons, CHO2 access notice)
- Change Password is a **dismissible Dialog** (not a page); `must_change_password` stays `true` on skip and reappears on every login until changed
- `sidebar-07` block for the Shell UI (collapsible to icons; `TeamSwitcher` → `AppBranding` placeholder; `NavProjects` → `NavQuickLinks` per role; `NavUser` trimmed to Account, Settings, Logout)
- Collapsible sub-items in sidebar nav for grouped routes
- Create User and Edit User are **full pages** sharing a single `UserForm` component (two-column layout)
- TG6 (PWA/Offline) deferred entirely to Phase 2 — Dexie.js has nothing to sync until BHW forms exist
- TG8 (CI/CD) deferred — set up when ready to deploy
- No FastAPI in Phase 1; all operations go through Supabase JS + Edge Functions

**Exit criteria:** A logged-in user sees their role-appropriate dashboard shell. Role guards block unauthorized routes. System Admin can create and edit users who must change their password on first login.

---

## Wave Structure

```
Wave 0:
  TG1  Supabase Foundation    ──────────────────────────────►

Wave 1 (needs TG1 live):
  TG3  Frontend Auth Core     ──────────────────────────────►

Wave 2 (needs TG3):
  TG4  Routing + Role Guards  ──────────────────────────────►

Wave 3 (needs TG4):
  TG5  Shell UI               ──────────────────────────────►

Wave 4 (needs TG5 + Edge Function from TG1):
  TG7  Admin Panel            ──────────────────────────────►

DEFERRED:
  TG2  FastAPI Backend        → Phase 2/3
  TG6  PWA + Offline Layer    → Phase 2 (with BHW forms)
  TG8  CI/CD                  → when ready to deploy
```

---

## TG1 — Supabase Foundation

**Branch:** `feature/supabase-foundation`
**Tools:** Supabase MCP

### Migrations (apply in order)

#### Migration 001 — Extensions
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### Migration 002 — city_barangays (master registry, all 75 Dasmariñas)
```sql
CREATE TABLE city_barangays (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  pcode      TEXT UNIQUE NOT NULL,
  city       TEXT NOT NULL DEFAULT 'Dasmariñas',
  geometry   GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Migration 003 — barangays (operational scope, 32 CHO2)
```sql
CREATE TABLE barangays (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_barangay_id UUID REFERENCES city_barangays(id),
  name             TEXT NOT NULL,
  pcode            TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);
```

#### Migration 004 — health_stations
```sql
CREATE TABLE health_stations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barangay_id  UUID REFERENCES barangays(id),
  name         TEXT NOT NULL,   -- auto-derived: '[barangay name] Health Station'
  address      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

#### Migration 005 — user_profiles
```sql
CREATE TABLE user_profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name            TEXT NOT NULL,
  username             TEXT UNIQUE NOT NULL,
  date_of_birth        DATE NOT NULL,
  sex                  TEXT CHECK (sex IN ('M','F')),
  mobile_number        TEXT,
  role                 TEXT NOT NULL CHECK (role IN (
                         'system_admin','city_health_officer','phis_coordinator',
                         'dso','nurse_phn','midwife_rhm','bhw')),
  health_station_id    UUID REFERENCES health_stations(id),
  purok_assignment     TEXT,
  is_active            BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ
);
```

#### Migration 006 — audit_logs (INSERT-only, RA 10173)
```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES user_profiles(id),
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

#### Migration 007 — RLS Policies

**city_barangays, barangays, health_stations:** Public read.
```sql
ALTER TABLE city_barangays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON city_barangays FOR SELECT USING (true);

ALTER TABLE barangays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON barangays FOR SELECT USING (true);

ALTER TABLE health_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON health_stations FOR SELECT USING (true);
```

**user_profiles:**
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "self_read" ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "admin_read_all" ON user_profiles FOR SELECT
  USING ((auth.jwt()->'app_metadata'->>'role') = 'system_admin');

CREATE POLICY "admin_update" ON user_profiles FOR UPDATE
  USING ((auth.jwt()->'app_metadata'->>'role') = 'system_admin');

CREATE POLICY "self_update" ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
-- INSERT restricted to service role (Edge Function only)
```

**audit_logs:** INSERT only; no SELECT/UPDATE/DELETE.
```sql
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert_only" ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

#### Migration 008 — JWT Role Claim Trigger
```sql
CREATE OR REPLACE FUNCTION sync_role_to_jwt()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data ||
    jsonb_build_object(
      'role', NEW.role,
      'health_station_id', NEW.health_station_id,
      'must_change_password', NEW.must_change_password
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_profile_change
  AFTER INSERT OR UPDATE OF role, health_station_id, must_change_password
  ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION sync_role_to_jwt();
```

### Seed Data

**Order:** city_barangays → barangays → health_stations

1. **city_barangays:** Insert all 75 features from `dasmarinas_boundaries.geojson` using `ADM4_EN` as `name`, `ADM4_PCODE` as `pcode`, `ST_GeomFromGeoJSON(geometry)` for geometry.

2. **barangays:** Insert 32 rows from `cho2_boundaries.geojson`. Join on `pcode` to get `city_barangay_id` FK. The 32 pcodes:
   ```
   PH0402106021 Emmanuel Bergado I      PH0402106022 Fatima I
   PH0402106023 Luzviminda I            PH0402106025 San Andres I
   PH0402106026 San Antonio de Padua I  PH0402106029 San Francisco I
   PH0402106032 San Lorenzo Ruiz I      PH0402106033 San Luis I
   PH0402106035 San Mateo               PH0402106037 San Nicolas I
   PH0402106038 San Roque               PH0402106039 San Simon (Barangay 7)
   PH0402106040 Santa Cristina I        PH0402106041 Santa Cruz I
   PH0402106042 Santa Fe                PH0402106044 Santa Maria (Barangay 20)
   PH0402106047 Burol I                 PH0402106048 Burol II
   PH0402106049 Burol III               PH0402106050 Emmanuel Bergado II
   PH0402106051 Fatima II               PH0402106052 Fatima III
   PH0402106054 Luzviminda II           PH0402106067 San Andres II
   PH0402106068 San Antonio de Padua II PH0402106069 San Francisco II
   PH0402106071 San Lorenzo Ruiz II     PH0402106072 San Luis II
   PH0402106075 San Nicolas II          PH0402106076 Santa Cristina II
   PH0402106077 Santa Cruz II           PH0402106081 Victoria Reyes
   ```

3. **health_stations:** 32 rows with `name = '[barangay name] Health Station'`, FK to `barangays`.

4. **Bootstrap system_admin:** Create via Supabase Dashboard (Auth > Users > Create user), then manually insert `user_profiles` row with `role = 'system_admin'`, `must_change_password = true`.

### Supabase Storage
- Create `reports` bucket (private).
- RLS: write restricted to `nurse_phn`, `phis_coordinator`, `system_admin`; read restricted per station.

### Edge Function — `create-user`

**File:** `supabase/functions/create-user/index.ts`

**Input:** `{ email, password, full_name, username, date_of_birth, sex, mobile_number, role, health_station_id?, purok_assignment? }`

**Logic:**
1. Verify caller JWT has `role = 'system_admin'`.
2. `supabase.auth.admin.createUser({ email, password, email_confirm: true })`
3. Insert `user_profiles` row with `must_change_password = true`.
4. Return `{ data: user_profile, error: null }`.

**Deployment:** `supabase functions deploy create-user --project-ref <ref>`

---

## TG3 — Frontend Auth Core

**Branch:** `feature/frontend-auth`
**Depends on:** TG1 live

### Tasks

| # | Task | File | Detail |
|---|---|---|---|
| 3.1 | Supabase client | `lib/supabase.ts` | Singleton: `createClient(env.supabaseUrl, env.supabaseAnonKey)` |
| 3.2 | `useAuth` hook | `features/auth/hooks/use-auth.ts` | Exposes: `session`, `user`, `role`, `healthStationId`, `mustChangePassword`, `loading`, `signOut()` — all sourced from JWT `app_metadata` |
| 3.3 | `AuthProvider` | `features/auth/components/auth-provider.tsx` | `onAuthStateChange` subscription; provides auth context; restores session on reload via `getSession()` |
| 3.4 | `providers.tsx` | `app/providers.tsx` | Install `@tanstack/react-query`; wrap `AuthProvider` + `QueryClientProvider` |
| 3.5 | Login page | `pages/auth/login.tsx` | Based on **login-03** block. Adaptations: remove Apple/Google buttons and sign-up link; add CHO2 access notice below the card ("This system is for authorized personnel of City Health Office II, Dasmariñas City only. Unauthorized access is prohibited."); keep Card + email + password + login button layout unchanged |
| 3.6 | Change Password dialog | `features/auth/components/change-password-dialog.tsx` | shadcn `Dialog`; shown after login when `mustChangePassword = true`; fields: new password + confirm password (min 12 chars); on success: calls `supabase.auth.updateUser({ password })` then sets `user_profiles.must_change_password = false`; "Skip for now" button dismisses dialog without changing password — `must_change_password` stays `true` and dialog reappears on next login |
| 3.7 | Wire dialog into auth flow | `features/auth/components/auth-provider.tsx` | After session is established, if `mustChangePassword = true`, render `<ChangePasswordDialog open />` over the current view |

---

## TG4 — Routing + Role Guards

**Branch:** `feature/routing-guards`
**Depends on:** TG3

### Tasks

| # | Task | File | Detail |
|---|---|---|---|
| 4.1 | Route tree | `app/router.tsx` | TanStack Router `createRouter`. Routes: `/login`, `/bhw/*`, `/midwife/*`, `/phn/*`, `/phis/*`, `/dso/*`, `/cho/*`, `/admin/*` |
| 4.2 | Auth guard | `app/router.tsx` | `beforeLoad`: no session → redirect to `/login` |
| 4.3 | Change-password guard | `app/router.tsx` | Handled by `AuthProvider` rendering the dialog overlay — no route redirect needed |
| 4.4 | Role guard | `app/router.tsx` | `beforeLoad` per route prefix: if `role` doesn't match → redirect to own dashboard root |
| 4.5 | Wire `App.tsx` | `App.tsx` | Replace stub with `<RouterProvider router={router} />` |

**Role → Route mapping:**

| Role | Root route |
|---|---|
| `bhw` | `/bhw/dashboard` |
| `midwife_rhm` | `/midwife/dashboard` |
| `nurse_phn` | `/phn/dashboard` |
| `phis_coordinator` | `/phis/dashboard` |
| `dso` | `/dso/dashboard` |
| `city_health_officer` | `/cho/dashboard` |
| `system_admin` | `/admin/dashboard` |

---

## TG5 — Shell UI

**Branch:** `feature/shell-ui`
**Depends on:** TG4

### sidebar-07 Adaptations

| sidebar-07 original | Project LINK replacement |
|---|---|
| `TeamSwitcher` | `AppBranding` — LINK logo placeholder + "CHO II Dasmariñas" subtitle |
| `NavMain` | `NavMain` — role-specific collapsible nav links (see config below) |
| `NavProjects` | `NavQuickLinks` — role-specific quick access links (see config below) |
| `NavUser` | `NavUser` — trimmed to: Account, Settings, Log out |
| `SidebarRail` | Kept — handles collapse to icon mode |
| `SidebarInset` header | Breadcrumb + `SidebarTrigger` (default pattern, no changes) |

### Tasks

| # | Task | File | Detail |
|---|---|---|---|
| 5.1 | `AppBranding` | `components/layout/app-branding.tsx` | Replaces `TeamSwitcher`; LINK logo placeholder + "CHO II" text; no dropdown |
| 5.2 | `NavMain` | `components/layout/nav-main.tsx` | Collapsible nav from sidebar-07 `nav-main.tsx`; driven by `NAV_CONFIG[role]` |
| 5.3 | `NavQuickLinks` | `components/layout/nav-quick-links.tsx` | Replaces `NavProjects`; driven by `QUICK_LINKS_CONFIG[role]`; hidden when sidebar is collapsed to icons |
| 5.4 | `NavUser` | `components/layout/nav-user.tsx` | From sidebar-07 `nav-user.tsx`; dropdown items: Account, Settings, Log out only |
| 5.5 | `AppSidebar` | `components/layout/app-sidebar.tsx` | Composes: `AppBranding` + `NavMain` + `NavQuickLinks` + `NavUser` + `SidebarRail` |
| 5.6 | `AppShell` | `components/layout/app-shell.tsx` | `SidebarProvider` > `AppSidebar` + `SidebarInset` (with default breadcrumb header + `<Outlet />`) |
| 5.7 | Dashboard shells | `pages/*/dashboard.tsx` | 7 files; each: page title + empty stat card placeholders (no real data); list below |

**Dashboard shell files:**
- `pages/bhw/dashboard.tsx`
- `pages/midwife/dashboard.tsx`
- `pages/phn/dashboard.tsx`
- `pages/phis/dashboard.tsx`
- `pages/dso/dashboard.tsx`
- `pages/cho/dashboard.tsx`
- `pages/admin/dashboard.tsx`

### Nav Config per Role

Sourced from `docs/userflows.md` navigation structure. All sub-items are route stubs (placeholder pages) except the dashboard.

**BHW**
- NavMain:
  - Dashboard
  - Patients ▸ Search / Register, Patient ITR
  - New Visit ▸ Maternal Care, Immunization, NCD Check-in, TB-DOTS, Nutrition
  - Settings
- NavQuickLinks: Offline Queue, Sync Status

**Midwife**
- NavMain:
  - Dashboard
  - Validation Queue
  - Patients
  - TCL Registries ▸ Maternal Care, EPI Registry, TB Register, NCD List, Nutrition Masterlist
  - TB Cases
  - PIDSR
  - Reports ▸ Generate ST
  - Inventory
- NavQuickLinks: Maternal Care TCL, EPI Registry

**PHN**
- NavMain:
  - Dashboard
  - MCT Dashboard
  - Patients
  - Reports ▸ ST Review, Generate MCT
  - Intelligence ▸ Disease Map, Forecasting
- NavQuickLinks: Disease Map, Forecasting

**DSO**
- NavMain:
  - Dashboard
  - Disease Alerts
  - PIDSR Log
  - CIF Workflow
  - Compliance Metrics
  - Intelligence ▸ Disease Map
- NavQuickLinks: Active Alerts, Compliance Rate

**PHIS Coordinator**
- NavMain:
  - Dashboard
  - MCT Queue
  - DQC Workflow
  - Report Exports
  - Export History
- NavQuickLinks: M1 Reports, M2 Reports

**City Health Officer**
- NavMain:
  - Dashboard
  - Reports Awaiting Sign-Off
  - Signed Reports / Archive
  - Intelligence ▸ Disease Map, Forecasting
- NavQuickLinks: Disease Map, Forecasting

**System Admin**
- NavMain:
  - Dashboard
  - Users ▸ User List, Create User
  - BHS Registry
  - Audit Logs
- NavQuickLinks: Create User, BHS Registry

---

## TG7 — Admin Panel

**Branch:** `feature/admin-panel`
**Depends on:** TG5 + `create-user` Edge Function deployed

### Pages

| Route | File | Purpose |
|---|---|---|
| `/admin/users` | `pages/admin/users/index.tsx` | User list |
| `/admin/users/new` | `pages/admin/users/new.tsx` | Create user (renders `UserForm`) |
| `/admin/users/:id/edit` | `pages/admin/users/$id.edit.tsx` | Edit user (renders `UserForm`, prefills data) |

### Shared `UserForm` Component

**File:** `pages/admin/users/components/user-form.tsx`

**Layout:** Two-column
- Left column: form fields
- Right column: role summary card (shows what the selected role can access, derived from `docs/userflows.md` role descriptions; read-only, updates on role select change)

**Fields:**

| Field | Type | Rules |
|---|---|---|
| Full Name | Text | Required; format hint "Last, First, Middle" |
| Email | Email | Required; valid format |
| Username | Text | Required; unique slug hint (e.g. `s.redona_kld`) |
| Date of Birth | Date | Required |
| Sex | Select (M/F) | Required |
| Mobile Number | Text | Optional; regex `/^\+639\d{9}$/` |
| Role | Select (7 roles) | Required; drives BHS/Purok visibility |
| BHS Assignment | Select (32 stations) | Required when role is `bhw` or `midwife_rhm`; hidden otherwise |
| Purok Assignment | Text | Visible when role is `bhw` only |
| Initial Password | Password (show/hide toggle) | Required on create only; min 12 chars; not shown on edit |

**Behavior:**
- Create (`/new`): all fields enabled; submit calls `create-user` Edge Function via `supabase.functions.invoke`
- Edit (`/:id/edit`): all fields except email and password enabled; submit calls `supabase.from('user_profiles').update()`; role/BHS change triggers `sync_role_to_jwt` via DB trigger automatically

### Tasks

| # | Task | File | Detail |
|---|---|---|---|
| 7.1 | User list | `pages/admin/users/index.tsx` | shadcn `Table`; columns: full name, username, role badge, BHS, status badge (Active/Inactive), Edit action; search bar + role filter + BHS filter via Supabase JS `.eq()` / `.ilike()`; "Create User" button → navigates to `/admin/users/new` |
| 7.2 | `UserForm` | `pages/admin/users/components/user-form.tsx` | Two-column shared form; see spec above |
| 7.3 | Create User page | `pages/admin/users/new.tsx` | Page wrapper: back button to user list, `<UserForm mode="create" />` |
| 7.4 | Edit User page | `pages/admin/users/$id.edit.tsx` | Page wrapper: back button, `<UserForm mode="edit" userId={id} />`; prefills from `user_profiles` |
| 7.5 | Deactivate/reactivate | In user list (7.1) | shadcn `AlertDialog` confirmation; `supabase.from('user_profiles').update({ is_active: !current })`; deactivate and edit actions visually separated |

---

## Files to Create

### Supabase
- `supabase/migrations/001_extensions.sql`
- `supabase/migrations/002_city_barangays.sql`
- `supabase/migrations/003_barangays.sql`
- `supabase/migrations/004_health_stations.sql`
- `supabase/migrations/005_user_profiles.sql`
- `supabase/migrations/006_audit_logs.sql`
- `supabase/migrations/007_rls_policies.sql`
- `supabase/migrations/008_jwt_role_claim.sql`
- `supabase/seed/seed.sql`
- `supabase/functions/create-user/index.ts`

### Frontend — Auth
- `frontend/src/features/auth/hooks/use-auth.ts`
- `frontend/src/features/auth/components/auth-provider.tsx`
- `frontend/src/features/auth/components/change-password-dialog.tsx`

### Frontend — Layout (sidebar-07 based)
- `frontend/src/components/layout/app-branding.tsx`
- `frontend/src/components/layout/nav-main.tsx`
- `frontend/src/components/layout/nav-quick-links.tsx`
- `frontend/src/components/layout/nav-user.tsx`
- `frontend/src/components/layout/app-sidebar.tsx`
- `frontend/src/components/layout/app-shell.tsx`

### Frontend — Dashboard shells
- `frontend/src/pages/cho/dashboard.tsx`
- `frontend/src/pages/admin/dashboard.tsx`

### Frontend — Admin panel
- `frontend/src/pages/admin/users/index.tsx`
- `frontend/src/pages/admin/users/new.tsx`
- `frontend/src/pages/admin/users/$id.edit.tsx`
- `frontend/src/pages/admin/users/components/user-form.tsx`

## Files to Modify

- `frontend/src/lib/supabase.ts` (currently stub)
- `frontend/src/app/router.tsx` (currently stub)
- `frontend/src/app/providers.tsx` (currently stub)
- `frontend/src/App.tsx` (wire RouterProvider)
- `frontend/src/pages/auth/login.tsx` (apply login-03 pattern)
- `frontend/src/pages/bhw/dashboard.tsx`
- `frontend/src/pages/midwife/dashboard.tsx`
- `frontend/src/pages/phn/dashboard.tsx`
- `frontend/src/pages/phis/dashboard.tsx`
- `frontend/src/pages/dso/dashboard.tsx`
- `docs/project_status.md`

---

## Phase 1 Exit Criteria

### Supabase Foundation
- [ ] `city_barangays` seeded with 75 Dasmariñas barangays + geometries
- [ ] `barangays` seeded with 32 CHO2 barangays linked to master registry
- [ ] `health_stations` seeded with 32 BHS auto-named from barangays
- [ ] RLS policies enforce role scoping at DB layer
- [ ] JWT role claim trigger fires on `user_profiles` insert/update
- [ ] `create-user` Edge Function deployed and callable by system_admin only

### Auth
- [ ] Unauthenticated visit → `/login`
- [ ] Login page uses login-03 layout with CHO2 access notice and no social buttons
- [ ] Login → redirects to role dashboard
- [ ] Wrong-role route → redirects to own dashboard root
- [ ] `must_change_password = true` → change password dialog appears over dashboard
- [ ] Skipping dialog keeps `must_change_password = true`; dialog reappears on next login
- [ ] After password change → `must_change_password = false` → dialog gone

### Shell UI
- [ ] All 7 role dashboard shells render with correct sidebar nav and user info
- [ ] sidebar-07 collapses to icons on desktop
- [ ] sidebar-07 opens as sheet on mobile
- [ ] NavMain collapsible sub-items expand/collapse correctly
- [ ] NavQuickLinks hidden when sidebar is collapsed to icons
- [ ] NavUser dropdown shows Account, Settings, Log out only
- [ ] Logout clears session and redirects to `/login`

### Admin Panel
- [ ] User list loads with search and role/BHS filter
- [ ] Create User page (`/admin/users/new`) renders two-column form
- [ ] Create user → calls Edge Function → user appears in list → must change password on first login
- [ ] Edit User page (`/admin/users/:id/edit`) prefills existing data
- [ ] Role change on edit → JWT claim updated via DB trigger
- [ ] Deactivate/reactivate with confirmation dialog; deactivated user cannot log in
- [ ] Deactivate and Edit actions are visually separated in the user list
