import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { AppBranding } from './app-branding'
import { NavMain } from './nav-main'
import { NavQuickLinks } from './nav-quick-links'
import { NavUser } from './nav-user'
import { NAV_CONFIG, QUICK_LINKS_CONFIG } from './nav-config'

export function AppSidebar() {
  const { role } = useAuth()

  const navItems = role ? (NAV_CONFIG[role] ?? []) : []
  const quickLinks = role ? (QUICK_LINKS_CONFIG[role] ?? []) : []

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <AppBranding />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
        <NavQuickLinks links={quickLinks} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
