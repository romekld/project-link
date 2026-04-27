"use client"

import { useState } from "react"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { makeQueryClient, idbPersister } from "@/lib/query-client"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: idbPersister }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
