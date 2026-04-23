-- Rebuild test auth users with the same column shape as working seed inserts.
-- Password for all users: TestPassword123!

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Remove possibly malformed test users created by earlier migration.
DELETE FROM auth.users
WHERE email IN ('cho@test.com', 'phn@test.com', 'midwife@test.com');

-- City Health Officer
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000101',
  'authenticated',
  'authenticated',
  'cho@test.com',
  extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"role": "city_health_officer", "must_change_password": false}'::jsonb,
  '{"full_name": "City Health Officer"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
);

INSERT INTO public.user_profiles (
  id,
  full_name,
  username,
  date_of_birth,
  sex,
  role,
  is_active,
  must_change_password
) VALUES (
  '00000000-0000-0000-0000-000000000101',
  'City Health Officer',
  'cho_admin',
  '1980-01-01',
  'M',
  'city_health_officer',
  true,
  false
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  date_of_birth = EXCLUDED.date_of_birth,
  sex = EXCLUDED.sex,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  must_change_password = EXCLUDED.must_change_password;

-- Public Health Nurse
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000102',
  'authenticated',
  'authenticated',
  'phn@test.com',
  extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"role": "nurse_phn", "must_change_password": false}'::jsonb,
  '{"full_name": "Public Health Nurse"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
);

INSERT INTO public.user_profiles (
  id,
  full_name,
  username,
  date_of_birth,
  sex,
  role,
  is_active,
  must_change_password
) VALUES (
  '00000000-0000-0000-0000-000000000102',
  'Public Health Nurse',
  'phn_nurse',
  '1985-05-15',
  'F',
  'nurse_phn',
  true,
  false
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  date_of_birth = EXCLUDED.date_of_birth,
  sex = EXCLUDED.sex,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  must_change_password = EXCLUDED.must_change_password;

-- Midwife
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000103',
  'authenticated',
  'authenticated',
  'midwife@test.com',
  extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"role": "midwife_rhm", "must_change_password": false}'::jsonb,
  '{"full_name": "Midwife"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
);

INSERT INTO public.user_profiles (
  id,
  full_name,
  username,
  date_of_birth,
  sex,
  role,
  is_active,
  must_change_password
) VALUES (
  '00000000-0000-0000-0000-000000000103',
  'Midwife',
  'midwife_rhm',
  '1988-03-20',
  'F',
  'midwife_rhm',
  true,
  false
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  date_of_birth = EXCLUDED.date_of_birth,
  sex = EXCLUDED.sex,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  must_change_password = EXCLUDED.must_change_password;
