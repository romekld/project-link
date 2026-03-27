import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/dexie'
import type { UserRole } from '@/types'

export interface AuthContextValue {
  session: Session | null
  user: User | null
  role: UserRole | null
  healthStationId: string | null
  isLoading: boolean
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hydrate from existing session on mount, then subscribe for changes.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setIsLoading(false)

      if (newSession) {
        // Mirror session to Dexie kvStore for future service worker access (Phase 2).
        // Fire-and-forget — non-critical for Phase 1.
        const claims = newSession.user.app_metadata ?? {}
        if (!claims.role) {
          console.warn('[useAuth] JWT missing role claim — check Auth hook registration in Supabase Dashboard')
        }
        db.kvStore.put({
          key: 'auth_session',
          value: JSON.stringify({
            user_id: newSession.user.id,
            role: claims.role ?? null,
            health_station_id: claims.health_station_id ?? null,
            expires_at: newSession.expires_at,
          }),
        }).catch(() => { /* non-critical */ })
      } else {
        db.kvStore.delete('auth_session').catch(() => { /* non-critical */ })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(identifier: string, password: string): Promise<{ error: string | null }> {
    let email = identifier

    if (!identifier.includes('@')) {
      // Username login: resolve username → email via user_profiles before signInWithPassword.
      // The anon_username_email_lookup RLS policy allows this SELECT for the anon role.
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('username', identifier)
        .single()

      if (error || !data?.email) {
        // Do not distinguish "user not found" from "wrong password" — security best practice.
        return { error: 'Incorrect email/username or password.' }
      }
      email = data.email as string
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message?.toLowerCase().includes('network') || error.status === 0) {
        return { error: 'Unable to connect. Check your internet connection.' }
      }
      return { error: 'Incorrect email/username or password.' }
    }

    return { error: null }
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut()
  }

  const claims = session?.user.app_metadata ?? {}
  const role = (claims.role as UserRole) ?? null
  const healthStationId = (claims.health_station_id as string) ?? null

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      role,
      healthStationId,
      isLoading,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
