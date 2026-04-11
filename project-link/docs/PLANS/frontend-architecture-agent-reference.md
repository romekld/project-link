# Frontend Architecture Agent Reference

## Purpose

This document is the implementation reference for AI agents working on `apps/web`.

It captures the agreed architecture and frontend layout conventions discussed in the project:

- route-first App Router structure
- feature-first domain modules
- shared dashboard shell in route-group layout
- shadcn-admin as reference style/system, adapted for Next.js

## Canonical Targets

1. Framework: Next.js 16 App Router in `apps/web`
2. UI System: shadcn/ui with `style: radix-nova`, `baseColor: mist`, `iconLibrary: lucide`
3. Styling: Tailwind v4 CSS-first, tokens in `app/globals.css`
4. Rendering model: RSC-first (`"use client"` only when required)

## Directory Architecture

```text
apps/web/
  app/
    layout.tsx
    (auth)/
      login/page.tsx
    (dashboard)/
      layout.tsx
      admin/
        dashboard/page.tsx
        users/page.tsx
      bhw/
        dashboard/page.tsx

  features/
    admin/
      dashboard/index.tsx
      users/index.tsx
    bhw/
      dashboard/index.tsx

  components/
    ui/
    shared/

  lib/
  hooks/
```

## Responsibility Split

### app layer

Use `app/**/page.tsx` for route orchestration only:

1. auth/role guards
2. params/searchParams handling
3. metadata and route-level control flow
4. render feature root component

Example:

```tsx
import { AdminUsersPage } from "@/features/admin/users";

export default function Page() {
  return <AdminUsersPage />;
}
```

### features layer

Use `features/**/index.tsx` as feature root UI scaffolding for page-level composition.

Example:

```tsx
export function AdminUsersPage() {
  return <section>{/* feature-owned scaffold */}</section>;
}
```

### shared shell layout

Use `app/(dashboard)/layout.tsx` for persistent shell concerns:

1. sidebar chrome
2. top-level internal dashboard frame
3. layout-level provider boundaries

Do not duplicate shell providers per child page.

## Import and Dependency Rules

1. One-way dependency flow: `app` -> `features` -> `components/ui`.
2. Keep `@/` alias for internal imports.
3. Avoid feature modules importing route files from `app/**`.
4. Keep shared primitives and reusable visual atoms in `components/ui` or `components/shared`.

## Routing Conventions

1. Use route groups for surface separation: `(auth)`, `(dashboard)`.
2. Use role namespaces under dashboard group: `/admin/*`, `/bhw/*`, etc.
3. Use explicit page directories (`dashboard/page.tsx`, `users/page.tsx`) to keep feature boundaries clear.

## shadcn-admin Reference Usage

Treat `apps/shadcn-admin` as a visual/structural reference, not a direct code copy source.

Can reuse conceptually:

1. layout composition patterns
2. feature grouping strategy
3. table/card/dashboard interaction patterns

Must adapt for Next.js:

1. TanStack Router to App Router file routes
2. provider placement to Next layout boundaries
3. RSC/client boundaries
4. target preset/token differences (`new-york/slate` source -> `radix-nova/mist` target)

## Frontend Layout Checklist (Per New Feature)

- [ ] Route created in `app/**/page.tsx`
- [ ] Feature root created in `features/**/index.tsx`
- [ ] Route imports feature root
- [ ] Shared shell concerns kept in `app/(dashboard)/layout.tsx`
- [ ] Uses semantic token classes (`bg-background`, `text-muted-foreground`, etc.)
- [ ] Uses local shadcn components (added through CLI workflow)
- [ ] Maintains touch target and accessibility requirements

## AI Agent Execution Rules

1. Before UI implementation, check `components.json` in target app.
2. For missing primitives, run shadcn workflow: `info`, `search`, `docs`, `add`.
3. Keep route files thin and feature files rich.
4. Avoid introducing `tailwind.config.js`.
5. Preserve healthcare constraints from root `AGENTS.md`.

## Related References

1. `docs/PLANS/shadcn-admin-to-web-migration-checklist.md`
2. `AGENTS.md`
3. `apps/web/components.json`
