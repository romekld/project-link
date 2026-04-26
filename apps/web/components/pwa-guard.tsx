"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/features/auth/logout/actions"
import type { SupportedDashboardRole } from "@/features/navigation/data/types"

const FIELD_ROLES: SupportedDashboardRole[] = ["bhw", "rhm"]

export function PwaGuard({ role }: { role: SupportedDashboardRole }) {
  const [isStandalone] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(display-mode: standalone)").matches
      : false
  )
  const router = useRouter()

  if (!isStandalone || FIELD_ROLES.includes(role)) return null

  async function handleLogout() {
    await logoutAction()
    router.push("/login")
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background p-8 text-center">
      <div className="max-w-xs space-y-4">
        <h1 className="font-heading text-2xl font-semibold">Wrong App</h1>
        <p className="text-muted-foreground text-sm">
          This app is for field workers (BHW and RHM) only. Please open the
          full site in your browser.
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => window.open("/", "_blank")}>
            Open in Browser
          </Button>
          <Button variant="ghost" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>
    </div>
  )
}
