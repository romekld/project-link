import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/types'
import { ChangePasswordDialog } from './change-password-dialog'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  role: UserRole | null
  healthStationId: string | null
  mustChangePassword: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  // Tracks if user has dismissed the change-password dialog this session
  const [passwordDialogDismissed, setPasswordDialogDismissed] = useState(false)

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
      // Reset dismissed flag on every new session (new login)
      setPasswordDialogDismissed(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const role = (session?.user?.app_metadata?.role as UserRole) ?? null
  const healthStationId = (session?.user?.app_metadata?.health_station_id as string) ?? null
  const mustChangePassword = session?.user?.app_metadata?.must_change_password === true

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const showPasswordDialog = session !== null && mustChangePassword && !passwordDialogDismissed

  return (
    <AuthContext.Provider value={{ session, loading, role, healthStationId, mustChangePassword, signOut }}>
      {children}
      {showPasswordDialog && (
        <ChangePasswordDialog
          open={showPasswordDialog}
          onDismiss={() => setPasswordDialogDismissed(true)}
        />
      )}
    </AuthContext.Provider>
  )
}
