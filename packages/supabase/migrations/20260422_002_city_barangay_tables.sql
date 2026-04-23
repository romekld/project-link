-- ─── city_barangays ──────────────────────────────────────────────────────────
-- GIS reference layer: all PSGC-coded barangay polygons for Dasmarinas City.
-- This is a read-only catalog; operational activation lives in `barangays`.
CREATE TABLE IF NOT EXISTS public.city_barangays (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text        NOT NULL,
  pcode             text        UNIQUE NOT NULL,
  city              text        NOT NULL DEFAULT 'Dasmariñas',
  geometry          geometry(MultiPolygon, 4326) NOT NULL,
  source_fid        integer,
  source_date       date,
  source_valid_on   date,
  source_valid_to   date,
  source_area_sqkm  numeric(12, 6),
  source_payload    jsonb       NOT NULL DEFAULT '{}',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz,
  created_by        uuid        REFERENCES public.profiles(id),
  updated_by        uuid        REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS city_barangays_geometry_gix
  ON public.city_barangays USING gist(geometry);

CREATE INDEX IF NOT EXISTS city_barangays_pcode_idx
  ON public.city_barangays(pcode);

DROP TRIGGER IF EXISTS set_city_barangays_updated_at ON public.city_barangays;
CREATE TRIGGER set_city_barangays_updated_at
  BEFORE UPDATE ON public.city_barangays
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── barangays ───────────────────────────────────────────────────────────────
-- Operational layer: the CHO2 subset of city_barangays that are actively
-- managed. A city_barangay must be explicitly activated here to be in scope.
CREATE TABLE IF NOT EXISTS public.barangays (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  city_barangay_id    uuid        NOT NULL REFERENCES public.city_barangays(id) ON DELETE RESTRICT,
  name                text        NOT NULL,
  pcode               text        NOT NULL,
  is_active           boolean     NOT NULL DEFAULT true,
  activated_at        timestamptz NOT NULL DEFAULT now(),
  deactivated_at      timestamptz,
  last_change_reason  text        NOT NULL DEFAULT 'Initial import',
  last_changed_by     uuid        REFERENCES public.profiles(id),
  updated_at          timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS barangays_city_barangay_id_key
  ON public.barangays(city_barangay_id);

CREATE UNIQUE INDEX IF NOT EXISTS barangays_pcode_key
  ON public.barangays(pcode);

CREATE INDEX IF NOT EXISTS barangays_is_active_idx
  ON public.barangays(is_active);

DROP TRIGGER IF EXISTS set_barangays_updated_at ON public.barangays;
CREATE TRIGGER set_barangays_updated_at
  BEFORE UPDATE ON public.barangays
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Syncs pcode + name from city_barangays and clears deactivated_at on re-activate.
CREATE OR REPLACE FUNCTION public.sync_barangay_from_city()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_city_barangay public.city_barangays%ROWTYPE;
BEGIN
  SELECT * INTO v_city_barangay
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

DROP TRIGGER IF EXISTS sync_barangay_from_city_trigger ON public.barangays;
CREATE TRIGGER sync_barangay_from_city_trigger
  BEFORE INSERT OR UPDATE OF city_barangay_id, name, is_active
  ON public.barangays
  FOR EACH ROW EXECUTE FUNCTION public.sync_barangay_from_city();

-- ─── city_barangay_geometry_versions ─────────────────────────────────────────
-- Append-only audit history of geometry changes on city_barangays.
CREATE TABLE IF NOT EXISTS public.city_barangay_geometry_versions (
  id                  uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  city_barangay_id    uuid      NOT NULL REFERENCES public.city_barangays(id) ON DELETE CASCADE,
  version_no          integer   NOT NULL,
  geometry            geometry(MultiPolygon, 4326) NOT NULL,
  source_payload      jsonb     NOT NULL DEFAULT '{}',
  change_type         text      NOT NULL CHECK (change_type IN ('create', 'overwrite', 'manual_edit')),
  reason              text      NOT NULL,
  changed_by          uuid      REFERENCES public.profiles(id),
  changed_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city_barangay_id, version_no)
);

CREATE INDEX IF NOT EXISTS city_barangay_geometry_versions_barangay_idx
  ON public.city_barangay_geometry_versions(city_barangay_id, version_no DESC);

-- ─── city_barangay_import_jobs ───────────────────────────────────────────────
-- Tracks bulk GeoJSON import sessions (table exists for future pipeline wiring).
CREATE TABLE IF NOT EXISTS public.city_barangay_import_jobs (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by         uuid        NOT NULL REFERENCES public.profiles(id),
  filename            text        NOT NULL,
  status              text        NOT NULL DEFAULT 'uploaded'
                        CHECK (status IN ('uploaded', 'validated', 'committed', 'failed', 'cancelled')),
  total_features      integer     NOT NULL DEFAULT 0,
  valid_features      integer     NOT NULL DEFAULT 0,
  error_features      integer     NOT NULL DEFAULT 0,
  duplicate_features  integer     NOT NULL DEFAULT 0,
  payload_size_bytes  integer,
  source_payload      jsonb       NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  validated_at        timestamptz,
  committed_at        timestamptz
);

CREATE INDEX IF NOT EXISTS city_barangay_import_jobs_status_idx
  ON public.city_barangay_import_jobs(status, created_at DESC);

-- ─── city_barangay_import_items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.city_barangay_import_items (
  id                          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                      uuid      NOT NULL REFERENCES public.city_barangay_import_jobs(id) ON DELETE CASCADE,
  feature_index               integer   NOT NULL,
  pcode                       text,
  name                        text,
  action                      text      NOT NULL DEFAULT 'invalid'
                                CHECK (action IN ('create', 'skip', 'overwrite', 'invalid', 'review_required')),
  validation_errors           jsonb     NOT NULL DEFAULT '[]',
  normalized_geometry         geometry(MultiPolygon, 4326),
  source_payload              jsonb     NOT NULL DEFAULT '{}',
  selected_overwrite          boolean   NOT NULL DEFAULT false,
  existing_city_barangay_id   uuid      REFERENCES public.city_barangays(id),
  processed_at                timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, feature_index)
);

CREATE INDEX IF NOT EXISTS city_barangay_import_items_job_idx
  ON public.city_barangay_import_items(job_id, feature_index);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.city_barangays               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangays                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_barangay_geometry_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_barangay_import_jobs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_barangay_import_items   ENABLE ROW LEVEL SECURITY;
