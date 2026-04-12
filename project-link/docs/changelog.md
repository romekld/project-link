# Changelog

All notable changes to Project LINK are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
- `AdminUser` schema: replaced `passwordState: UserPasswordState` with `mustChangePassword: boolean`; added `healthStationId: string | null`.
- `UserRole` enum updated to new slugs: `bhw`, `rhm`, `phn`, `phis`, `cho`, `system_admin`.
- `AdminUsersPage` accepts `initialUsers: AdminUser[]` prop instead of generating mock data internally.
- `users-mobile-cards.tsx`: updated `passwordState` reference → `mustChangePassword`.
- `users.ts` mock data: updated role slugs, replaced `passwordState` with `mustChangePassword`, added `healthStationId: null`.
- `buildDefaultFormValues`: `healthStationId` now reads from `user.healthStationId`; `mustChangePassword` reads from `user.mustChangePassword`.
- `supabase/config.toml` `project_id` corrected to remote project ref.
- `.gitignore`: added `.mcp.json` to prevent accidental credential commits.
- `pnpm-lock.yaml`: added `@supabase/ssr` and `@supabase/supabase-js` lockfile entries.

### Fixed
- Mock data generation no longer used on live pages; all data originates from the Supabase DB.

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
