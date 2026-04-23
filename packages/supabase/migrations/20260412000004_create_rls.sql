-- ─── profiles RLS ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_stations ENABLE ROW LEVEL SECURITY;

-- Security-definer helper: avoids recursive RLS when reading own role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- system_admin: full access to all rows
CREATE POLICY "profiles_admin_all"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING      (public.get_my_role() = 'system_admin')
  WITH CHECK (public.get_my_role() = 'system_admin');

-- cho: read the entire list, no writes
CREATE POLICY "profiles_cho_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'cho');

-- everyone else: read own row only
CREATE POLICY "profiles_own_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    AND public.get_my_role() NOT IN ('system_admin', 'cho')
  );

-- ─── health_stations RLS ──────────────────────────────────────────────────────
-- All authenticated users can read stations (needed for form dropdowns)
CREATE POLICY "stations_authenticated_select"
  ON public.health_stations
  FOR SELECT
  TO authenticated
  USING (true);
