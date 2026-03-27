import { LoginPage } from '@/pages/auth/login'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Providers } from '@/app/providers'

// Minimal pre-router App.tsx: renders LoginPage at /login or /, otherwise
// shows the authenticated placeholder wrapped in ProtectedRoute.
// TanStack Router (Wave 3 — TG4) replaces this file entirely.
export default function App() {
  const path = window.location.pathname
  const isLoginPage = path === '/login' || path === '/'

  return (
    <Providers>
      {isLoginPage ? (
        <LoginPage />
      ) : (
        <ProtectedRoute>
          <div className="flex h-screen items-center justify-center bg-background">
            <p className="text-sm text-muted-foreground">
              Project LINK — Phase 1 Infrastructure (authenticated)
            </p>
          </div>
        </ProtectedRoute>
      )}
    </Providers>
  )
}
