import { env } from '@/config/env'
import { supabase } from '@/lib/supabase'

export async function getSupabaseFunctionHeaders() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    await supabase.auth.signOut({ scope: 'local' })
    throw new Error('Unable to verify your session. Please sign in again.')
  }

  const nowUnix = Math.floor(Date.now() / 1000)
  const isTokenMissingOrExpiringSoon =
    !session?.access_token ||
    !session.expires_at ||
    session.expires_at <= nowUnix + 60

  let accessToken = session?.access_token
  if (isTokenMissingOrExpiringSoon && session?.refresh_token) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError || !refreshData.session?.access_token) {
      await supabase.auth.signOut({ scope: 'local' })
      throw new Error('Your session has expired. Please sign in again and retry.')
    }
    accessToken = refreshData.session.access_token
  }

  if (!accessToken) {
    await supabase.auth.signOut({ scope: 'local' })
    throw new Error('Your session has expired. Please sign in again and retry.')
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    apikey: env.supabaseAnonKey,
  }
}
