import type { ReactNode } from 'react'
import { AuthProvider } from '@/features/auth'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
  // Wave 3: wrap with QueryClientProvider (TanStack Query)
  // Wave 3: wrap with RouterProvider (TanStack Router)
}
