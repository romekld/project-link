# System Admin Dynamic Sidebar Plan

## Objective

Implement the shared internal dashboard shell for the system admin slice while eliminating all hardcoded sidebar configuration from the UI layer. The shell data layer must be designed so that Supabase session wiring, RBAC enforcement, and future role expansion are drop-in replacements — not refactors.

This phase is admin-first. It is frontend-only in execution but must be future-ready in contract.

---

## Scope

### In scope

- `apps/web/middleware.ts` — route protection stub with correct matcher
- `apps/web/app/(internal)/layout.tsx` — Server Component shell with client island for interactive chrome
- `apps/web/components/sidebar-brand.tsx` — static LINK branding header
- `apps/web/components/app-sidebar.tsx` — dynamic sidebar consuming resolved shell data
- `apps/web/lib/shell/types.ts` — canonical shell data contracts
- `apps/web/lib/shell/role-nav-config.ts` — nav config keyed by role (permanent, not throwaway)
- `apps/web/lib/shell/get-shell-data.ts` — resolver with Supabase-ready signature
- `apps/web/lib/shell/mock-role.ts` — throwaway mock role source only
- `apps/web/lib/routing.ts` — route registry cleanup
- Admin route surface: `/admin/dashboard`, `/admin/users`
- Redirect bridge: `/dashboard` → `/admin/dashboard`

### Out of scope

- Database changes or Supabase schema work
- Real Supabase Auth session reading
- Final RBAC enforcement (RLS policies, middleware session checks)
- User management pages implementation (next phase — see Future Phases)
- Non-admin role nav rollout

---

## Locked Decisions

1. Canonical system admin dashboard path is `/admin/dashboard`.
2. `/admin/*` is reserved for system-admin-exclusive surfaces.
3. `/dashboard` is a temporary redirect bridge only — removable after migration.
4. `apps/web/lib/routing.ts` is the only route authority. No route strings elsewhere.
5. `app-sidebar` must not contain any inline config objects.
6. Shell data must be pure typed data only — no rendered JSX, no functions, no React nodes inside config.
7. `TeamSwitcher` is permanently removed. The sidebar header is a static `SidebarBrand` component: **LINK** / City Health Office II. This is a single-org system — CHO II Dasmariñas City.
8. `(internal)/layout.tsx` must be a **Server Component**. No `"use client"` at the layout root.
9. `SidebarProvider` and `AppSidebar` live in the layout, not inside individual pages.
10. The shell resolver signature is `getShellData(role, user?)` from day one — even with mock data — so Supabase wiring is a drop-in swap with zero call-site changes.
11. `role-nav-config.ts` is the canonical nav definition per role, not mock data. Only `mock-role.ts` is throwaway.

---

## Non-Negotiable Rules

- Do not use `"use client"` in `apps/web/app/(internal)/layout.tsx`.
- Do not place `SidebarProvider` or `AppSidebar` inside any page component under `(internal)`.
- Do not keep inline config objects in `apps/web/components/app-sidebar.tsx` for user display, nav groups, or quick links.
- Do not include a `teams` field or any org/context-switching concept in shell data types. This is a single-org system.
- Do not re-introduce `TeamSwitcher` or any dropdown-based switcher in the sidebar header.
- Do not create a second routing authority inside shell config files.
- Do not treat `/dashboard` as a permanent product route for system admin.
- Do not skip `middleware.ts` — even a pass-through stub with the correct matcher is required before Supabase wiring.
- Do not name the nav config file with "mock" in the filename. Only `mock-role.ts` is throwaway.

---

## Architecture

### 1) Route Protection Stub (`middleware.ts`)

Create `apps/web/middleware.ts` as a pass-through stub that:

- Defines the `matcher` covering all `/(internal)` routes and `/admin/*`
- Passes all requests through for now
- Is structured so the real Supabase session check (`supabase/ssr` cookie read + `getUser()`) is a single function swap

```text
apps/web/middleware.ts
```

This file must exist before Supabase wiring so that adding real auth is an edit, not a new file with unknown call sites.

### 2) Shared Internal Shell as Server Component

Rewrite `apps/web/app/(internal)/layout.tsx` to:

- Be a **Server Component** (no `"use client"` directive)
- Own `SidebarProvider` and `AppSidebar` at the layout level — one mount for all routes under `(internal)`
- Pass resolved shell data down from the layout (mock resolver for now, Supabase resolver later)
- Extract any pathname-based or interactive logic into a `<ShellClientBridge>` client component child

The current layout uses `usePathname` and is forced `"use client"`. This blocks server-side data fetching at the layout level and must be corrected now.

**Files:**

- `apps/web/app/(internal)/layout.tsx` — Server Component root
- `apps/web/components/shell-client-bridge.tsx` — client island for any interactive chrome state

### 3) Admin Route Surface

```text
apps/web/app/(internal)/admin/dashboard/page.tsx   ← system admin home
apps/web/app/(internal)/admin/users/page.tsx        ← users list placeholder
apps/web/app/(internal)/dashboard/page.tsx          ← redirect bridge only → /admin/dashboard
```

The `/dashboard` page must use `redirect()` from `next/navigation` — not a CTA or content page.

### 4) Route Registry Cleanup

`apps/web/lib/routing.ts` already has `adminDashboard`, `adminUsers`, `adminUsersCreate`, and `adminUsersEdit`. Clean up so it:

- Preserves only constants that are referenced by the current implementation
- Removes unused route-metadata scaffolding not yet in use
- Remains the only file any shell config or component imports route strings from

### 5) Shell Data Layer

#### `apps/web/lib/shell/types.ts`

Canonical contracts for all shell data. Key design constraints:

- `UserSummary` must mirror the shape returned by `supabase.auth.getUser()` so Supabase wiring requires no adapter
- `NavItem` includes `pageTitle` for layout-driven breadcrumbs — no per-page breadcrumb hardcoding
- No `teams` field anywhere in `ShellData`
- All fields are serializable (no JSX, no functions)

```ts
// Approximate shape — enforce strictly in implementation

export type RoleCode = "system_admin" | "cho" | "phis" | "rhm" | "phn" | "bhw"

export type UserSummary = {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  role: RoleCode
}

export type NavItem = {
  label: string
  href: string
  iconKey: string
  pageTitle?: string          // used by layout breadcrumb renderer
  match?: string              // optional active-match override
  children?: NavItem[]
  badge?: { label: string; variant?: string }
}

export type NavGroup = {
  groupLabel?: string
  items: NavItem[]
}

export type ShellData = {
  user: UserSummary
  navGroups: NavGroup[]
  quickLinks?: NavItem[]
}
```

#### `apps/web/lib/shell/role-nav-config.ts`

Permanent, canonical nav definition keyed by role. This is not mock data — it is the real navigation contract. Routes are imported from `lib/routing.ts`. Icons are referenced by `iconKey` string only.

#### `apps/web/lib/shell/get-shell-data.ts`

Resolver with Supabase-ready signature from day one:

```ts
export function getShellData(role: RoleCode, user?: UserSummary): ShellData
```

During this phase `user` is optional and a mock `UserSummary` is substituted. When Supabase is wired, the caller passes the real session user — no changes to this function's signature or any call sites.

#### `apps/web/lib/shell/mock-role.ts`

Throwaway file. Returns a hardcoded `RoleCode` for this phase only. Deleted when Supabase session reading is live.

### 6) Static Sidebar Branding Header

New component replacing `TeamSwitcher`:

**`apps/web/components/sidebar-brand.tsx`**

- Accepts no props
- Renders fixed wordmark: **LINK** / City Health Office II
- Uses `Heart` icon (lucide) as logo mark in a rounded tile
- Respects collapsed sidebar state via `useSidebar()` — hides text when `collapsible="icon"` is active
- `TeamSwitcher` component file is deleted

### 7) Sidebar Composition

Refactor `apps/web/components/app-sidebar.tsx` to:

- Use `SidebarBrand` in the header slot
- Accept `shellData: ShellData` as a prop
- Render nav groups and items dynamically from `shellData.navGroups`
- Render quick links from `shellData.quickLinks` if present
- Map `iconKey` → icon component through a local `ICON_MAP` constant defined in the same file
- Contain zero inline navigation config

---

## Architectural Constraint Notes

### Layout must be a Server Component

The current `(internal)/layout.tsx` is `"use client"` due to `usePathname`. This is a hard blocker for future Supabase wiring because the layout needs to call `supabase.auth.getUser()` server-side. Fix: extract the pathname logic into a client island, keep the layout root as a Server Component.

### SidebarProvider belongs in the layout

The current `dashboard/page.tsx` owns `SidebarProvider` and `AppSidebar`. This causes the sidebar to re-mount on every route transition under `(internal)`. Moving these to the layout gives a persistent shell across all internal routes — which is the correct App Router pattern.

### Resolver signature is permanent

`getShellData(role, user?)` is the contract for all future phases. The mock phase uses it with a dummy user. The Supabase phase passes the real session user. The non-admin role rollout adds new entries to `role-nav-config.ts` and extends the `RoleCode` union — no other changes.

### Breadcrumbs are data-driven

Pages under `(internal)` must not hardcode their own `<Breadcrumb>` JSX. The layout renders breadcrumbs from the matched `NavItem.pageTitle` or a fallback derived from the route. This prevents N pages each duplicating breadcrumb markup.

### Supabase admin client (flagged for next phase)

The `admin/users` pages that follow this phase will require the Supabase **service role** admin client (`supabase.auth.admin.*`) — not the standard `@supabase/ssr` client — because:

- `auth.admin.listUsers()` requires service role key
- `auth.admin.inviteUserByEmail()` is the invite-only creation flow (per project spec — no self-registration)
- Role assignment writes to a `profiles` or `user_roles` table

This client must only be instantiated in Server Actions or Route Handlers, never in client components.

---

## Step-by-Step Implementation Plan

### Phase 1 — Foundation (no visible UI change)

#### Step 1 — Create `middleware.ts` stub

- Create `apps/web/middleware.ts`
- Define matcher: `/(internal)/:path*` and `/admin/:path*`
- Pass all requests through with `NextResponse.next()`
- Add a `TODO` comment marking where Supabase session check goes

#### Step 2 — Define shell contracts (`types.ts`)

- Create `apps/web/lib/shell/types.ts`
- Define `RoleCode`, `UserSummary`, `NavItem`, `NavGroup`, `ShellData` per the shapes above
- `UserSummary` fields must match `supabase.auth.getUser()` return shape
- No `teams` field in `ShellData`

#### Step 3 — Build nav config (`role-nav-config.ts`)

- Create `apps/web/lib/shell/role-nav-config.ts`
- Define `system_admin` nav groups using `ROUTE_PATTERNS` from `lib/routing.ts`
- Use `iconKey` strings only — no icon imports, no JSX
- Include `pageTitle` on each `NavItem` for breadcrumb use

#### Step 4 — Build resolver and mock source

- Create `apps/web/lib/shell/mock-role.ts` — returns `"system_admin"` as `RoleCode`
- Create `apps/web/lib/shell/get-shell-data.ts` — accepts `(role: RoleCode, user?: UserSummary)`, returns `ShellData` from `role-nav-config.ts`, substitutes mock `UserSummary` when `user` is absent

### Phase 2 — Shell Restructure

#### Step 5 — Create `SidebarBrand` component

- Create `apps/web/components/sidebar-brand.tsx`
- Static wordmark + subtitle + logo tile
- Respects sidebar collapse state

#### Step 6 — Refactor `AppSidebar`

- Remove all inline `data` objects from `apps/web/components/app-sidebar.tsx`
- Add `shellData: ShellData` prop
- Build local `ICON_MAP` for `iconKey` → Lucide component resolution
- Render nav groups and items from `shellData.navGroups`
- Replace `TeamSwitcher` with `SidebarBrand` in the header slot
- Delete `team-switcher.tsx`

#### Step 7 — Rewrite `(internal)/layout.tsx` as Server Component

- Remove `"use client"` from `layout.tsx`
- Call `getMockRole()` then `getShellData(role)` in the layout body (server-side)
- Mount `SidebarProvider` and `AppSidebar` with resolved shell data here
- Extract any pathname-based client logic into `apps/web/components/shell-client-bridge.tsx`
- Remove `SidebarProvider` + `AppSidebar` from `dashboard/page.tsx`

### Phase 3 — Admin Routes

#### Step 8 — Create `/admin/dashboard` page

- Create `apps/web/app/(internal)/admin/dashboard/page.tsx`
- Page content only — no shell chrome, no sidebar
- Breadcrumb driven by `NavItem.pageTitle` in the layout

#### Step 9 — Create `/admin/users` placeholder page

- Create `apps/web/app/(internal)/admin/users/page.tsx`
- Placeholder only for this phase
- Full implementation is the next phase (users list, new user, edit user)

#### Step 10 — Convert `/dashboard` to redirect bridge

- Replace `apps/web/app/(internal)/dashboard/page.tsx` content with `redirect(ROUTE_PATTERNS.adminDashboard)`
- No sidebar, no content — pure redirect

### Phase 4 — Verification

#### Step 11 — Route registry audit

- Review `apps/web/lib/routing.ts`
- Remove any route constants not referenced by current implementation
- Confirm `adminDashboard`, `adminUsers`, `adminUsersCreate`, `adminUsersEdit` are present

#### Step 12 — Type check and lint

```bash
cd project-link
pnpm turbo check-types
pnpm turbo lint
```

Fix all errors before proceeding.

#### Step 13 — Manual verification

- Navigate to `/dashboard` — must redirect to `/admin/dashboard`
- Navigate to `/admin/dashboard` — renders inside shared shell with sidebar
- Navigate to `/admin/users` — renders inside shared shell with sidebar
- Sidebar shows LINK / City Health Office II branding (no team switcher)
- Sidebar nav items match `system_admin` config in `role-nav-config.ts`
- Changing the role in `mock-role.ts` changes sidebar nav without touching any component

---

## Verification Checklist

- [ ] `apps/web/middleware.ts` exists with correct `(internal)` and `/admin` matcher
- [ ] `apps/web/app/(internal)/layout.tsx` has no `"use client"` directive
- [ ] `SidebarProvider` and `AppSidebar` are mounted only in the layout, not in any page
- [ ] `/admin/dashboard` renders inside the shared internal shell
- [ ] `/admin/users` renders inside the shared internal shell
- [ ] `/dashboard` redirects to `/admin/dashboard`
- [ ] `apps/web/lib/routing.ts` is the only file containing route path strings
- [ ] `app-sidebar.tsx` contains no inline nav config objects
- [ ] `team-switcher.tsx` is deleted
- [ ] `SidebarBrand` shows **LINK** / City Health Office II with no dropdown
- [ ] Sidebar content renders from `role-nav-config.ts` via the resolver
- [ ] Changing `mock-role.ts` changes the sidebar without touching any component
- [ ] `ShellData` type has no `teams` field
- [ ] `NavItem` type includes `pageTitle`
- [ ] `UserSummary` type matches `supabase.auth.getUser()` shape
- [ ] `getShellData` signature is `(role: RoleCode, user?: UserSummary): ShellData`
- [ ] Type checks pass with zero errors
- [ ] Lint passes with zero errors

---

## Future Phases

### Next: User Management Pages (admin-only)

After this plan is complete, the next implementation phase covers:

1. `/admin/users` — Users list with role, status, BHS assignment columns
2. `/admin/users/create` — Invite new user (Supabase `auth.admin.inviteUserByEmail`)
3. `/admin/users/[id]/edit` — Edit user role, BHS assignment, status

These pages require:

- Supabase service role admin client in Server Actions / Route Handlers only
- A `profiles` table (or `user_roles` join) for role and BHS assignment
- Zod schemas for user invite and edit forms
- React Hook Form + server action submission pattern
- No self-registration flow — admin invite only

### After user management: Supabase Auth Wiring

1. Replace `mock-role.ts` with real Supabase session read in `middleware.ts`
2. Pass real `UserSummary` from session into `getShellData(role, user)`
3. Delete `mock-role.ts`
4. Add RBAC enforcement: redirect non-admin users away from `/admin/*` in middleware

### After auth: Non-Admin Role Navigation Rollout

1. Add BHW, PHN, RHM, PHIS, CHO nav groups to `role-nav-config.ts`
2. Extend `RoleCode` union (already defined in `routing.ts`)
3. Add role-exclusive route namespaces following the same pattern as `/admin/*`
4. Shared routes remain shared — no duplication

---

## Notes

- `role-nav-config.ts` is the permanent canonical nav definition per role — not mock data. The word "mock" must not appear in this filename.
- `mock-role.ts` is the only throwaway file in this plan. It is deleted when Supabase wiring is live.
- Breadcrumbs are rendered by the layout from `NavItem.pageTitle` — individual pages do not own their own breadcrumb JSX.
- The Supabase admin client (`auth.admin.*`) required for user management is server-only and must never reach the client bundle.
