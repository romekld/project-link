-- Health stations stub (full management wired later)
CREATE TABLE public.health_stations (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  slug          text        UNIQUE NOT NULL,
  facility_type text        NOT NULL DEFAULT 'BHS',
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Seed the 5 known stations
INSERT INTO public.health_stations (name, slug) VALUES
  ('BHS Paliparan III', 'bhs-paliparan-iii'),
  ('BHS Salawag',       'bhs-salawag'),
  ('BHS Sampaloc I',    'bhs-sampaloc-i'),
  ('BHS San Dionisio',  'bhs-san-dionisio'),
  ('BHS Burol Main',    'bhs-burol-main');
