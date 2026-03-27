import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'

export function AppBranding() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent active:bg-transparent">
          <div className="flex items-center gap-2">
            {/* Logo placeholder */}
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
              L
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-heading text-sm font-semibold">LINK</span>
              <span className="text-xs text-muted-foreground">CHO II Dasmariñas</span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
