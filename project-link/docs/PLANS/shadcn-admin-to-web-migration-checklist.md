# Shadcn Admin to Web Migration Checklist

## Purpose

Use `apps/shadcn-admin` (Vite + TanStack Router) as a reference for UI structure and styling while implementing in `apps/web` (Next.js 16 App Router).

This document is the canonical migration playbook for humans and AI agents.

## Scope

- Full folder mapping from `apps/shadcn-admin/src` to `apps/web` targets
- Vite-to-Next adaptation rules (routing, providers, data flow, RSC boundaries)
- Styling/token translation rules for Tailwind v4 CSS-first setup
- Component parity checklist and migration acceptance criteria

## Non-Negotiable Constraints

1. Target app must stay on shadcn `style: radix-nova`, `baseColor: mist`, `iconLibrary: lucide`.
2. Tailwind v4 CSS-first only: keep tokens in `apps/web/app/globals.css`; do not add `tailwind.config.js`.
3. App Router conventions are required: route files in `app/**/page.tsx`, shared shells in `app/**/layout.tsx`.
4. Default to Server Components; only use `"use client"` when interaction/browser APIs require it.
5. For auth/data boundaries, follow Supabase + RLS requirements from `AGENTS.md`.
6. Clinical label language rules still apply: BHW localization only, clinical labels remain English.

## Source to Target Matrix

| shadcn-admin source | Next target in `apps/web` | Migration notes |
| :--- | :--- | :--- |
| `src/routes/**` | `app/**/page.tsx`, `app/**/layout.tsx` | Convert TanStack route tree to App Router folders and segments. |
| `src/features/**` | `features/**` | Keep feature-first domain modules; route files import feature entrypoints. |
| `src/components/ui/**` | `components/ui/**` | Use local shadcn CLI in `apps/web`; do not copy raw primitives from Vite app. |
| `src/components/layout/**` | `app/(dashboard)/layout.tsx` + `features/**/components` | Keep shell ownership at layout; keep page UI in feature modules. |
| `src/components/data-table/**` | `features/**/components` + `components/ui/table.tsx` | Keep domain table logic in feature layer, primitives in ui layer. |
| `src/context/**` | `app/layout.tsx` or route-group `layout.tsx` | Global providers in root; dashboard-only providers in dashboard layout. |
| `src/hooks/**` | `hooks/**` or `features/**/hooks` | Share only cross-feature hooks in root hooks folder. |
| `src/lib/**` | `lib/**` or `features/**/lib` | Keep app-wide infra in root lib; feature-specific logic with the feature. |
| `src/stores/**` | `features/**/stores` or `lib/**` | Avoid global mutable state unless truly cross-feature. |
| `src/styles/theme.css` | `app/globals.css` | Re-map token names to project tokens and keep semantic colors. |

## Routing and Composition Rules

1. Keep route files thin: auth/role checks, params, metadata, render feature root.
2. Put page scaffolding in feature entrypoints.
3. Keep one-way dependency flow: `app` -> `features` -> `components/ui`.

Example: route file (Next)

```tsx
import { AdminUsersPage } from "@/features/admin/users";

export default function Page() {
  return <AdminUsersPage />;
}
```

Example: feature root entrypoint

```tsx
export function AdminUsersPage() {
  return <section>{/* feature UI scaffolding */}</section>;
}
```

## Vite to Next Translation Examples

### 1) Route conversion

- Vite: `src/routes/_authenticated/users.tsx`
- Next: `app/(dashboard)/admin/users/page.tsx`

### 2) Shared shell placement

- Vite often composes shell in route tree nodes.
- Next should own shell in route group layout:
  - `app/(dashboard)/layout.tsx` for sidebar/header/frame
  - child pages render inside `{children}`

### 3) Provider placement

- Global providers: `app/layout.tsx`
- Dashboard-scoped providers: `app/(dashboard)/layout.tsx`
- Do not duplicate providers across child pages.

### 4) Feature loading pattern

- `app/(dashboard)/admin/dashboard/page.tsx` imports `@/features/admin/dashboard`
- `features/admin/dashboard/index.tsx` owns dashboard scaffolding

## Styling and Token Migration Rules

1. Use semantic tokens (`bg-background`, `text-muted-foreground`, `border-border`) instead of raw color classes.
2. Translate token intent, not exact raw values, when moving from `new-york/slate` source to `radix-nova/mist` target.
3. Keep `font-sans` bound to Inter and use `font-heading` intentionally for headings.
4. Preserve mobile-first behavior (`min-h-dvh`, 44x44 touch targets, no hover-only critical actions).

## Shadcn Workflow Requirements

For any new UI primitive/block needed during migration:

1. `pnpm dlx shadcn@latest info --json`
2. `pnpm dlx shadcn@latest search "@shadcn" -q "<query>"`
3. `pnpm dlx shadcn@latest docs <component>`
4. `pnpm dlx shadcn@latest add <component>`

Never bypass local shadcn setup by copying third-party primitive files directly.

## Component Parity Checklist

- [ ] Dashboard shell layout parity (sidebar, header, content frame)
- [ ] Navigation interaction parity (active states, groups, collapse behavior)
- [ ] Card/table/stat block parity for admin dashboard surfaces
- [ ] Form states parity (focus, invalid, disabled, helper text)
- [ ] Light/dark theme parity where applicable
- [ ] Mobile layout parity for field workflows
- [ ] Accessibility parity (focus visibility, keyboard navigation, labels/titles)

## Risk Register

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Source uses TanStack Router patterns | Incorrect route conversion | Maintain route mapping per feature before implementation. |
| Source style preset differs (`new-york/slate`) | Visual drift | Always adapt to `radix-nova/mist` tokens in `apps/web`. |
| Overuse of client components during migration | Performance regression | Keep RSC-first and isolate client islands. |
| Auth assumptions copied from demo app | Security bugs | Enforce Supabase session + DB-level RLS contracts. |

## Acceptance Criteria

1. Every migrated feature has a route entry in `app/**` and a feature entrypoint in `features/**`.
2. No copied Vite routing/runtime code remains in `apps/web`.
3. New UI uses local shadcn primitives and semantic token classes.
4. Docs and implementation align with `AGENTS.md` frontend and compliance constraints.

## Progress Tracker

| Area | Status | Notes |
| :--- | :--- | :--- |
| Dashboard shell | In progress | `app/(dashboard)/layout.tsx` established; continue parity pass. |
| Admin dashboard slice | In progress | Feature entrypoint pattern implemented. |
| Admin users slice | In progress | Feature entrypoint pattern implemented. |
| Remaining shadcn-admin features | Not started | Migrate by priority after shell hardening. |

## Related References

1. `docs/PLANS/frontend-architecture-agent-reference.md`
2. `AGENTS.md`
