import { Link } from '@tanstack/react-router'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import type { QuickLink } from './nav-config'

interface NavQuickLinksProps {
  links: QuickLink[]
}

export function NavQuickLinks({ links }: NavQuickLinksProps) {
  const { state } = useSidebar()

  // Hidden when collapsed to icons
  if (state === 'collapsed') return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
      <SidebarMenu>
        {links.map((link) => (
          <SidebarMenuItem key={link.title}>
            <SidebarMenuButton render={<Link to={link.url} />}>
              <link.icon />
              <span>{link.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
