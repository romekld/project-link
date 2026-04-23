-- Test users for development and QA
-- Password: TestPassword123!

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- City Health Officer
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'cho@test.com',
    extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
    now(),
    now(),
    now()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO user_id;

  IF user_id IS NULL THEN
    SELECT id INTO user_id FROM auth.users WHERE email = 'cho@test.com';
  END IF;

  -- Create profile (or no-op if already present)
  INSERT INTO user_profiles (
    id,
    full_name,
    username,
    date_of_birth,
    sex,
    role,
    is_active
  ) VALUES (
    user_id,
    'City Health Officer',
    'cho_admin',
    '1980-01-01'::date,
    'M',
    'city_health_officer',
    true
  )
  ON CONFLICT DO NOTHING;
END $$;

-- PHN (Public Health Nurse)
DO $$
DECLARE
  user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'phn@test.com',
    extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
    now(),
    now(),
    now()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO user_id;

  IF user_id IS NULL THEN
    SELECT id INTO user_id FROM auth.users WHERE email = 'phn@test.com';
  END IF;

  INSERT INTO user_profiles (
    id,
    full_name,
    username,
    date_of_birth,
    sex,
    role,
    is_active
  ) VALUES (
    user_id,
    'Public Health Nurse',
    'phn_nurse',
    '1985-05-15'::date,
    'F',
    'nurse_phn',
    true
  )
  ON CONFLICT DO NOTHING;
END $$;

-- Midwife
DO $$
DECLARE
  user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'midwife@test.com',
    extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
    now(),
    now(),
    now()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO user_id;

  IF user_id IS NULL THEN
    SELECT id INTO user_id FROM auth.users WHERE email = 'midwife@test.com';
  END IF;

  INSERT INTO user_profiles (
    id,
    full_name,
    username,
    date_of_birth,
    sex,
    role,
    is_active
  ) VALUES (
    user_id,
    'Midwife',
    'midwife_rhm',
    '1988-03-20'::date,
    'F',
    'midwife_rhm',
    true
  )
  ON CONFLICT DO NOTHING;
END $$;
