import { useAuthContext, type AuthContextValue } from '../context/AuthContext'

export function useAuth(): AuthContextValue {
  return useAuthContext()
}
