-- Add username column to user_profiles for username-based login lookup.
-- Also adds pcode column to barangays for barangay reference seed (Unit B.1).

-- user_profiles: username slug (e.g. s.redona_kld, format: initial.surname_stationcode)
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS user_profiles_username_idx
  ON public.user_profiles (username);

-- Allow anon role to look up email by username (pre-auth use only).
-- Scope: username lookup only — no other columns exposed to anon.
-- username IS NOT NULL guard ensures NULL usernames never match.
CREATE POLICY "anon_username_email_lookup"
  ON public.user_profiles
  FOR SELECT
  TO anon
  USING (username IS NOT NULL);

-- user_profiles: email column for username→email pre-auth lookup.
-- Denormalized from auth.users; required so anon can resolve username → email
-- without direct access to auth.users. Populated by admin at user creation time.
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- barangays: pcode column for Philippine Standard Geographic Code (PSGc)
-- Required by barangay reference seed (supabase/seed/seed_barangays.sql).
ALTER TABLE public.barangays
  ADD COLUMN IF NOT EXISTS pcode TEXT;

ALTER TABLE public.barangays
  ADD CONSTRAINT IF NOT EXISTS barangays_pcode_unique UNIQUE (pcode);
