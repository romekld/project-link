# Project Status

## Milestones

- M1: Routing and role contract scaffolding for `apps/web`
- M2: Shared shell composition and dynamic sidebar data layer
- M3: System admin user management pages and Supabase auth wiring
- M4: Role-aware navigation rollout for CHO, PHIS, RHM, PHN, BHW

## Accomplished

- M1 complete:
  - App Router scaffold and route groups (`(auth)`, `(internal)`) in place.
  - Canonical route and role contracts defined in `apps/web/lib/routing.ts`.

- M2 complete:
  - `(internal)/layout.tsx` is a Server Component owning `SidebarProvider` + `AppSidebar`. No `"use client"` at layout root.
  - Dynamic shell data layer built: `lib/shell/types.ts`, `lib/shell/role-nav-config.ts`, `lib/shell/get-shell-data.ts`, `lib/shell/mock-role.ts`.
  - `AppSidebar` is fully dynamic — zero inline config, consumes `ShellData` prop, maps `iconKey` → Lucide via local `ICON_MAP`.
  - `SidebarBrand` replaces `TeamSwitcher` permanently. Static LINK / City Health Office II wordmark.
  - `NavMain` fixed: leaf nav items (no children) render as plain links, not collapsible triggers.
  - `/admin/dashboard` and `/admin/users` placeholder pages created inside shared shell.
  - `/dashboard` converted to redirect bridge → `/admin/dashboard`.
  - `proxy.ts` stub created (Next.js 16) with matcher and inline auth wiring instructions.
  - Shell data contracts (`UserSummary`) aligned to `supabase.auth.getUser()` shape — zero adapter needed at wiring time.

## Next

- **Frontend migration governance**:
  - Use `docs/PLANS/shadcn-admin-to-web-migration-checklist.md` as the canonical reference when adapting `apps/shadcn-admin` patterns into `apps/web`.

- **M3 — User management pages (system_admin)**:
  - `/admin/users` list: role, BHS assignment, status, last active columns.
  - `/admin/users/create` invite flow: `supabase.auth.admin.inviteUserByEmail()` via Server Action (service role only).
  - `/admin/users/[id]/edit`: role + BHS assignment editing.
  - Requires: `profiles` table migration, Zod schemas, React Hook Form + server action pattern.

- **M3 — Supabase auth wiring**:
  - Replace `mock-role.ts` with real session read in `proxy.ts` and layout.
  - Add RBAC redirect enforcement in `proxy.ts` for `/admin/*`.
  - Delete `mock-role.ts`.
