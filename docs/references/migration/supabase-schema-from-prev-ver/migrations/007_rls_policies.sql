-- RLS for reference tables (public read)
ALTER TABLE city_barangays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON city_barangays FOR SELECT USING (true);

ALTER TABLE barangays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON barangays FOR SELECT USING (true);

ALTER TABLE health_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON health_stations FOR SELECT USING (true);

-- RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "self_read" ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "admin_read_all" ON user_profiles FOR SELECT
  USING ((auth.jwt()->'app_metadata'->>'role') = 'system_admin');

CREATE POLICY "admin_update" ON user_profiles FOR UPDATE
  USING ((auth.jwt()->'app_metadata'->>'role') = 'system_admin');

CREATE POLICY "self_update" ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS for audit_logs (INSERT only)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert_only" ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
