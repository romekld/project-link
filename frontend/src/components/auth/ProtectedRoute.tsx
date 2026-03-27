import { useEffect, type ReactNode } from 'react'
import { useAuth } from '@/features/auth'

// Temporary auth gate — replaced by TanStack Router loader-based guards in Wave 3 (TG4).
// This only checks "is there a session?", not role. Role guards are TG4.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !session) {
      window.location.href = '/login'
    }
  }, [session, isLoading])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
