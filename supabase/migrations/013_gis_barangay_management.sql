ALTER TABLE public.city_barangays
  ADD COLUMN IF NOT EXISTS source_fid integer,
  ADD COLUMN IF NOT EXISTS source_date date,
  ADD COLUMN IF NOT EXISTS source_valid_on date,
  ADD COLUMN IF NOT EXISTS source_valid_to date,
  ADD COLUMN IF NOT EXISTS source_area_sqkm numeric(12, 6),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.user_profiles(id),
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.user_profiles(id);

ALTER TABLE public.barangays
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS deactivated_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_change_reason text,
  ADD COLUMN IF NOT EXISTS last_changed_by uuid REFERENCES public.user_profiles(id),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE public.barangays
SET
  activated_at = COALESCE(activated_at, created_at, now()),
  last_change_reason = COALESCE(last_change_reason, 'Initial seed import')
WHERE activated_at IS NULL
   OR last_change_reason IS NULL;

ALTER TABLE public.barangays
  ALTER COLUMN activated_at SET DEFAULT now(),
  ALTER COLUMN activated_at SET NOT NULL,
  ALTER COLUMN last_change_reason SET DEFAULT 'Initial seed import',
  ALTER COLUMN last_change_reason SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.city_barangay_geometry_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_barangay_id uuid NOT NULL REFERENCES public.city_barangays(id) ON DELETE CASCADE,
  version_no integer NOT NULL,
  geometry geometry(MultiPolygon, 4326) NOT NULL,
  source_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  change_type text NOT NULL CHECK (change_type IN ('create', 'overwrite', 'manual_edit')),
  reason text NOT NULL,
  changed_by uuid REFERENCES public.user_profiles(id),
  changed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city_barangay_id, version_no)
);

CREATE TABLE IF NOT EXISTS public.city_barangay_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid NOT NULL REFERENCES public.user_profiles(id),
  filename text NOT NULL,
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'validated', 'committed', 'failed', 'cancelled')),
  total_features integer NOT NULL DEFAULT 0,
  valid_features integer NOT NULL DEFAULT 0,
  error_features integer NOT NULL DEFAULT 0,
  duplicate_features integer NOT NULL DEFAULT 0,
  payload_size_bytes integer,
  source_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz,
  committed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.city_barangay_import_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.city_barangay_import_jobs(id) ON DELETE CASCADE,
  feature_index integer NOT NULL,
  pcode text,
  name text,
  action text NOT NULL DEFAULT 'invalid' CHECK (action IN ('create', 'skip', 'overwrite', 'invalid', 'review_required')),
  validation_errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  normalized_geometry geometry(MultiPolygon, 4326),
  source_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  selected_overwrite boolean NOT NULL DEFAULT false,
  existing_city_barangay_id uuid REFERENCES public.city_barangays(id),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, feature_index)
);

CREATE UNIQUE INDEX IF NOT EXISTS barangays_city_barangay_id_key
  ON public.barangays(city_barangay_id);

CREATE UNIQUE INDEX IF NOT EXISTS barangays_pcode_key
  ON public.barangays(pcode);

CREATE INDEX IF NOT EXISTS city_barangays_geometry_gix
  ON public.city_barangays
  USING gist(geometry);

CREATE INDEX IF NOT EXISTS barangays_is_active_idx
  ON public.barangays(is_active);

CREATE INDEX IF NOT EXISTS city_barangay_geometry_versions_barangay_idx
  ON public.city_barangay_geometry_versions(city_barangay_id, version_no DESC);

CREATE INDEX IF NOT EXISTS city_barangay_import_jobs_status_idx
  ON public.city_barangay_import_jobs(status, created_at DESC);

CREATE INDEX IF NOT EXISTS city_barangay_import_items_job_idx
  ON public.city_barangay_import_items(job_id, feature_index);

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt()->>'app_role',
    auth.jwt()->'app_metadata'->>'role'
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

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
    RAISE EXCEPTION 'Geometry must be Polygon or MultiPolygon';
  END IF;

  IF NOT ST_IsValid(v_geom) THEN
    RAISE EXCEPTION 'Invalid geometry: %', ST_IsValidReason(v_geom);
  END IF;

  RETURN v_geom::geometry(MultiPolygon, 4326);
END;
$$;

CREATE OR REPLACE FUNCTION public.append_audit_log(
  p_actor_id uuid,
  p_action text,
  p_table_name text,
  p_record_id uuid,
  p_old_data jsonb,
  p_new_data jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    actor_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  )
  VALUES (
    p_actor_id,
    p_action,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_city_barangay_geometry_version(
  p_city_barangay_id uuid,
  p_geometry geometry(MultiPolygon, 4326),
  p_source_payload jsonb,
  p_change_type text,
  p_reason text,
  p_changed_by uuid
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
    city_barangay_id,
    version_no,
    geometry,
    source_payload,
    change_type,
    reason,
    changed_by
  )
  VALUES (
    p_city_barangay_id,
    v_version_no,
    p_geometry,
    COALESCE(p_source_payload, '{}'::jsonb),
    p_change_type,
    p_reason,
    p_changed_by
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_barangay_from_city()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_city_barangay public.city_barangays%ROWTYPE;
BEGIN
  SELECT *
  INTO v_city_barangay
  FROM public.city_barangays
  WHERE id = NEW.city_barangay_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown city_barangay_id %', NEW.city_barangay_id;
  END IF;

  NEW.pcode := v_city_barangay.pcode;

  IF NEW.name IS NULL OR btrim(NEW.name) = '' THEN
    NEW.name := v_city_barangay.name;
  END IF;

  IF NEW.is_active THEN
    NEW.deactivated_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_city_barangay(
  p_actor_id uuid,
  p_name text,
  p_pcode text,
  p_city text,
  p_reason text,
  p_geometry_geojson jsonb,
  p_source_payload jsonb DEFAULT '{}'::jsonb,
  p_source_fid integer DEFAULT NULL,
  p_source_date date DEFAULT NULL,
  p_source_valid_on date DEFAULT NULL,
  p_source_valid_to date DEFAULT NULL,
  p_source_area_sqkm numeric DEFAULT NULL,
  p_overwrite boolean DEFAULT false
)
RETURNS public.city_barangays
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.city_barangays%ROWTYPE;
  v_result public.city_barangays%ROWTYPE;
  v_geometry geometry(MultiPolygon, 4326);
  v_old_data jsonb;
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

  SELECT *
  INTO v_existing
  FROM public.city_barangays
  WHERE pcode = p_pcode
  FOR UPDATE;

  IF FOUND THEN
    IF NOT p_overwrite THEN
      RAISE EXCEPTION 'City barangay with pcode % already exists', p_pcode;
    END IF;

    v_old_data := to_jsonb(v_existing);

    UPDATE public.city_barangays
    SET
      name = p_name,
      city = COALESCE(NULLIF(btrim(p_city), ''), city),
      geometry = v_geometry,
      source_fid = p_source_fid,
      source_date = p_source_date,
      source_valid_on = p_source_valid_on,
      source_valid_to = p_source_valid_to,
      source_area_sqkm = p_source_area_sqkm,
      updated_by = p_actor_id,
      updated_at = now()
    WHERE id = v_existing.id
    RETURNING *
    INTO v_result;

    PERFORM public.record_city_barangay_geometry_version(
      v_result.id,
      v_result.geometry,
      p_source_payload,
      'overwrite',
      p_reason,
      p_actor_id
    );

    PERFORM public.append_audit_log(
      p_actor_id,
      'overwrite',
      'city_barangays',
      v_result.id,
      v_old_data,
      to_jsonb(v_result)
    );
  ELSE
    INSERT INTO public.city_barangays (
      name,
      pcode,
      city,
      geometry,
      source_fid,
      source_date,
      source_valid_on,
      source_valid_to,
      source_area_sqkm,
      created_by,
      updated_by
    )
    VALUES (
      p_name,
      p_pcode,
      COALESCE(NULLIF(btrim(p_city), ''), 'Dasmarinas City'),
      v_geometry,
      p_source_fid,
      p_source_date,
      p_source_valid_on,
      p_source_valid_to,
      p_source_area_sqkm,
      p_actor_id,
      p_actor_id
    )
    RETURNING *
    INTO v_result;

    PERFORM public.record_city_barangay_geometry_version(
      v_result.id,
      v_result.geometry,
      p_source_payload,
      'create',
      p_reason,
      p_actor_id
    );

    PERFORM public.append_audit_log(
      p_actor_id,
      'create',
      'city_barangays',
      v_result.id,
      NULL,
      to_jsonb(v_result)
    );
  END IF;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_barangay_coverage_change(
  p_actor_id uuid,
  p_city_barangay_id uuid,
  p_action text,
  p_reason text,
  p_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_city_barangay public.city_barangays%ROWTYPE;
  v_existing public.barangays%ROWTYPE;
  v_result public.barangays%ROWTYPE;
  v_old_data jsonb;
  v_effective_name text;
  v_effective_action text;
BEGIN
  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;

  SELECT *
  INTO v_city_barangay
  FROM public.city_barangays
  WHERE id = p_city_barangay_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown city barangay';
  END IF;

  v_effective_name := COALESCE(NULLIF(btrim(p_name), ''), v_city_barangay.name);

  SELECT *
  INTO v_existing
  FROM public.barangays
  WHERE city_barangay_id = p_city_barangay_id
  FOR UPDATE;

  IF p_action IN ('remove', 'deactivate') THEN
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No operational barangay exists for this city barangay';
    END IF;

    v_old_data := to_jsonb(v_existing);

    UPDATE public.barangays
    SET
      name = COALESCE(NULLIF(btrim(p_name), ''), name),
      is_active = false,
      deactivated_at = now(),
      last_change_reason = p_reason,
      last_changed_by = p_actor_id,
      updated_at = now()
    WHERE id = v_existing.id
    RETURNING *
    INTO v_result;

    v_effective_action := 'deactivate';
  ELSIF p_action = 'update' THEN
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No operational barangay exists for this city barangay';
    END IF;

    v_old_data := to_jsonb(v_existing);

    UPDATE public.barangays
    SET
      name = v_effective_name,
      last_change_reason = p_reason,
      last_changed_by = p_actor_id,
      updated_at = now()
    WHERE id = v_existing.id
    RETURNING *
    INTO v_result;

    v_effective_action := 'update';
  ELSIF p_action = 'add' THEN
    IF FOUND AND v_existing.is_active THEN
      v_old_data := to_jsonb(v_existing);

      UPDATE public.barangays
      SET
        name = v_effective_name,
        last_change_reason = p_reason,
        last_changed_by = p_actor_id,
        updated_at = now()
      WHERE id = v_existing.id
      RETURNING *
      INTO v_result;

      v_effective_action := 'update';
    ELSIF FOUND AND NOT v_existing.is_active THEN
      v_old_data := to_jsonb(v_existing);

      UPDATE public.barangays
      SET
        name = v_effective_name,
        is_active = true,
        activated_at = now(),
        deactivated_at = NULL,
        last_change_reason = p_reason,
        last_changed_by = p_actor_id,
        updated_at = now()
      WHERE id = v_existing.id
      RETURNING *
      INTO v_result;

      v_effective_action := 'reactivate';
    ELSE
      v_old_data := NULL;

      INSERT INTO public.barangays (
        city_barangay_id,
        name,
        pcode,
        is_active,
        activated_at,
        last_change_reason,
        last_changed_by
      )
      VALUES (
        v_city_barangay.id,
        v_effective_name,
        v_city_barangay.pcode,
        true,
        now(),
        p_reason,
        p_actor_id
      )
      RETURNING *
      INTO v_result;

      v_effective_action := 'add';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unsupported action %', p_action;
  END IF;

  PERFORM public.append_audit_log(
    p_actor_id,
    v_effective_action,
    'barangays',
    v_result.id,
    v_old_data,
    to_jsonb(v_result)
  );

  RETURN jsonb_build_object(
    'action', v_effective_action,
    'barangay', to_jsonb(v_result)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.stage_city_barangay_import_job(
  p_actor_id uuid,
  p_filename text,
  p_payload jsonb,
  p_payload_size_bytes integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job public.city_barangay_import_jobs%ROWTYPE;
  v_feature jsonb;
  v_features jsonb;
  v_geometry geometry(MultiPolygon, 4326);
  v_props jsonb;
  v_pcode text;
  v_name text;
  v_errors jsonb;
  v_existing_city_barangay_id uuid;
  v_feature_index integer := 0;
  v_total integer := 0;
  v_valid integer := 0;
  v_error integer := 0;
  v_duplicate integer := 0;
  v_action text;
BEGIN
  IF p_payload IS NULL THEN
    RAISE EXCEPTION 'GeoJSON payload is required';
  END IF;

  IF p_payload->>'type' = 'Feature' THEN
    v_features := jsonb_build_array(p_payload);
  ELSIF p_payload->>'type' = 'FeatureCollection' THEN
    v_features := COALESCE(p_payload->'features', '[]'::jsonb);
  ELSE
    RAISE EXCEPTION 'Payload must be a GeoJSON Feature or FeatureCollection';
  END IF;

  INSERT INTO public.city_barangay_import_jobs (
    uploaded_by,
    filename,
    payload_size_bytes,
    source_payload
  )
  VALUES (
    p_actor_id,
    COALESCE(NULLIF(btrim(p_filename), ''), 'upload.geojson'),
    p_payload_size_bytes,
    jsonb_build_object('type', COALESCE(p_payload->>'type', 'unknown'))
  )
  RETURNING *
  INTO v_job;

  FOR v_feature IN
    SELECT value
    FROM jsonb_array_elements(v_features)
  LOOP
    v_feature_index := v_feature_index + 1;
    v_total := v_total + 1;
    v_errors := '[]'::jsonb;
    v_geometry := NULL;
    v_existing_city_barangay_id := NULL;
    v_props := COALESCE(v_feature->'properties', '{}'::jsonb);
    v_pcode := COALESCE(
      NULLIF(v_props->>'ADM4_PCODE', ''),
      NULLIF(v_props->>'pcode', ''),
      NULLIF(v_props->>'barangay_code', '')
    );
    v_name := COALESCE(
      NULLIF(v_props->>'ADM4_EN', ''),
      NULLIF(v_props->>'name', ''),
      NULLIF(v_props->>'barangay_name', '')
    );

    IF COALESCE(v_feature->>'type', '') <> 'Feature' THEN
      v_errors := v_errors || jsonb_build_array('Feature type must be Feature');
    END IF;

    IF v_pcode IS NULL THEN
      v_errors := v_errors || jsonb_build_array('Missing ADM4_PCODE or pcode');
    END IF;

    IF v_name IS NULL THEN
      v_errors := v_errors || jsonb_build_array('Missing ADM4_EN or name');
    END IF;

    IF v_feature->'geometry' IS NULL THEN
      v_errors := v_errors || jsonb_build_array('Missing geometry');
    END IF;

    IF jsonb_array_length(v_errors) = 0 THEN
      BEGIN
        v_geometry := public.normalize_geojson_multipolygon(v_feature->'geometry');
      EXCEPTION
        WHEN OTHERS THEN
          v_errors := v_errors || jsonb_build_array(SQLERRM);
      END;
    END IF;

    IF v_pcode IS NOT NULL THEN
      SELECT id
      INTO v_existing_city_barangay_id
      FROM public.city_barangays
      WHERE pcode = v_pcode;
    END IF;

    IF jsonb_array_length(v_errors) > 0 THEN
      v_action := 'invalid';
      v_error := v_error + 1;
    ELSIF v_existing_city_barangay_id IS NOT NULL THEN
      v_action := 'review_required';
      v_valid := v_valid + 1;
      v_duplicate := v_duplicate + 1;
    ELSE
      v_action := 'create';
      v_valid := v_valid + 1;
    END IF;

    INSERT INTO public.city_barangay_import_items (
      job_id,
      feature_index,
      pcode,
      name,
      action,
      validation_errors,
      normalized_geometry,
      source_payload,
      existing_city_barangay_id
    )
    VALUES (
      v_job.id,
      v_feature_index,
      v_pcode,
      v_name,
      v_action,
      v_errors,
      v_geometry,
      v_feature,
      v_existing_city_barangay_id
    );
  END LOOP;

  UPDATE public.city_barangay_import_jobs
  SET
    status = 'validated',
    total_features = v_total,
    valid_features = v_valid,
    error_features = v_error,
    duplicate_features = v_duplicate,
    validated_at = now()
  WHERE id = v_job.id
  RETURNING *
  INTO v_job;

  RETURN jsonb_build_object('job', to_jsonb(v_job));
END;
$$;

CREATE OR REPLACE FUNCTION public.commit_city_barangay_import_job(
  p_job_id uuid,
  p_actor_id uuid,
  p_decisions jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job public.city_barangay_import_jobs%ROWTYPE;
  v_item public.city_barangay_import_items%ROWTYPE;
  v_decision jsonb;
  v_feature_props jsonb;
  v_result public.city_barangays%ROWTYPE;
  v_processed integer := 0;
BEGIN
  SELECT *
  INTO v_job
  FROM public.city_barangay_import_jobs
  WHERE id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Import job not found';
  END IF;

  IF v_job.status <> 'validated' THEN
    RAISE EXCEPTION 'Only validated jobs can be committed';
  END IF;

  IF jsonb_typeof(COALESCE(p_decisions, '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'Decisions payload must be an array';
  END IF;

  FOR v_decision IN
    SELECT value
    FROM jsonb_array_elements(COALESCE(p_decisions, '[]'::jsonb))
  LOOP
    UPDATE public.city_barangay_import_items
    SET
      action = CASE
        WHEN COALESCE(v_decision->>'action', '') IN ('skip', 'overwrite', 'create') THEN v_decision->>'action'
        ELSE action
      END,
      selected_overwrite = COALESCE((v_decision->>'selected_overwrite')::boolean, (v_decision->>'action') = 'overwrite', selected_overwrite)
    WHERE job_id = p_job_id
      AND id = (v_decision->>'item_id')::uuid;
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM public.city_barangay_import_items
    WHERE job_id = p_job_id
      AND (
        action = 'invalid'
        OR jsonb_array_length(validation_errors) > 0
      )
  ) THEN
    RAISE EXCEPTION 'Import job still has invalid features';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.city_barangay_import_items
    WHERE job_id = p_job_id
      AND action = 'review_required'
  ) THEN
    RAISE EXCEPTION 'Import job still has unresolved duplicate decisions';
  END IF;

  FOR v_item IN
    SELECT *
    FROM public.city_barangay_import_items
    WHERE job_id = p_job_id
    ORDER BY feature_index
  LOOP
    IF v_item.action = 'skip' THEN
      UPDATE public.city_barangay_import_items
      SET processed_at = now()
      WHERE id = v_item.id;
      CONTINUE;
    END IF;

    IF v_item.action = 'overwrite' AND NOT v_item.selected_overwrite THEN
      RAISE EXCEPTION 'Overwrite action requires selected_overwrite=true';
    END IF;

    v_feature_props := COALESCE(v_item.source_payload->'properties', '{}'::jsonb);

    SELECT *
    INTO v_result
    FROM public.upsert_city_barangay(
      p_actor_id,
      COALESCE(v_item.name, v_feature_props->>'ADM4_EN', v_feature_props->>'name'),
      COALESCE(v_item.pcode, v_feature_props->>'ADM4_PCODE', v_feature_props->>'pcode'),
      v_feature_props->>'ADM3_EN',
      CASE
        WHEN v_item.action = 'overwrite' THEN 'Bulk GeoJSON overwrite'
        ELSE 'Bulk GeoJSON import'
      END,
      v_item.source_payload->'geometry',
      v_item.source_payload,
      NULLIF(v_feature_props->>'fid', '')::integer,
      NULLIF(v_feature_props->>'date', '')::date,
      NULLIF(v_feature_props->>'validOn', '')::date,
      NULLIF(v_feature_props->>'validTo', '')::date,
      NULLIF(v_feature_props->>'AREA_SQKM', '')::numeric,
      v_item.action = 'overwrite'
    );

    UPDATE public.city_barangay_import_items
    SET
      processed_at = now(),
      existing_city_barangay_id = COALESCE(existing_city_barangay_id, v_result.id)
    WHERE id = v_item.id;

    v_processed := v_processed + 1;
  END LOOP;

  UPDATE public.city_barangay_import_jobs
  SET
    status = 'committed',
    committed_at = now()
  WHERE id = p_job_id
  RETURNING *
  INTO v_job;

  RETURN jsonb_build_object(
    'job', to_jsonb(v_job),
    'processed_items', v_processed
  );
END;
$$;

DROP TRIGGER IF EXISTS set_city_barangays_updated_at ON public.city_barangays;
CREATE TRIGGER set_city_barangays_updated_at
  BEFORE UPDATE ON public.city_barangays
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_barangays_updated_at ON public.barangays;
CREATE TRIGGER set_barangays_updated_at
  BEFORE UPDATE ON public.barangays
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS sync_barangay_from_city_trigger ON public.barangays;
CREATE TRIGGER sync_barangay_from_city_trigger
  BEFORE INSERT OR UPDATE OF city_barangay_id, name, is_active
  ON public.barangays
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_barangay_from_city();

ALTER TABLE public.city_barangay_geometry_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_barangay_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_barangay_import_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY city_barangays_admin_insert
  ON public.city_barangays
  FOR INSERT
  WITH CHECK (public.current_app_role() = 'system_admin');

CREATE POLICY city_barangays_admin_update
  ON public.city_barangays
  FOR UPDATE
  USING (public.current_app_role() = 'system_admin')
  WITH CHECK (public.current_app_role() = 'system_admin');

CREATE POLICY barangays_manager_insert
  ON public.barangays
  FOR INSERT
  WITH CHECK (public.current_app_role() IN ('system_admin', 'city_health_officer'));

CREATE POLICY barangays_manager_update
  ON public.barangays
  FOR UPDATE
  USING (public.current_app_role() IN ('system_admin', 'city_health_officer'))
  WITH CHECK (public.current_app_role() IN ('system_admin', 'city_health_officer'));

CREATE POLICY city_barangay_geometry_versions_admin_read
  ON public.city_barangay_geometry_versions
  FOR SELECT
  USING (public.current_app_role() = 'system_admin');

CREATE POLICY city_barangay_import_jobs_admin_read
  ON public.city_barangay_import_jobs
  FOR SELECT
  USING (public.current_app_role() = 'system_admin');

CREATE POLICY city_barangay_import_jobs_admin_write
  ON public.city_barangay_import_jobs
  FOR ALL
  USING (public.current_app_role() = 'system_admin')
  WITH CHECK (public.current_app_role() = 'system_admin');

CREATE POLICY city_barangay_import_items_admin_read
  ON public.city_barangay_import_items
  FOR SELECT
  USING (public.current_app_role() = 'system_admin');

CREATE POLICY city_barangay_import_items_admin_write
  ON public.city_barangay_import_items
  FOR ALL
  USING (public.current_app_role() = 'system_admin')
  WITH CHECK (public.current_app_role() = 'system_admin');

CREATE OR REPLACE VIEW public.barangay_coverage_map_view AS
SELECT
  cb.id AS barangay_id,
  b.id AS coverage_barangay_id,
  cb.pcode AS barangay_code,
  COALESCE(b.name, cb.name) AS barangay_name,
  ST_AsGeoJSON(cb.geometry)::jsonb AS geometry,
  COALESCE(b.is_active, false) AS in_cho_scope
FROM public.city_barangays cb
LEFT JOIN public.barangays b
  ON b.city_barangay_id = cb.id;

GRANT SELECT ON public.barangay_coverage_map_view TO authenticated, anon, service_role;

GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.append_audit_log(uuid, text, text, uuid, jsonb, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_city_barangay_geometry_version(uuid, geometry, jsonb, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_city_barangay(uuid, text, text, text, text, jsonb, jsonb, integer, date, date, date, numeric, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_barangay_coverage_change(uuid, uuid, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.stage_city_barangay_import_job(uuid, text, jsonb, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.commit_city_barangay_import_job(uuid, uuid, jsonb) TO service_role;
