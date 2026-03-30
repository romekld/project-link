# GIS Frontend Foundation Plan

## Summary
Implement the GIS work in priority order as: `Wave 0 Console Cleanup`, `Priority 2 Heatmap Fix`, then `Wave 1 Disease Map UX`, `Wave 2 Coverage Planner`, `Wave 3 Health Station Pins`, and finally the shared GIS/address foundation work after those pages are stable.

This phase remains frontend-only for CRUD and pin management. No backend wiring, DB mutations, or Supabase changes are included. All editable GIS flows use local mock state with a clear `Draft only` indicator.

## Implementation Changes

### Wave 0: Console Cleanup Gate
- Fix invalid breadcrumb DOM composition in [app-shell.tsx](D:\project-link\frontend\src\components\layout\app-shell.tsx) so separators are rendered as siblings in the list, not nested `<li>` inside `<li>`.
- Fix nested interactive control markup in [intelligence-map-page.tsx](D:\project-link\frontend\src\features\intelligence\components\intelligence-map-page.tsx) by removing `TooltipTrigger` wrappers around button-based toggle items and switching to a composition pattern that does not create `<button>` inside `<button>`.
- Fix MapLibre style switching in [map.tsx](D:\project-link\frontend\src\components\ui\map.tsx) so provider toggling does not throw projection migration errors. Treat provider switch as a full compatible style reset path, then re-apply map sources/layers after style load.
- Acceptance gate for all later work: no runtime errors or hydration warnings on the GIS routes.

### Priority 2: Heatmap Fix
- Keep heatmap scoped to CHO2 coverage only.
- Replace the current sparse one-point-per-barangay fixture generation with denser mock heat points per CHO2 barangay in [fixtures.ts](D:\project-link\frontend\src\features\intelligence\fixtures.ts). Generate multiple weighted points per polygon from seeded mock logic so the map renders as a true blurred gradient, not isolated solid blobs.
- Keep the low/mid zoom `heatmap` layer as the primary presentation, then add a higher-zoom circle fallback so hotspots remain visible instead of disappearing as zoom increases.
- Set heatmap `on` by default for CHO and sysadmin management views.
- Add a visible `Mock heat data` indicator and a compact legend. Do not add a heat intensity slider yet.

### Wave 1: Disease Map UX Refinement
- Make the shell header sticky and size the map canvas to `100dvh - header height` so the page has one intentional scroll behavior and no excess vertical overflow.
- Refactor layer controls into a clearer shadcn-based panel with grouped sections: `Base context`, `Overlays`, and `Presets`.
- Keep collapsible controls, open by default on desktop and collapsible on mobile.
- Show the provider switch in production with an explicit text label (`Carto` / `MapTiler`), not icon-only.
- Preserve the current map/detail split, but make the controls and side panel more consistent and less ambiguous.

### Wave 2: Coverage Planner Pages
- Create shared coverage planner UI and expose it at:
  - `/cho/intelligence/coverage`
  - `/admin/bhs/coverage`
- Restrict access to `city_health_officer` and `system_admin` only.
- Use map selection plus a shadcn DataTable-style list/search workflow. The table supports filtering, sorting, pagination, row selection, and bulk actions.
- Clicking a barangay polygon opens a popover with contextual actions: `Add to CHO2 scope` or `Remove from CHO2 scope`.
- All changes are staged in local mock state first. Show row and map badges for `In CHO2`, `Outside CHO2`, `Pending add`, and `Pending remove`.
- Require a reason field when staging add/remove actions so the flow is audit-ready even before backend wiring.

### Wave 3: Health Station Pins Pages
- Create shared pin management UI and expose it at:
  - `/cho/intelligence/pins`
  - `/admin/bhs/pins`
- Treat `BHS` and `health center` as the same model.
- Support one primary pin per BHS for now.
- Pin workflow: place on map, drag to adjust, edit precise `lat`/`lng`, review associated barangay, and save to local mock state.
- Show the current primary pin on the map with a persistent marker and a small details panel for coordinates and status.

### Shared Interfaces and Types
- Add route-level page metadata and nav entries for the new CHO and sysadmin GIS pages.
- Add frontend-only GIS management types for:
  - coverage draft actions
  - coverage status badges
  - BHS pin draft record with `facilityId`, `facilityName`, `barangayCode`, `latitude`, `longitude`, `isPrimary`, and draft status
  - layer preset identifiers for cleaner control-state management
- Keep all mock persistence local to the frontend feature module; do not define backend payload contracts yet beyond what is needed to avoid future UI rework.

## Test Plan
- Unit tests for fixture generation:
  - heatmap fixture produces multiple weighted points for CHO2 barangays
  - generated heat data is deterministic from seeded inputs
  - high-zoom fallback source/layer conditions match expected output
- Unit tests for role access and available layers:
  - CHO/sysadmin get management routes and default heatmap on
  - DSO and PHN do not receive coverage/pin management access
- Interaction tests:
  - no console warnings/errors on GIS routes
  - provider toggle works without MapLibre crashes
  - layer controls toggle correctly without invalid DOM nesting
  - coverage popover actions stage rows and polygons consistently
  - DataTable bulk add/remove updates staged counts and badges
  - pin placement, drag adjustment, and lat/lng edits stay synchronized
- Visual checks:
  - sticky header + map height remove the extra scrollbar
  - heatmap renders as a true blurred gradient at low/mid zoom
  - hotspot circles appear at high zoom
  - mobile drawer/detail interactions still work

## Assumptions and Defaults
- `Wave 5` priority is interpreted as the heatmap visibility/mock-data fix and is implemented immediately after Wave 0.
- Sysadmin GIS management stays under the existing `BHS Registry` area rather than creating a separate admin intelligence section.
- Coverage management and pin management remain frontend-only drafts until a later backend/db phase.
- Shared address-form foundation work is deferred until after Waves 0 through 3, but the new GIS pages should be built with reusable selectors and map state patterns so patient address work can adopt them later.
