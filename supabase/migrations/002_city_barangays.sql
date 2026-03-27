CREATE TABLE city_barangays (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  pcode      TEXT UNIQUE NOT NULL,
  city       TEXT NOT NULL DEFAULT 'Dasmariñas',
  geometry   GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT now()
);
