import { useNetworkStatus } from '@/hooks'
import { Badge } from '@/components/ui/badge'

// Top navigation bar — breadcrumbs, user menu, and online/offline indicator.
// Wave 4 (TG5) replaces this with the full sidebar-07 Topbar (SidebarTrigger + NavUser).
export function Topbar() {
  const isOnline = useNetworkStatus()

  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b bg-background px-4">
      <Badge
        variant={isOnline ? 'secondary' : 'destructive'}
        className="text-xs"
      >
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
    </header>
  )
}
