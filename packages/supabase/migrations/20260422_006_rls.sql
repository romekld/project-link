-- ─── city_barangays ──────────────────────────────────────────────────────────
CREATE POLICY "city_barangays_public_read"
  ON public.city_barangays FOR SELECT
  USING (true);

CREATE POLICY "city_barangays_admin_insert"
  ON public.city_barangays FOR INSERT
  WITH CHECK (public.get_my_role() = 'system_admin');

CREATE POLICY "city_barangays_admin_update"
  ON public.city_barangays FOR UPDATE
  USING  (public.get_my_role() = 'system_admin')
  WITH CHECK (public.get_my_role() = 'system_admin');

-- ─── barangays ───────────────────────────────────────────────────────────────
CREATE POLICY "barangays_public_read"
  ON public.barangays FOR SELECT
  USING (true);

CREATE POLICY "barangays_manager_insert"
  ON public.barangays FOR INSERT
  WITH CHECK (public.get_my_role() IN ('system_admin', 'cho'));

CREATE POLICY "barangays_manager_update"
  ON public.barangays FOR UPDATE
  USING  (public.get_my_role() IN ('system_admin', 'cho'))
  WITH CHECK (public.get_my_role() IN ('system_admin', 'cho'));

-- ─── city_barangay_geometry_versions ─────────────────────────────────────────
CREATE POLICY "geometry_versions_admin_read"
  ON public.city_barangay_geometry_versions FOR SELECT
  USING (public.get_my_role() = 'system_admin');

CREATE POLICY "geometry_versions_admin_insert"
  ON public.city_barangay_geometry_versions FOR INSERT
  WITH CHECK (public.get_my_role() = 'system_admin');

-- ─── city_barangay_import_jobs ───────────────────────────────────────────────
CREATE POLICY "import_jobs_admin_all"
  ON public.city_barangay_import_jobs FOR ALL
  USING  (public.get_my_role() = 'system_admin')
  WITH CHECK (public.get_my_role() = 'system_admin');

-- ─── city_barangay_import_items ──────────────────────────────────────────────
CREATE POLICY "import_items_admin_all"
  ON public.city_barangay_import_items FOR ALL
  USING  (public.get_my_role() = 'system_admin')
  WITH CHECK (public.get_my_role() = 'system_admin');

-- ─── health_stations (add write policies; read policy already exists) ─────────
CREATE POLICY "stations_manager_insert"
  ON public.health_stations FOR INSERT
  WITH CHECK (public.get_my_role() IN ('system_admin', 'cho'));

CREATE POLICY "stations_manager_update"
  ON public.health_stations FOR UPDATE
  USING  (public.get_my_role() IN ('system_admin', 'cho'))
  WITH CHECK (public.get_my_role() IN ('system_admin', 'cho'));

-- ─── health_station_coverage ─────────────────────────────────────────────────
CREATE POLICY "coverage_public_read"
  ON public.health_station_coverage FOR SELECT
  USING (true);

CREATE POLICY "coverage_manager_insert"
  ON public.health_station_coverage FOR INSERT
  WITH CHECK (public.get_my_role() IN ('system_admin', 'cho'));

CREATE POLICY "coverage_manager_update"
  ON public.health_station_coverage FOR UPDATE
  USING  (public.get_my_role() IN ('system_admin', 'cho'))
  WITH CHECK (public.get_my_role() IN ('system_admin', 'cho'));
