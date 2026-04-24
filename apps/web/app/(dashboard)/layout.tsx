import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { MustChangePasswordDialog } from "@/features/auth/change-password"
import { getDashboardViewer } from "@/features/navigation/queries/get-dashboard-viewer"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const viewer = await getDashboardViewer()

  if (!viewer) {
    redirect("/login")
  }

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      {/* <AppSidebar variant="inset" viewer={viewer} /> */}
      <AppSidebar viewer={viewer} />

      <SidebarInset className="min-h-0 overflow-hidden">
        <DashboardHeader hideMobileSidebarTrigger={viewer.role === "bhw"} />
        <main
          data-dashboard-scroll
          // className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 pb-0 md:p-6 md:pb-0"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 md:p-6"
        >
          {children}
        </main>
      </SidebarInset>
      <MustChangePasswordDialog initialOpen={viewer.mustChangePassword} />
    </SidebarProvider>
  )
}
