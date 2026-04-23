# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — 2026-04-11

### Added

- Added `apps/web/proxy.ts` — Next.js 16 route proxy stub (replaces deprecated `middleware.ts`) with matcher covering all internal and admin routes. Pass-through for now; includes inline `TODO(auth)` instructions for Supabase session wiring.
- Added `apps/web/lib/shell/types.ts` — canonical shell data contracts: `RoleCode`, `UserSummary` (mirroring `supabase.auth.getUser()` shape), `NavItem` (with `pageTitle` for breadcrumbs, `iconKey` for component-layer resolution), `NavGroup`, `ShellData`. No `teams` field — single-org system.
- Added `apps/web/lib/shell/role-nav-config.ts` — permanent, canonical nav definition keyed by `RoleCode`. `system_admin` role has Administration (Dashboard, Users) and Settings (Profile, Preferences) groups. All other roles stubbed. All hrefs reference `ROUTE_PATTERNS`; no inline strings.
- Added `apps/web/lib/shell/mock-role.ts` — throwaway mock role source returning `"system_admin"`. Contains inline migration instructions for Supabase replacement.
- Added `apps/web/lib/shell/get-shell-data.ts` — resolver with Supabase-ready signature `getShellData(role, user?)`. Passing real `UserSummary` from session is the only change needed at auth wiring time.
- Added `apps/web/components/sidebar-brand.tsx` — static LINK / City Health Office II branding header using `SidebarMenuButton` pattern. Collapses gracefully to icon-only. No props, not configurable per role. `TeamSwitcher` permanently removed.
- Added `/admin/dashboard` page (`apps/web/app/(internal)/admin/dashboard/page.tsx`) — system admin home, renders inside shared shell.
- Added `/admin/users` placeholder page (`apps/web/app/(internal)/admin/users/page.tsx`) — stub with inline notes on Supabase service role client requirement for next phase.
- Added `docs/PLANS/system-admin-dynamic-sidebar-plan.md` — full implementation plan for the dynamic sidebar phase, including locked decisions, non-negotiable rules, architecture, and phased steps.

### Changed

- Changed the Project LINK role model to remove the separate reporting coordinator role from active role references. Final DQC, discrepancy returns, report approval, export, submission, and reporting-cycle closure are now assigned to CHO.
- Changed role-code documentation examples so `phn` maps to Public Health Nurse and `rhm` maps to Rural Health Midwife.
- Changed authored workflow docs and Mermaid flowcharts to use the handoff chain `BHW -> RHM -> PHN -> CHO`.
- Changed `apps/web/app/(internal)/layout.tsx` from a `"use client"` pathname-aware wrapper to a **Server Component** that owns `SidebarProvider` and `AppSidebar`. Shell data is resolved server-side via `getMockRole()` + `getShellData()`. Eliminates the client boundary at the layout root that would have blocked future Supabase session reads.
- Changed `apps/web/components/app-sidebar.tsx` to accept `shellData: ShellData` prop instead of inline static config. Nav groups and quick links rendered dynamically. Icon components resolved via local `ICON_MAP` keyed by `iconKey` string — no JSX in config data.
- Changed `apps/web/components/nav-main.tsx` to accept optional `groupLabel` prop (defaults to `"Modules"`) and branch on `item.items?.length`: items with children use `Collapsible` with chevron; items without children render as plain `SidebarMenuButton` + `Link` with no chevron and no collapsible wrapper.
- Changed `apps/web/app/(internal)/dashboard/page.tsx` from a content page to a pure redirect bridge to `/admin/dashboard`. Temporary; safe to delete once all inbound links are updated.

### Removed

- Removed the standalone reporting-coordinator userflow from active docs; its DQC/export/submission workflow is now merged into the CHO userflow.
- Removed `apps/web/components/team-switcher.tsx` — `TeamSwitcher` permanently retired. Replaced by static `SidebarBrand`. This is a single-org system; no team/org switching concept exists.
- Removed all inline static nav config objects (`data.teams`, `data.navMain`, `data.projects`, `data.user`) from `app-sidebar.tsx`. Sidebar now contains zero hardcoded navigation.
- Removed `SidebarProvider` and `AppSidebar` from `dashboard/page.tsx` — both moved to the shared layout.

## [Unreleased] — 2026-04-10

### Added

- Added shadcn sidebar-07 building blocks and required UI primitives (`sidebar`, `tooltip`, `sheet`, `dropdown-menu`, `collapsible`, `avatar`, `breadcrumb`, `skeleton`) to `apps/web`.
- Added dashboard sidebar composition files (`app-sidebar`, `nav-main`, `nav-projects`, `nav-user`, `team-switcher`) with Project LINK static menu content.

### Changed

- Changed `apps/web/app/(internal)/dashboard/page.tsx` from a generic route placeholder to an inset sidebar dashboard shell with KPI card placeholders.
- Changed `apps/web/app/(internal)/layout.tsx` to hide the internal placeholder header on `/dashboard` so the shell does not render duplicate top headers.
- Changed global styling in `apps/web/app/globals.css` to include themed, slimmer scrollbars for cleaner dashboard UX.

### Fixed

- Fixed dashboard runtime crash (`Tooltip must be used within TooltipProvider`) by wrapping the app root with `TooltipProvider` in `apps/web/app/layout.tsx`.

## [Unreleased] — 2026-04-09

### Added

- Replaced the default `apps/web` starter page structure with a routing-only App Router scaffold for Project LINK.
- Added shared `(auth)` and `(internal)` route groups plus Next.js root and internal error boundaries.
- Added placeholder routes for the locked digital FHSIS workflow map, including households, patients, validation, summary tables, consolidation, quality check, reports, surveillance, GIS, and settings.
- Added canonical route and role contracts in `apps/web/lib/routing.ts` for future auth, navigation, and dashboard composition work.
