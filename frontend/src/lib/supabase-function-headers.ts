import { env } from '@/config/env'
import { supabase } from '@/lib/supabase'

export async function getSupabaseFunctionHeaders() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    await supabase.auth.signOut({ scope: 'local' })
    throw new Error('Unable to verify your session. Please sign in again.')
  }

  let activeSession = session

  const refreshAccessToken = async () => {
    if (!activeSession?.refresh_token) {
      return null
    }

    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError || !refreshData.session?.access_token) {
      return null
    }

    activeSession = refreshData.session
    return refreshData.session.access_token
  }

  const nowUnix = Math.floor(Date.now() / 1000)
  const shouldRefreshBeforeInvoke =
    !activeSession?.access_token ||
    !activeSession.expires_at ||
    activeSession.expires_at <= nowUnix + 60

  let accessToken = activeSession?.access_token ?? null
  if (shouldRefreshBeforeInvoke) {
    accessToken = await refreshAccessToken()
  }

  if (!accessToken) {
    await supabase.auth.signOut({ scope: 'local' })
    throw new Error('Your session has expired. Please sign in again and retry.')
  }

  // Verify token validity before invoking JWT-protected Edge Functions.
  const { error: userError } = await supabase.auth.getUser(accessToken)
  if (userError) {
    const refreshedAccessToken = await refreshAccessToken()
    if (!refreshedAccessToken) {
      await supabase.auth.signOut({ scope: 'local' })
      throw new Error('Your session has expired. Please sign in again and retry.')
    }

    const { error: refreshedUserError } = await supabase.auth.getUser(refreshedAccessToken)
    if (refreshedUserError) {
      await supabase.auth.signOut({ scope: 'local' })
      throw new Error('Your session has expired. Please sign in again and retry.')
    }

    accessToken = refreshedAccessToken
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    apikey: env.supabaseAnonKey,
  }
}
