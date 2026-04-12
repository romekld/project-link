# Project LINK — Architecture

> Present-tense description of the system as it exists today.
> Last updated: 2026-04-12

---

## Overview

Project LINK is a monorepo health-station management platform for CHO II Dasmariñas. The production stack is:

- **`apps/web`** — Next.js 16 App Router (internal dashboard + BHW PWA)
- **`apps/api`** — FastAPI scaffold (health-domain logic, deferred to later phases)
- **`packages/supabase`** — Supabase CLI config and migrations
- **Supabase cloud** (`wxtyrjpicjqjgwxrwdmp`) — Postgres, Auth, RLS, Storage

---

## Layers

### 1. Database (Supabase Postgres)

| Table | Purpose |
|---|---|
| `auth.users` | Managed by Supabase Auth. Source of truth for credentials and identity. |
| `public.profiles` | 1-to-1 with `auth.users`. Stores role, status, assignment, and display fields. |
| `public.health_stations` | Stub table. Holds the 5 active BHS stations. Used for station-scoped role assignment. |

**Enums:** `user_role` (`bhw`, `rhm`, `phn`, `phis`, `cho`, `system_admin`), `user_status` (`active`, `inactive`, `invited`, `suspended`).

**RLS:** Enabled on both `profiles` and `health_stations`.
- `system_admin` — full access to all profiles.
- `cho` — read access to all profiles.
- Any authenticated user — read their own profile row.
- Enforced via `get_my_role()` (SECURITY DEFINER function) to avoid RLS recursion.

---

### 2. Supabase Clients (`apps/web/lib/supabase/`)

| File | Client | When Used |
|---|---|---|
| `client.ts` | `createBrowserClient` | Client Components (React hooks, event handlers) |
| `server.ts` | `createServerClient` with cookie store | Server Components, Server Actions, middleware |
| `admin.ts` | `createClient` with service role key | Server Actions that bypass RLS (user creation, bulk ops) |

The server client reads/writes the auth session via `cookies()` from `next/headers`.

---

### 3. Middleware (`apps/web/middleware.ts`)

Runs on every request. Responsibilities:

1. **Session refresh** — calls `supabase.auth.getUser()` to keep the session cookie fresh.
2. **Public paths** (`/login`, `/forgot-password`) — redirects already-authenticated users to their role home.
3. **Protected paths** — any path not on the public list requires a valid session; unauthenticated requests redirect to `/login`.
4. **must_change_password gate** — if `profiles.must_change_password` is `true`, any path other than `/change-password` redirects to `/change-password`.
5. **Role prefix restriction** — enforces that `/admin/*` routes are accessible only to `system_admin`.

Role home map:

| Role | Home route |
|---|---|
| `system_admin` | `/admin/users` |
| `cho` | `/dashboard` |
| `phis` | `/dashboard` |
| `phn` | `/dashboard` |
| `rhm` | `/dashboard` |
| `bhw` | `/bhw` |

---

### 4. Auth Flows

#### Login (`/login`)
- `LoginForm` (Client Component) uses `useActionState(loginAction, null)`.
- `loginAction` (Server Action): calls `supabase.auth.signInWithPassword`, fetches `profiles.role` + `profiles.must_change_password`, redirects to `/change-password` or role home.
- Errors are returned as `{ error: string }` state; no exceptions cross the client boundary.

#### Forced Password Change (`/change-password`)
- Triggered by middleware when `must_change_password = true`.
- `changePasswordAction` (Server Action): validates new password, calls `supabase.auth.updateUser`, sets `must_change_password = false` on the profile row, redirects to role home.

---

### 5. Admin Users Management (`/admin/users`)

**Data flow:**

```
Page (Server Component)
  └─ getUsers()         ← Supabase query, returns AdminUser[]
  └─ AdminUsersPage     ← Client Component (receives initialUsers prop)
       ├─ DataTable / MobileCards (display)
       ├─ onToggleStatus  → setUserStatusAction  (Server Action)
       └─ onResetPassword → resetPasswordsAction (Server Action)
```

**Server Actions (`features/admin/users/actions.ts`):**

| Action | What it does |
|---|---|
| `createUserAction` | `admin.auth.admin.createUser` → `profiles` insert. Rolls back auth user on profile error. |
| `updateUserAction` | Updates profile fields. Resolves health station slug → UUID via `health_stations.slug`. |
| `setUserStatusAction` | Bulk-updates `profiles.status`. |
| `resetPasswordsAction` | Bulk-sets `profiles.must_change_password = true`. |

**Queries (`features/admin/users/queries.ts`):**

- `getUsers()` — fetches all profiles joined with health_stations, maps to `AdminUser[]`.
- `getUser(id)` — fetches a single profile.
- `getNextUserSeed()` — counts profiles to generate the next `USR-YYYY-####` ID.
- `getHealthStations()` — fetches active stations for the form select.

---

### 6. Rendering Pattern

The codebase uses the Next.js 16 **async Server Component → Client Component props** pattern throughout:

- **Pages** are `async` Server Components. They call query functions and pass data as props.
- **Feature components** (e.g. `AdminUsersPage`, `AddUserPage`) are Client Components tagged `"use client"` that receive pre-fetched data.
- **Server Actions** handle all mutations. Client Components call them via `useTransition` or `useActionState`.
- No client-side data fetching (no `useEffect` + fetch, no SWR/React Query) in the current implementation.

---

## Key Decisions

| Decision | Rationale |
|---|---|
| Service role admin client for user creation | Supabase Auth Admin API is not accessible from the browser; service role bypasses RLS correctly for admin write paths. |
| `email` column on `profiles` | `auth.users.email` is not directly joinable in the public schema without elevated access; duplicating it in `profiles` allows RLS-safe reads. |
| `get_my_role()` SECURITY DEFINER | Prevents infinite RLS recursion when policies themselves need to read `profiles.role`. |
| `must_change_password` enforced in middleware | Covers all routes without requiring per-page logic; ensures no page is reachable on a stale password. |
| Health station slug→UUID resolution in Server Actions | The form schema uses human-readable slugs; the DB stores UUIDs. Resolution happens server-side so slugs never leak into DB writes. |

---

## Migrations (Applied to Remote)

| File | Description |
|---|---|
| `20260412000001_create_enums.sql` | `user_role` and `user_status` ENUM types |
| `20260412000002_create_health_stations_stub.sql` | `health_stations` table + 5 seeded BHS rows |
| `20260412000003_create_profiles.sql` | `profiles` table, FK to `auth.users`, `set_updated_at` trigger |
| `20260412000004_create_rls.sql` | RLS on profiles and health_stations, `get_my_role()` function, 3 profile policies |
| `20260412000005_add_email_to_profiles.sql` | `email TEXT UNIQUE NOT NULL` column on profiles |

---

## What Is Not Yet Built

- FastAPI (`apps/api`) — scaffold only, no domain logic wired.
- Health data modules (ITR, TCL, ST, MCT) — deferred to Phase 3+.
- GIS / ML surfaces — deferred.
- PWA service worker / offline sync — scaffolded direction only.
- Non-admin role dashboards (`/dashboard`, `/bhw`) — shells only.
