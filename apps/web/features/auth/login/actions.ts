'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getRoleHome } from '@/features/navigation/data/role-policy'

export type LoginState =
  | { error: string }
  | null

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { error: 'Invalid email or password.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Could not retrieve session. Please try again.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, must_change_password')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Account profile not found. Contact your administrator.' }
  }

  const roleHome = getRoleHome(profile.role)

  if (!roleHome) {
    await supabase.auth.signOut()
    return { error: 'This role is not enabled for the dashboard yet.' }
  }

  const admin = createAdminClient()
  await admin
    .from('profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id)

  redirect(roleHome)
}
