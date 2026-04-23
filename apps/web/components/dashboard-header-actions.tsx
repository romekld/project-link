"use client"

import { Config } from "@/components/config-drawer"
import { HeaderProfileMenu } from "@/components/header-profile-menu"
import { ThemeSwitch } from "@/components/theme-switch"

export function DashboardHeaderActions() {
  return (
    <div className="flex items-center gap-4">
      <ThemeSwitch />
      <Config />
      <HeaderProfileMenu />
    </div>
  )
}
