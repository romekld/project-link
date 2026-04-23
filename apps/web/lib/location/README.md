# Location Data Module

Offline-friendly location dependency utilities for forms.

## Source Snapshot

- Dataset: PSGC API snapshot
- Version: psgc-api-2026-04-12
- Files:
  - data/psgc-provinces.json
  - data/psgc-cities-municipalities.json

## Public API

- `getProvinceOptions()`
- `getCityMunicipalityOptionsByProvinceName(provinceName)`
- `isDasmarinasSelection(provinceName, cityMunicipalityName)`
- `getDefaultLocationValues()`

## Refresh Process

1. Run a script or command that fetches:
   - https://psgc.gitlab.io/api/provinces.json
   - https://psgc.gitlab.io/api/cities-municipalities.json
2. Replace the snapshot files in `data/`.
3. Update `LOCATION_DATASET_VERSION` in `constants.ts`.
4. Add a short note in docs/PLANS/changelog.md.
