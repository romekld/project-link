# CHO Analytics GIS Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CHO-only GIS analytics workspace at `/cho/analytics/gis` with a map-first layout, a docked analytics rail, and a hybrid `MapLibre + deck.gl` visualization stack.

**Architecture:** Keep the existing dashboard sidebar and GIS shell, but make the dashboard chrome route-aware so this route can suppress the shared header and own the full canvas. Back the first version with real barangay geometry and station coordinates plus typed mock analytics so the UI contract is stable before real clinical aggregation exists.

**Tech Stack:** Next.js 16 App Router, React 19, shadcn/ui, Recharts, MapLibre GL JS, deck.gl, TypeScript, Vitest.

---

## Summary

Implement the CHO analytics GIS page in four execution slices:

1. Route and dashboard chrome override
2. Typed GIS analytics data contract and mock-backed query assembly
3. Map workspace with toolbar, choropleth, heatmap overlay, and station interactions
4. Right analytics rail, charts, drilldown, responsive behavior, and verification

Task 1 is already complete in commit `a782836ac8273da21672f60869d90c0b2b102476`.

## Key Decisions

- Route: `/cho/analytics/gis`
- Default thematic layer: disease burden by barangay
- Default time window: rolling `30d`
- Default overlays on: `heatmap`, `stations`
- Desktop chrome: keep sidebar, hide shared header, add compact page-local toolbar
- Desktop layout: full-height map canvas with a docked right rail
- Data mode for v1: real geometry and station coordinates, mocked analytics payloads
- Charts: 30-day trend + top-burden barangays
- Alerts: compact recent-alert feed in the lower right rail
- Map stack: existing MapLibre GIS shell plus `deck.gl` overlay for heatmap rendering

## Task Breakdown

### Task 1: Route and Shell Override

Status: Complete

- Added `/cho/analytics/gis`
- Added CHO nav entry
- Added route-aware dashboard shell policy
- Hid shared header only for this route
- Removed shared main padding only for this route

Checkpoint commit:

- `a782836ac8273da21672f60869d90c0b2b102476`

### Task 2: Data Contract and Query Assembly

**Files:**
- Create: `apps/web/features/cho-analytics/gis/data/schema.ts`
- Create: `apps/web/features/cho-analytics/gis/data/mock-analytics.ts`
- Create: `apps/web/features/cho-analytics/gis/queries.ts`
- Optionally create: `apps/web/features/cho-analytics/gis/data/geojson.ts`
- Modify: `apps/web/app/(dashboard)/cho/analytics/gis/page.tsx`

- [ ] Define UI-facing types for:
  - `ChoTimeWindow`
  - `ChoOverlayKey`
  - `ChoBarangayAnalytics`
  - `ChoHeatPoint`
  - `ChoStationPoint`
  - `ChoAlertPreview`
  - `ChoAnalyticsTrendPoint`
  - `ChoAnalyticsGisData`
- [ ] Reuse existing city barangay geometry and real station coordinates from the current app data sources instead of introducing new spatial storage.
- [ ] Create deterministic mock analytics keyed by `city_barangay_id` with data for `7d`, `30d`, and `90d`.
- [ ] Include chart-ready trend series and ranked barangay summaries in the query result so the page layer stays presentation-only.
- [ ] Replace the Task 1 placeholder page body with a server page that loads `ChoAnalyticsGisData` and passes it into a future client page shell.
- [ ] Verify with the smallest relevant checks:
  - `pnpm test`
  - `pnpm --filter web check-types`

### Task 3: Map Workspace and Toolbar

**Files:**
- Create: `apps/web/features/cho-analytics/gis/index.tsx`
- Create: `apps/web/features/cho-analytics/gis/components/cho-analytics-gis-page.tsx`
- Create: `apps/web/features/cho-analytics/gis/components/cho-analytics-map.tsx`
- Create: `apps/web/features/cho-analytics/gis/components/cho-analytics-toolbar.tsx`
- Modify: `apps/web/package.json`

- [ ] Add the required `deck.gl` packages for overlay-based heatmap rendering.
- [ ] Build the client page shell with local state for:
  - selected barangay
  - selected station
  - active time window
  - overlay toggles
  - reset-view trigger key
- [ ] Build a compact page-local toolbar with:
  - page title
  - `7d`, `30d`, `90d` window switcher
  - overlay toggles for choropleth, heatmap, stations
  - `Reset View` action
- [ ] Build the map using the existing `GisMapShell` for the base map and barangay selection behavior.
- [ ] Add a `deck.gl` heatmap overlay in interleaved mode instead of replacing the MapLibre shell.
- [ ] Render clickable station markers with lightweight detail popups.
- [ ] Keep the map canvas full-height and map-first.
- [ ] Verify with:
  - `pnpm --filter web check-types`
  - targeted test or build-safe checks for the new GIS feature

### Task 4: Analytics Rail, Charts, Responsive Behavior, and Verification

**Files:**
- Create: `apps/web/features/cho-analytics/gis/components/cho-analytics-rail.tsx`
- Create: `apps/web/features/cho-analytics/gis/components/rail-kpis.tsx`
- Create: `apps/web/features/cho-analytics/gis/components/rail-charts.tsx`
- Create: `apps/web/features/cho-analytics/gis/components/rail-drilldown.tsx`
- Create: `apps/web/features/cho-analytics/gis/components/rail-alert-feed.tsx`
- Modify: `apps/web/features/cho-analytics/gis/components/cho-analytics-gis-page.tsx`

- [ ] Build the docked desktop right rail in this order:
  - KPI cards
  - controls summary
  - 30-day trend chart
  - top-burden barangays chart
  - selected-barangay drilldown
  - compact alert feed
- [ ] Use the existing `components/ui/chart.tsx` chart wrapper rather than inventing a new chart abstraction.
- [ ] Make drilldown react to selected barangay and active time window.
- [ ] Make the rail responsive by converting it into a drawer or sheet on smaller breakpoints while preserving the map-first layout.
- [ ] Run final verification:
  - `pnpm test`
  - `pnpm --filter web check-types`
  - `pnpm lint`
- [ ] Update relevant docs if the implemented route or architecture needs documentation parity.

## Acceptance Checks

- `/cho/analytics/gis` exists and is reachable from CHO navigation.
- Shared dashboard header is hidden only on the GIS route.
- Shared dashboard padding is removed only on the GIS route.
- The page defaults to 30-day disease burden with heatmap and station overlays enabled.
- Barangay selection updates the drilldown panel.
- Station clicks show lightweight details.
- The right rail is docked on desktop and collapses appropriately on smaller screens.
- The implementation compiles and passes repo checks used during execution.

## Assumptions

- V1 remains read-only.
- Mock analytics are acceptable if their type contract is stable for later backend replacement.
- Existing GIS base utilities under `features/gis-map` remain the primary mapping abstraction.
