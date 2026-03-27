CREATE OR REPLACE FUNCTION sync_role_to_jwt()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data ||
    jsonb_build_object(
      'role', NEW.role,
      'health_station_id', NEW.health_station_id,
      'must_change_password', NEW.must_change_password
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_profile_change
  AFTER INSERT OR UPDATE OF role, health_station_id, must_change_password
  ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION sync_role_to_jwt();
