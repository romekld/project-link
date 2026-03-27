import { Outlet } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Moon, Sun } from 'lucide-react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { AppSidebar } from './app-sidebar'
import { useTheme } from '@/contexts/theme-context'
import { usePageMeta } from '@/contexts/page-context'

export function AppShell() {
  const { theme, toggle } = useTheme()
  const { breadcrumbs } = usePageMeta()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />

          {breadcrumbs.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, i) => (
                    <BreadcrumbItem key={crumb.label}>
                      {i < breadcrumbs.length - 1 ? (
                        <>
                          {crumb.href ? (
                            <BreadcrumbLink render={<Link to={crumb.href} />}>
                              {crumb.label}
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbLink>{crumb.label}</BreadcrumbLink>
                          )}
                          <BreadcrumbSeparator />
                        </>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </>
          )}

          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="h-8 w-8"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
