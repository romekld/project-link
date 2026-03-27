import { useNavigate } from '@tanstack/react-router'
import { ChevronsUpDown, LogOut, Settings, UserRound } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function NavUser() {
  const { session, signOut } = useAuth()
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  const email = session?.user?.email ?? ''
  const role = session?.user?.app_metadata?.role as string | undefined

  const handleLogout = async () => {
    await signOut()
    navigate({ to: '/login', replace: true })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium shrink-0">
              {email.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col leading-tight truncate">
              <span className="text-sm font-medium truncate">{email}</span>
              {role && (
                <span className="text-xs text-muted-foreground capitalize">
                  {role.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-auto size-4 shrink-0" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-52 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                {email}
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserRound className="mr-2 size-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
