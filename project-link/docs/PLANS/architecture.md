## Overview

Project LINK uses a staged frontend architecture where route coverage is scaffolded first, then upgraded by feature slices. The current slice delivers a dynamic, role-resolved sidebar shell for the system admin surface. The shell data layer is designed for Supabase session wiring as a drop-in replacement — no structural refactoring required.

## Layers

### Proxy layer

- `apps/web/proxy.ts` — Next.js 16 route proxy (replaces deprecated `middleware.ts`). Currently a pass-through stub. Matcher covers all `(internal)` and `/admin/*` routes. When Supabase auth is wired: reads session cookie via `@supabase/ssr`, calls `getUser()`, redirects unauthenticated users and enforces role-based route guards.

### App shell layer

- `apps/web/app/layout.tsx` — global font/theme chrome. Wraps app content in `TooltipProvider`.
- `apps/web/app/(internal)/layout.tsx` — **Server Component**. Owns `SidebarProvider` and `AppSidebar`. Resolves shell data server-side via `getMockRole()` + `getShellData()`. No `"use client"` at layout root — preserves the ability to call `supabase.auth.getUser()` server-side when auth is wired.

### Shell data layer

Lives in `apps/web/lib/shell/`:

| File | Role |
| :--- | :--- |
| `types.ts` | Canonical contracts: `RoleCode`, `UserSummary`, `NavItem`, `NavGroup`, `ShellData`. `UserSummary` mirrors `supabase.auth.getUser()` — no adapter needed at wiring time. |
| `role-nav-config.ts` | Permanent nav definition per role. `system_admin` has Administration + Settings groups. All hrefs from `ROUTE_PATTERNS`. No JSX, no functions — pure serializable data. |
| `get-shell-data.ts` | Resolver: `getShellData(role, user?)`. Signature is permanent — passing real `UserSummary` from Supabase session is the only wiring change at call sites. |
| `mock-role.ts` | **Throwaway.** Returns `"system_admin"`. Deleted when Supabase session read is live. |

### Sidebar composition layer

- `apps/web/components/sidebar-brand.tsx` — static LINK / City Health Office II branding. No props, not configurable per role. Uses `SidebarMenuButton` pattern for correct collapse behavior.
- `apps/web/components/app-sidebar.tsx` — accepts `shellData: ShellData`. Renders nav groups dynamically. Resolves `iconKey` → Lucide component via local `ICON_MAP`. Zero inline config.
- `apps/web/components/nav-main.tsx` — renders `NavGroup` items. Branches on `item.items?.length`: collapsible with chevron if children exist; plain `Link` button if leaf item.
- `apps/web/components/nav-projects.tsx` — quick links section, hidden in icon-collapsed mode.
- `apps/web/components/nav-user.tsx` — user avatar + dropdown in sidebar footer.

### Admin route surface

```text
app/(internal)/admin/dashboard/page.tsx   ← system admin home
app/(internal)/admin/users/page.tsx       ← user management (next phase)
app/(internal)/dashboard/page.tsx         ← redirect bridge → /admin/dashboard (temporary)
```

### UI primitives layer

- shadcn/ui primitives under `components/ui/`: `sidebar`, `tooltip`, `sheet`, `dropdown-menu`, `collapsible`, `avatar`, `breadcrumb`, `skeleton`, `separator`, and others.
- `hooks/use-mobile.ts` for sidebar mobile breakpoint detection.

## Data Flow

1. `proxy.ts` intercepts all requests and passes through (stub). Future: validates Supabase session.
2. `(internal)/layout.tsx` (Server Component) calls `getMockRole()` → `getShellData(role)` to produce `ShellData`.
3. `ShellData` (pure serializable data) is passed as a prop to `AppSidebar` (Client Component), crossing the server/client boundary safely.
4. `AppSidebar` maps `iconKey` strings to Lucide icon components via `ICON_MAP`, renders nav groups and user footer.
5. Each page under `(internal)` renders its own header (SidebarTrigger + Breadcrumb) and content inside `SidebarInset`.

## Key Decisions

- **Server Component layout**: `(internal)/layout.tsx` has no `"use client"`. This is required for future `supabase.auth.getUser()` server-side calls without introducing a client waterfall.
- **Pure-data shell config**: `ShellData` contains no JSX, no functions, no React nodes. Crosses the RSC boundary as serialized props. Icon resolution happens in the component layer only.
- **Resolver signature is permanent**: `getShellData(role, user?)` — mock phase omits `user`; Supabase phase passes real session user. No call-site changes needed.
- **`proxy.ts` not `middleware.ts`**: Next.js 16 renamed middleware to proxy. All route interception uses the new convention.
- **Single org, no team switching**: `TeamSwitcher` permanently removed. `ShellData` has no `teams` field. CHO II Dasmariñas City is the only organisation.
- **Admin namespace isolation**: `/admin/*` is reserved for system-admin-exclusive surfaces. Other role surfaces will get their own namespaces when built.
- **`/dashboard` is a bridge**: The route redirects to `/admin/dashboard` and will be deleted after all inbound links are updated.
