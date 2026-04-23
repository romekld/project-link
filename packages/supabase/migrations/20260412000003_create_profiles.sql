-- Updated_at helper (reused by other tables later)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- User profiles (1-to-1 with auth.users)
CREATE TABLE public.profiles (
  id                      uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id                 text        UNIQUE NOT NULL,  -- USR-YYYY-####
  first_name              text        NOT NULL,
  middle_name             text,
  last_name               text        NOT NULL,
  name_suffix             text,
  username                text        UNIQUE NOT NULL,
  date_of_birth           date,
  sex                     char(1)     CHECK (sex IN ('M', 'F')),
  mobile_number           text,
  alternate_mobile_number text,
  address_line_1          text,
  address_line_2          text,
  city_municipality       text,
  province                text,
  role                    public.user_role   NOT NULL,
  health_station_id       uuid        REFERENCES public.health_stations(id) ON DELETE SET NULL,
  purok_assignment        text,
  coverage_notes          text,
  admin_notes             text,
  profile_photo_url       text,
  status                  public.user_status NOT NULL DEFAULT 'active',
  deactivation_reason     text,
  must_change_password    boolean     NOT NULL DEFAULT true,
  password_changed_at     timestamptz,
  last_login_at           timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
