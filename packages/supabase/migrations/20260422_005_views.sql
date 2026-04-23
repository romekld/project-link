-- ─── barangay_coverage_map_view ──────────────────────────────────────────────
-- Used by the GIS map to render all city barangay polygons with CHO scope flag.
CREATE OR REPLACE VIEW public.barangay_coverage_map_view AS
SELECT
  cb.id              AS city_barangay_id,
  b.id               AS operational_barangay_id,
  cb.pcode           AS pcode,
  COALESCE(b.name, cb.name) AS name,
  cb.city,
  ST_AsGeoJSON(cb.geometry)::jsonb AS geometry,
  COALESCE(b.is_active, false)     AS in_cho_scope,
  cb.source_area_sqkm,
  cb.source_date,
  cb.source_valid_on,
  cb.source_valid_to,
  cb.updated_at
FROM public.city_barangays cb
LEFT JOIN public.barangays b ON b.city_barangay_id = cb.id
ORDER BY cb.name;

-- ─── city_barangay_registry_view ─────────────────────────────────────────────
-- Full registry view used by the registry page: includes geometry as GeoJSON,
-- version count, and CHO scope flag.
CREATE OR REPLACE VIEW public.city_barangay_registry_view AS
SELECT
  cb.id,
  cb.name,
  cb.pcode,
  cb.city,
  cb.source_fid,
  cb.source_date::text          AS source_date,
  cb.source_valid_on::text      AS source_valid_on,
  cb.source_valid_to::text      AS source_valid_to,
  cb.source_area_sqkm,
  cb.source_payload,
  cb.updated_at,
  ST_AsGeoJSON(cb.geometry)::jsonb AS geometry,
  COALESCE(b.is_active, false)     AS in_cho_scope,
  COUNT(cgv.id)::int               AS version_count
FROM public.city_barangays cb
LEFT JOIN public.barangays b ON b.city_barangay_id = cb.id
LEFT JOIN public.city_barangay_geometry_versions cgv ON cgv.city_barangay_id = cb.id
GROUP BY cb.id, b.is_active
ORDER BY cb.name;

-- ─── health_station_management_view ──────────────────────────────────────────
-- Per-station summary used by the management list page.
CREATE OR REPLACE VIEW public.health_station_management_view AS
SELECT
  hs.id,
  hs.station_code,
  hs.name,
  hs.slug,
  hs.facility_type,
  hs.is_active,
  hs.deactivated_at,
  hs.deactivation_reason,
  hs.latitude,
  hs.longitude,
  hs.address,
  hs.notes,
  hs.physical_city_barangay_id,
  cb.name         AS physical_barangay_name,
  cb.pcode        AS physical_barangay_pcode,
  hs.created_at,
  hs.updated_at,
  COUNT(hsc.id) FILTER (WHERE hsc.is_active = true)                          AS coverage_count,
  COUNT(hsc.id) FILTER (WHERE hsc.is_active = true AND hsc.is_primary = true) AS primary_coverage_count,
  COUNT(p.id)   FILTER (WHERE p.status = 'active')                           AS assigned_staff_count
FROM public.health_stations hs
LEFT JOIN public.city_barangays cb ON cb.id = hs.physical_city_barangay_id
LEFT JOIN public.health_station_coverage hsc ON hsc.health_station_id = hs.id
LEFT JOIN public.profiles p ON p.health_station_id = hs.id
GROUP BY hs.id, cb.name, cb.pcode;

-- ─── health_station_coverage_view ────────────────────────────────────────────
-- Flat view used by the station editor to populate the coverage table.
CREATE OR REPLACE VIEW public.health_station_coverage_view AS
SELECT
  hsc.id,
  hsc.health_station_id,
  hs.name             AS health_station_name,
  hsc.barangay_id,
  b.name              AS barangay_name,
  cb.id               AS city_barangay_id,
  cb.name             AS city_barangay_name,
  cb.pcode            AS barangay_pcode,
  hsc.is_primary,
  hsc.is_active,
  hsc.notes,
  hsc.created_at,
  hsc.updated_at
FROM public.health_station_coverage hsc
JOIN public.health_stations hs ON hs.id = hsc.health_station_id
JOIN public.barangays b ON b.id = hsc.barangay_id
JOIN public.city_barangays cb ON cb.id = b.city_barangay_id;

-- Grants
GRANT SELECT ON public.barangay_coverage_map_view      TO authenticated, anon, service_role;
GRANT SELECT ON public.city_barangay_registry_view     TO authenticated, anon, service_role;
GRANT SELECT ON public.health_station_management_view  TO authenticated, anon, service_role;
GRANT SELECT ON public.health_station_coverage_view    TO authenticated, anon, service_role;
