CREATE TABLE barangays (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_barangay_id UUID REFERENCES city_barangays(id),
  name             TEXT NOT NULL,
  pcode            TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);
