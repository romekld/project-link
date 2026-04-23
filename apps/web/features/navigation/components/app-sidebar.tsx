"use client"

import type React from "react"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { getSidebarSections } from "@/app/(dashboard)/_navigation/sidebar-registry"
import { getRoleHome } from "../data/role-policy"
import type { DashboardViewer } from "../data/types"
import { SidebarNav } from "./sidebar-nav"
import { SidebarUserMenu } from "./sidebar-user-menu"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  viewer: DashboardViewer
}

export function AppSidebar({ viewer, ...props }: AppSidebarProps) {
  const sections = getSidebarSections(viewer)
  const homeHref = getRoleHome(viewer.role) ?? "/dashboard"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher homeHref={homeHref} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav sections={sections} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserMenu viewer={viewer} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
