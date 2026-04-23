'use server'

import { createClient } from '@/lib/supabase/server'

type LogoutResult = { success: true } | { error: string }

export async function logoutAction() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message } satisfies LogoutResult
  }

  return { success: true } satisfies LogoutResult
}
