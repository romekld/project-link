import { useContext } from 'react'
import { AuthContext } from '@/features/auth/components/auth-provider'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
