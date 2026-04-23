-- ─── Geometry helper ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.normalize_geojson_multipolygon(p_geometry jsonb)
RETURNS geometry(MultiPolygon, 4326)
LANGUAGE plpgsql
AS $$
DECLARE
  v_geom geometry;
BEGIN
  IF p_geometry IS NULL THEN
    RAISE EXCEPTION 'Geometry is required';
  END IF;

  v_geom := ST_SetSRID(ST_GeomFromGeoJSON(p_geometry::text), 4326);

  IF GeometryType(v_geom) = 'POLYGON' THEN
    v_geom := ST_Multi(v_geom);
  ELSIF GeometryType(v_geom) <> 'MULTIPOLYGON' THEN
    RAISE EXCEPTION 'Geometry must be Polygon or MultiPolygon, got %', GeometryType(v_geom);
  END IF;

  IF NOT ST_IsValid(v_geom) THEN
    RAISE EXCEPTION 'Invalid geometry: %', ST_IsValidReason(v_geom);
  END IF;

  RETURN v_geom::geometry(MultiPolygon, 4326);
END;
$$;

-- ─── Geometry versioning ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.record_city_barangay_geometry_version(
  p_city_barangay_id  uuid,
  p_geometry          geometry(MultiPolygon, 4326),
  p_source_payload    jsonb,
  p_change_type       text,
  p_reason            text,
  p_changed_by        uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_version_no integer;
BEGIN
  SELECT COALESCE(MAX(version_no), 0) + 1
  INTO v_version_no
  FROM public.city_barangay_geometry_versions
  WHERE city_barangay_id = p_city_barangay_id;

  INSERT INTO public.city_barangay_geometry_versions (
    city_barangay_id, version_no, geometry,
    source_payload, change_type, reason, changed_by
  )
  VALUES (
    p_city_barangay_id, v_version_no, p_geometry,
    COALESCE(p_source_payload, '{}'::jsonb), p_change_type, p_reason, p_changed_by
  );
END;
$$;

-- ─── Upsert a city barangay (admin only) ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.upsert_city_barangay(
  p_actor_id          uuid,
  p_name              text,
  p_pcode             text,
  p_city              text,
  p_reason            text,
  p_geometry_geojson  jsonb,
  p_source_payload    jsonb     DEFAULT '{}'::jsonb,
  p_source_fid        integer   DEFAULT NULL,
  p_source_date       date      DEFAULT NULL,
  p_source_valid_on   date      DEFAULT NULL,
  p_source_valid_to   date      DEFAULT NULL,
  p_source_area_sqkm  numeric   DEFAULT NULL,
  p_overwrite         boolean   DEFAULT false
)
RETURNS public.city_barangays
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing  public.city_barangays%ROWTYPE;
  v_result    public.city_barangays%ROWTYPE;
  v_geometry  geometry(MultiPolygon, 4326);
BEGIN
  IF p_pcode IS NULL OR btrim(p_pcode) = '' THEN
    RAISE EXCEPTION 'Barangay PSGC code is required';
  END IF;
  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'Barangay name is required';
  END IF;
  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;

  v_geometry := public.normalize_geojson_multipolygon(p_geometry_geojson);

  SELECT * INTO v_existing FROM public.city_barangays WHERE pcode = p_pcode FOR UPDATE;

  IF FOUND THEN
    IF NOT p_overwrite THEN
      RAISE EXCEPTION 'City barangay with pcode % already exists', p_pcode;
    END IF;

    UPDATE public.city_barangays
    SET
      name             = p_name,
      city             = COALESCE(NULLIF(btrim(p_city), ''), city),
      geometry         = v_geometry,
      source_fid       = p_source_fid,
      source_date      = p_source_date,
      source_valid_on  = p_source_valid_on,
      source_valid_to  = p_source_valid_to,
      source_area_sqkm = p_source_area_sqkm,
      source_payload   = COALESCE(p_source_payload, source_payload),
      updated_by       = p_actor_id,
      updated_at       = now()
    WHERE id = v_existing.id
    RETURNING * INTO v_result;

    PERFORM public.record_city_barangay_geometry_version(
      v_result.id, v_result.geometry, p_source_payload,
      'overwrite', p_reason, p_actor_id
    );
  ELSE
    INSERT INTO public.city_barangays (
      name, pcode, city, geometry,
      source_fid, source_date, source_valid_on, source_valid_to,
      source_area_sqkm, source_payload, created_by, updated_by
    )
    VALUES (
      p_name, p_pcode,
      COALESCE(NULLIF(btrim(p_city), ''), 'Dasmariñas'),
      v_geometry, p_source_fid, p_source_date, p_source_valid_on, p_source_valid_to,
      p_source_area_sqkm, COALESCE(p_source_payload, '{}'::jsonb),
      p_actor_id, p_actor_id
    )
    RETURNING * INTO v_result;

    PERFORM public.record_city_barangay_geometry_version(
      v_result.id, v_result.geometry, p_source_payload,
      'create', p_reason, p_actor_id
    );
  END IF;

  RETURN v_result;
END;
$$;

-- ─── Apply barangay coverage change (CHO scope) ───────────────────────────────
-- Adds, removes, or reactivates a barangay in the CHO2 operational scope.
CREATE OR REPLACE FUNCTION public.apply_barangay_coverage_change(
  p_actor_id          uuid,
  p_city_barangay_id  uuid,
  p_action            text,  -- 'add' | 'remove'
  p_reason            text,
  p_name              text   DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_city_barangay public.city_barangays%ROWTYPE;
  v_existing      public.barangays%ROWTYPE;
  v_result        public.barangays%ROWTYPE;
  v_effective_name text;
  v_effective_action text;
BEGIN
  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;

  SELECT * INTO v_city_barangay
  FROM public.city_barangays WHERE id = p_city_barangay_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown city barangay';
  END IF;

  v_effective_name := COALESCE(NULLIF(btrim(p_name), ''), v_city_barangay.name);

  SELECT * INTO v_existing
  FROM public.barangays WHERE city_barangay_id = p_city_barangay_id
  FOR UPDATE;

  IF p_action = 'remove' THEN
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No operational barangay exists for this city barangay';
    END IF;
    UPDATE public.barangays
    SET is_active = false, deactivated_at = now(),
        last_change_reason = p_reason, last_changed_by = p_actor_id, updated_at = now()
    WHERE id = v_existing.id
    RETURNING * INTO v_result;
    v_effective_action := 'remove';

  ELSIF p_action = 'add' THEN
    IF FOUND AND v_existing.is_active THEN
      -- Already in scope — no-op, return current state.
      v_result := v_existing;
      v_effective_action := 'no_change';
    ELSIF FOUND AND NOT v_existing.is_active THEN
      UPDATE public.barangays
      SET is_active = true, activated_at = now(), deactivated_at = NULL,
          name = v_effective_name,
          last_change_reason = p_reason, last_changed_by = p_actor_id, updated_at = now()
      WHERE id = v_existing.id
      RETURNING * INTO v_result;
      v_effective_action := 'reactivate';
    ELSE
      INSERT INTO public.barangays (
        city_barangay_id, name, pcode, is_active,
        activated_at, last_change_reason, last_changed_by
      )
      VALUES (
        v_city_barangay.id, v_effective_name, v_city_barangay.pcode,
        true, now(), p_reason, p_actor_id
      )
      RETURNING * INTO v_result;
      v_effective_action := 'add';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unsupported action: %. Use ''add'' or ''remove''.', p_action;
  END IF;

  RETURN jsonb_build_object('action', v_effective_action, 'barangay', to_jsonb(v_result));
END;
$$;

-- ─── Upsert health station ───────────────────────────────────────────────────
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
  v_slug      text;
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

  -- Auto-derive slug from station_code (e.g. BHS-2026-001 → bhs-2026-001).
  v_slug := LOWER(REGEXP_REPLACE(btrim(p_station_code), '[^a-zA-Z0-9]+', '-', 'g'));

  IF p_station_id IS NULL THEN
    INSERT INTO public.health_stations (
      station_code, name, slug, facility_type, physical_city_barangay_id,
      address, notes, is_active, deactivated_at, deactivation_reason,
      latitude, longitude, created_by, updated_by
    )
    VALUES (
      p_station_code, p_name, v_slug, p_facility_type, p_physical_city_barangay_id,
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
      slug                      = v_slug,
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

-- ─── Replace health station coverage (atomic full-replace) ───────────────────
CREATE OR REPLACE FUNCTION public.replace_health_station_coverage(
  p_actor_id          uuid,
  p_health_station_id uuid,
  p_rows              jsonb   -- [{barangay_id, is_primary, is_active, notes?}]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_station           public.health_stations%ROWTYPE;
  v_row               jsonb;
  v_row_id            uuid;
  v_barangay_id       uuid;
  v_is_primary        boolean;
  v_is_active         boolean;
  v_notes             text;
  v_seen_barangay_ids uuid[] := ARRAY[]::uuid[];
  v_processed         integer := 0;
  v_conflicts         integer := 0;
BEGIN
  IF jsonb_typeof(COALESCE(p_rows, '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'Coverage rows payload must be a JSON array';
  END IF;

  SELECT * INTO v_station FROM public.health_stations WHERE id = p_health_station_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Health station not found';
  END IF;

  FOR v_row IN SELECT value FROM jsonb_array_elements(COALESCE(p_rows, '[]'::jsonb))
  LOOP
    v_barangay_id := (v_row->>'barangay_id')::uuid;
    v_is_primary  := COALESCE((v_row->>'is_primary')::boolean, false);
    v_is_active   := COALESCE((v_row->>'is_active')::boolean, true);
    v_notes       := NULLIF(btrim(COALESCE(v_row->>'notes', '')), '');

    IF v_barangay_id IS NULL THEN
      RAISE EXCEPTION 'Each coverage row requires barangay_id';
    END IF;

    v_seen_barangay_ids := array_append(v_seen_barangay_ids, v_barangay_id);

    -- Clear primary from any other station before claiming it.
    IF v_is_active AND v_is_primary THEN
      UPDATE public.health_station_coverage
      SET is_primary = false, updated_by = p_actor_id, updated_at = now()
      WHERE barangay_id = v_barangay_id
        AND health_station_id <> p_health_station_id
        AND is_active = true AND is_primary = true;
      GET DIAGNOSTICS v_conflicts = ROW_COUNT;
    END IF;

    SELECT id INTO v_row_id
    FROM public.health_station_coverage
    WHERE health_station_id = p_health_station_id AND barangay_id = v_barangay_id AND is_active = true
    FOR UPDATE;

    IF v_row_id IS NULL THEN
      INSERT INTO public.health_station_coverage (
        health_station_id, barangay_id, is_primary, is_active, notes, created_by, updated_by
      )
      VALUES (
        p_health_station_id, v_barangay_id, v_is_primary, v_is_active,
        v_notes, p_actor_id, p_actor_id
      );
    ELSE
      UPDATE public.health_station_coverage
      SET is_primary = v_is_primary, is_active = v_is_active,
          notes = v_notes, updated_by = p_actor_id, updated_at = now()
      WHERE id = v_row_id;
    END IF;

    v_processed := v_processed + 1;
  END LOOP;

  -- Deactivate any coverage rows not in the incoming set.
  UPDATE public.health_station_coverage
  SET is_active = false, is_primary = false, updated_by = p_actor_id, updated_at = now()
  WHERE health_station_id = p_health_station_id
    AND is_active = true
    AND (cardinality(v_seen_barangay_ids) = 0 OR barangay_id <> ALL(v_seen_barangay_ids));

  RETURN jsonb_build_object('processed_rows', v_processed, 'primary_reassignments', v_conflicts);
END;
$$;

-- ─── Deactivate health station ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.deactivate_health_station(
  p_actor_id          uuid,
  p_health_station_id uuid,
  p_reason            text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_station   public.health_stations%ROWTYPE;
  v_impacted  jsonb;
BEGIN
  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;

  SELECT * INTO v_station FROM public.health_stations WHERE id = p_health_station_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Health station not found';
  END IF;

  -- Collect barangays that will lose their only primary station.
  SELECT COALESCE(jsonb_agg(jsonb_build_object('barangay_id', b.id, 'barangay_name', b.name) ORDER BY b.name), '[]'::jsonb)
  INTO v_impacted
  FROM public.health_station_coverage hsc
  JOIN public.barangays b ON b.id = hsc.barangay_id
  WHERE hsc.health_station_id = p_health_station_id
    AND hsc.is_active = true AND hsc.is_primary = true
    AND NOT EXISTS (
      SELECT 1 FROM public.health_station_coverage other
      WHERE other.barangay_id = hsc.barangay_id
        AND other.health_station_id <> p_health_station_id
        AND other.is_active = true AND other.is_primary = true
    );

  UPDATE public.health_stations
  SET is_active = false, deactivated_at = now(),
      deactivation_reason = p_reason, updated_by = p_actor_id, updated_at = now()
  WHERE id = p_health_station_id;

  UPDATE public.health_station_coverage
  SET is_active = false, is_primary = false, updated_by = p_actor_id, updated_at = now()
  WHERE health_station_id = p_health_station_id AND is_active = true;

  RETURN jsonb_build_object(
    'station_id', p_health_station_id,
    'station_name', v_station.name,
    'impacted_barangays', v_impacted
  );
END;
$$;

-- ─── Reactivate health station ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reactivate_health_station(
  p_actor_id          uuid,
  p_health_station_id uuid
)
RETURNS public.health_stations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.health_stations%ROWTYPE;
BEGIN
  UPDATE public.health_stations
  SET is_active = true, deactivated_at = NULL,
      deactivation_reason = NULL, updated_by = p_actor_id, updated_at = now()
  WHERE id = p_health_station_id
  RETURNING * INTO v_result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Health station not found';
  END IF;

  RETURN v_result;
END;
$$;

-- ─── Preview coverage impact (dry-run) ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.preview_health_station_coverage_impact(
  p_health_station_id uuid,
  p_rows              jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows jsonb := COALESCE(p_rows, '[]'::jsonb);
BEGIN
  IF jsonb_typeof(v_rows) <> 'array' THEN
    RAISE EXCEPTION 'Coverage rows payload must be a JSON array';
  END IF;

  RETURN jsonb_build_object(
    'barangays_losing_primary',
    COALESCE((
      WITH incoming AS (
        SELECT (value->>'barangay_id')::uuid AS barangay_id,
               COALESCE((value->>'is_active')::boolean, true) AS is_active,
               COALESCE((value->>'is_primary')::boolean, false) AS is_primary
        FROM jsonb_array_elements(v_rows)
      ),
      removed_primary AS (
        SELECT hsc.barangay_id
        FROM public.health_station_coverage hsc
        LEFT JOIN incoming i ON i.barangay_id = hsc.barangay_id
        WHERE hsc.health_station_id = p_health_station_id
          AND hsc.is_active = true AND hsc.is_primary = true
          AND (i.barangay_id IS NULL OR i.is_active = false OR i.is_primary = false)
      )
      SELECT jsonb_agg(jsonb_build_object('barangay_id', b.id, 'barangay_name', b.name) ORDER BY b.name)
      FROM removed_primary rp JOIN public.barangays b ON b.id = rp.barangay_id
    ), '[]'::jsonb),
    'barangays_gaining_primary',
    COALESCE((
      WITH incoming AS (
        SELECT (value->>'barangay_id')::uuid AS barangay_id,
               COALESCE((value->>'is_active')::boolean, true) AS is_active,
               COALESCE((value->>'is_primary')::boolean, false) AS is_primary
        FROM jsonb_array_elements(v_rows)
      )
      SELECT jsonb_agg(jsonb_build_object('barangay_id', b.id, 'barangay_name', b.name) ORDER BY b.name)
      FROM incoming i JOIN public.barangays b ON b.id = i.barangay_id
      WHERE i.is_active = true AND i.is_primary = true
    ), '[]'::jsonb)
  );
END;
$$;

-- Grants (service_role calls these from Server Actions via admin client).
GRANT EXECUTE ON FUNCTION public.normalize_geojson_multipolygon(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_city_barangay_geometry_version(uuid, geometry, jsonb, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_city_barangay(uuid, text, text, text, text, jsonb, jsonb, integer, date, date, date, numeric, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_barangay_coverage_change(uuid, uuid, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_health_station(uuid, uuid, text, text, text, uuid, text, text, boolean, text, numeric, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.replace_health_station_coverage(uuid, uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.deactivate_health_station(uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.reactivate_health_station(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.preview_health_station_coverage_impact(uuid, jsonb) TO service_role;
