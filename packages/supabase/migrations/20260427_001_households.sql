-- 20260427_001_households.sql

-- Enums
CREATE TYPE public.nhts_status AS ENUM ('NHTS-4Ps', 'Non-NHTS');

CREATE TYPE public.hh_sync_status AS ENUM (
  'draft', 'pending_sync', 'pending_validation', 'returned', 'validated'
);

CREATE TYPE public.relationship_to_hh_head AS ENUM (
  '1-Head', '2-Spouse', '3-Son', '4-Daughter', '5-Others'
);

CREATE TYPE public.classification_code AS ENUM (
  'N', 'I', 'U', 'S', 'A', 'P', 'AP', 'PP', 'WRA', 'SC', 'PWD', 'AB'
);

CREATE TYPE public.philhealth_category AS ENUM (
  'Formal Economy', 'Informal Economy', 'Indigent/Sponsored',
  'Senior Citizen', 'Other'
);

-- households table
CREATE TABLE public.households (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id                    text UNIQUE,
  household_number            text,
  health_station_id           uuid REFERENCES public.health_stations(id),
  assigned_bhw_id             uuid REFERENCES public.profiles(id),
  respondent_last_name        text NOT NULL,
  respondent_first_name       text NOT NULL,
  respondent_middle_name      text,
  nhts_status                 public.nhts_status NOT NULL DEFAULT 'Non-NHTS',
  is_indigenous_people        boolean NOT NULL DEFAULT false,
  hh_head_philhealth_member   boolean NOT NULL DEFAULT false,
  hh_head_philhealth_id       text,
  hh_head_philhealth_category public.philhealth_category,
  house_no_street             text,
  purok                       text,
  barangay_id                 uuid REFERENCES public.city_barangays(id),
  latitude                    numeric(10, 7),
  longitude                   numeric(10, 7),
  visit_date_q1               date,
  visit_date_q2               date,
  visit_date_q3               date,
  visit_date_q4               date,
  year                        smallint NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  sync_status                 public.hh_sync_status NOT NULL DEFAULT 'draft',
  returned_reason             text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- household_members table
CREATE TABLE public.household_members (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id                    text UNIQUE,
  household_id                uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  member_last_name            text NOT NULL,
  member_first_name           text NOT NULL,
  member_middle_name          text,
  member_mothers_maiden_name  text,
  relationship_to_hh_head     public.relationship_to_hh_head NOT NULL,
  sex                         text CHECK (sex IN ('M', 'F')) NOT NULL,
  date_of_birth               date NOT NULL,
  dob_estimated               boolean NOT NULL DEFAULT false,
  classification_q1           public.classification_code,
  classification_q2           public.classification_code,
  classification_q3           public.classification_code,
  classification_q4           public.classification_code,
  member_philhealth_id        text,
  member_remarks              text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- updated_at triggers (reuse existing set_updated_at function)
CREATE TRIGGER set_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_household_members_updated_at
  BEFORE UPDATE ON public.household_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-generate household_number: {station_code}-{YYYY}-{####}
CREATE SEQUENCE public.household_number_seq;

CREATE OR REPLACE FUNCTION public.generate_household_number()
RETURNS TRIGGER AS $$
DECLARE
  v_station_code text;
  v_seq int;
BEGIN
  SELECT station_code INTO v_station_code
    FROM public.health_stations WHERE id = NEW.health_station_id;
  v_seq := nextval('public.household_number_seq');
  NEW.household_number := v_station_code || '-' || EXTRACT(YEAR FROM now()) || '-' || lpad(v_seq::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_household_number_trigger
  BEFORE INSERT ON public.households
  FOR EACH ROW
  WHEN (NEW.household_number IS NULL)
  EXECUTE FUNCTION public.generate_household_number();

-- RLS
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- BHW: full access to own records
CREATE POLICY "bhw_own_households" ON public.households
  FOR ALL USING (assigned_bhw_id = auth.uid());

-- BHW: access members of own households
CREATE POLICY "bhw_own_household_members" ON public.household_members
  FOR ALL USING (
    household_id IN (
      SELECT id FROM public.households WHERE assigned_bhw_id = auth.uid()
    )
  );

-- Midwife/PHN/admin: read all in their health station
CREATE POLICY "station_staff_read_households" ON public.households
  FOR SELECT USING (
    health_station_id IN (
      SELECT health_station_id FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('rhm', 'phn', 'phis', 'cho', 'system_admin')
    )
  );

CREATE POLICY "station_staff_read_members" ON public.household_members
  FOR SELECT USING (
    household_id IN (
      SELECT h.id FROM public.households h
      JOIN public.profiles p ON p.health_station_id = h.health_station_id
      WHERE p.id = auth.uid()
        AND p.role IN ('rhm', 'phn', 'phis', 'cho', 'system_admin')
    )
  );
