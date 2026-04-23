# Dashboard Navigation Guide

This feature owns the dashboard sidebar navigation policy and rendering. Future agents should use this guide before adding, removing, or moving sidebar links.

## Source Of Truth

- The authenticated Supabase `profiles.role` decides which sidebar a user sees.
- The URL/pathname is used only for active-link highlighting.
- Shared role routing policy lives in `features/navigation/data/role-policy.ts`.
- shadcn/ui primitives in `components/ui/sidebar.tsx` must not be edited for navigation changes.

## Where To Add Or Remove Sidebar Items

For existing supported roles, edit only the role-local config:

```text
app/(dashboard)/admin/nav-config.ts
app/(dashboard)/bhw/nav-config.ts
app/(dashboard)/cho/nav-config.ts
app/(dashboard)/phn/nav-config.ts
app/(dashboard)/rhm/nav-config.ts
```

For production-ready navigation, add an item only when the target route has a real `page.tsx`. Planned links may be scaffolded only when the matching route work is actively in progress and the config makes that intent clear.

Each item should include a stable `id`, user-facing `title`, `href`, Lucide `icon`, and optional `match` patterns:

```ts
{
  id: "admin-users",
  title: "Users",
  href: "/admin/users",
  icon: UsersIcon,
  match: ["/admin/users", "/admin/users/*"],
}
```

Use `/*` for child routes when the parent item should stay active on nested pages.

## Nested Sidebar Items

Nested sidebar items are supported through shadcn sidebar submenu primitives. Use `children` on a parent item:

```ts
{
  id: "admin-health-stations",
  title: "Health Stations",
  icon: Building2Icon,
  match: ["/admin/health-stations", "/admin/health-stations/*"],
  children: [
    {
      id: "admin-health-stations-coverage-planner",
      title: "Coverage Planner",
      href: "/admin/health-stations/coverage-planner",
      icon: MapIcon,
      match: ["/admin/health-stations/coverage-planner"],
    },
  ],
}
```

The parent item renders as a native shadcn collapsible sidebar item. Child items render with `SidebarMenuSub`, `SidebarMenuSubItem`, and `SidebarMenuSubButton`.

Do not edit `components/ui/sidebar.tsx` to add nested nav behavior. Add or remove nested links through the role-local `nav-config.ts` files.

The admin `Health Stations` group is currently a scaffold for the BHS management move. Add the matching route pages before treating those links as complete.

## How The Sidebar Is Wired

The route-local configs are gathered by:

```text
app/(dashboard)/_navigation/sidebar-registry.ts
```

The dashboard layout fetches the viewer with:

```text
features/navigation/queries/get-dashboard-viewer.ts
```

The sidebar renderer lives in:

```text
features/navigation/components/app-sidebar.tsx
features/navigation/components/sidebar-nav.tsx
features/navigation/components/sidebar-user-menu.tsx
```

`components/app-sidebar.tsx` is only a compatibility re-export. Do not put navigation logic there.

## Adding A New Supported Role

When a new role is intentionally supported:

1. Add the role home and prefix to `features/navigation/data/role-policy.ts`.
2. Add `app/(dashboard)/<role>/nav-config.ts`.
3. Register the config in `app/(dashboard)/_navigation/sidebar-registry.ts`.
4. Ensure the role home route has a real `page.tsx`.
5. Update login/proxy behavior only through the shared role policy, not local constants.

## PHIS Note

`phis` is intentionally excluded for now because PHIS is planned to be removed or merged into CHO. Do not add `/phis` sidebar config or routes unless that product decision changes.

## Verification Checklist

- `pnpm lint`
- Confirm each role sees only its own nav.
- Confirm `/dashboard` redirects to the viewer role home.
- Confirm wrong-prefix access redirects to the viewer role home.
- Confirm sidebar footer displays the viewer profile, not hardcoded System Admin data.
- Confirm `components/ui/sidebar.tsx` has no diff.
