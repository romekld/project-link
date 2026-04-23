-- ─── Expand station_code to 6-digit serial ───────────────────────────────────
-- Update existing stub station codes from BHS-YYYY-001 → BHS-YYYY-000001.
UPDATE public.health_stations
SET station_code = REGEXP_REPLACE(
  station_code,
  '^(BHS-\d{4}-)(\d+)$',
  '\1' || LPAD(SUBSTRING(station_code FROM 'BHS-\d{4}-(\d+)$'), 6, '0')
)
WHERE station_code ~ '^BHS-\d{4}-\d{1,5}$';

-- Drop the view first since it references slug, then recreate it below.
DROP VIEW IF EXISTS public.health_station_management_view;

-- ─── Drop slug column ─────────────────────────────────────────────────────────
ALTER TABLE public.health_stations DROP COLUMN IF EXISTS slug;

-- ─── Update upsert_health_station: remove slug ────────────────────────────────
CREATE OR REPLACE FUNCTION public.upsert_health_station(
  p_actor_id                  uuid,
  p_station_id                uuid    DEFAULT NULL,
  p_station_code              text    DEFAULT NULL,
  p_name                      text    DEFAULT NULL,
  p_facility_type             text    DEFAULT NULL,
  p_physical_city_barangay_id uuid    DEFAULT NULL,
  p_address                   text    DEFAULT NULL,
  p_notes                     text    DEFAULT NULL,
  p_is_active                 boolean DEFAULT true,
  p_deactivation_reason       text    DEFAULT NULL,
  p_latitude                  numeric DEFAULT NULL,
  p_longitude                 numeric DEFAULT NULL
)
RETURNS public.health_stations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing  public.health_stations%ROWTYPE;
  v_result    public.health_stations%ROWTYPE;
BEGIN
  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'Station name is required';
  END IF;
  IF p_facility_type IS NULL OR btrim(p_facility_type) = '' THEN
    RAISE EXCEPTION 'Facility type is required';
  END IF;
  IF p_physical_city_barangay_id IS NULL THEN
    RAISE EXCEPTION 'Physical city barangay is required';
  END IF;
  IF p_station_code IS NULL OR btrim(p_station_code) = '' THEN
    RAISE EXCEPTION 'Station code is required';
  END IF;

  IF p_station_id IS NULL THEN
    INSERT INTO public.health_stations (
      station_code, name, facility_type, physical_city_barangay_id,
      address, notes, is_active, deactivated_at, deactivation_reason,
      latitude, longitude, created_by, updated_by
    )
    VALUES (
      p_station_code, p_name, p_facility_type, p_physical_city_barangay_id,
      NULLIF(btrim(COALESCE(p_address, '')), ''),
      NULLIF(btrim(COALESCE(p_notes, '')), ''),
      COALESCE(p_is_active, true),
      CASE WHEN COALESCE(p_is_active, true) THEN NULL ELSE now() END,
      NULLIF(btrim(COALESCE(p_deactivation_reason, '')), ''),
      p_latitude, p_longitude, p_actor_id, p_actor_id
    )
    RETURNING * INTO v_result;
  ELSE
    SELECT * INTO v_existing FROM public.health_stations WHERE id = p_station_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Health station not found';
    END IF;

    UPDATE public.health_stations
    SET
      station_code              = p_station_code,
      name                      = p_name,
      facility_type             = p_facility_type,
      physical_city_barangay_id = p_physical_city_barangay_id,
      address                   = NULLIF(btrim(COALESCE(p_address, '')), ''),
      notes                     = NULLIF(btrim(COALESCE(p_notes, '')), ''),
      is_active                 = COALESCE(p_is_active, true),
      deactivated_at            = CASE
                                    WHEN COALESCE(p_is_active, true) THEN NULL
                                    ELSE COALESCE(deactivated_at, now())
                                  END,
      deactivation_reason       = NULLIF(btrim(COALESCE(p_deactivation_reason, '')), ''),
      latitude                  = p_latitude,
      longitude                 = p_longitude,
      updated_by                = p_actor_id,
      updated_at                = now()
    WHERE id = p_station_id
    RETURNING * INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

-- ─── Update health_station_management_view: remove slug ───────────────────────
CREATE OR REPLACE VIEW public.health_station_management_view AS
SELECT
  hs.id,
  hs.station_code,
  hs.name,
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

GRANT SELECT ON public.health_station_management_view TO authenticated, anon, service_role;
