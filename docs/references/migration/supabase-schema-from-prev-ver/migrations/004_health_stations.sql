CREATE TABLE health_stations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barangay_id  UUID REFERENCES barangays(id),
  name         TEXT NOT NULL,
  address      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);
