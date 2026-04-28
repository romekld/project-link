"use client"

import { usePathname } from "next/navigation"

import { DashboardHeader } from "@/components/dashboard-header"
import { cn } from "@/lib/utils"

import { getDashboardShellPolicy } from "../utils/get-dashboard-shell-policy"

type DashboardShellFrameProps = {
  children: React.ReactNode
}

export function DashboardShellFrame({ children }: DashboardShellFrameProps) {
  const pathname = usePathname()
  const policy = getDashboardShellPolicy(pathname)

  return (
    <>
      {policy.hideHeader ? null : <DashboardHeader />}
      <main
        data-dashboard-scroll
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto",
          policy.removeMainPadding ? undefined : "p-4 md:p-6"
        )}
      >
        {children}
      </main>
    </>
  )
}
