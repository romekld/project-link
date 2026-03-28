-- Fix 401 Unauthorized from PostgREST by preserving JWT reserved `role` claim.
-- PostgREST expects `role` to be `authenticated`/`anon`, not app roles like `system_admin`.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims jsonb;
  profile_role text;
  profile_health_station_id uuid;
  profile_must_change_password boolean;
BEGIN
  claims := COALESCE(event->'claims', '{}'::jsonb);

  SELECT role, health_station_id, must_change_password
  INTO profile_role, profile_health_station_id, profile_must_change_password
  FROM public.user_profiles
  WHERE id = (event->>'user_id')::uuid;

  IF FOUND THEN
    -- Keep app role in a custom claim; do NOT overwrite reserved `role`.
    claims := claims || jsonb_build_object(
      'app_role', profile_role,
      'health_station_id', profile_health_station_id,
      'must_change_password', profile_must_change_password
    );
  END IF;

  event := jsonb_set(event, '{claims}', claims, true);
  RETURN event;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block sign-in if enrichment fails.
    RETURN event;
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
GRANT SELECT ON TABLE public.user_profiles TO supabase_auth_admin;
