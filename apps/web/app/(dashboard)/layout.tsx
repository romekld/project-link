import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { MustChangePasswordDialog } from "@/features/auth/change-password"
import { DashboardShellFrame } from "@/features/navigation/components/dashboard-shell-frame"
import { PwaGuard } from "@/components/pwa-guard"
import { getDashboardViewer } from "@/features/navigation/queries/get-dashboard-viewer"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const viewer = await getDashboardViewer()

  if (!viewer) {
    redirect("/login")
  }

  if (viewer.role === "bhw") {
    redirect("/bhw/dashboard")
  }

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      {/* <AppSidebar variant="inset" viewer={viewer} /> */}
      <AppSidebar viewer={viewer} />

      <SidebarInset className="min-h-0 overflow-hidden">
        <DashboardShellFrame>{children}</DashboardShellFrame>
      </SidebarInset>
      <MustChangePasswordDialog initialOpen={viewer.mustChangePassword} />
      <PwaGuard role={viewer.role} />
    </SidebarProvider>
  )
}
