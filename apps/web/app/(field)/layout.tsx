import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getDashboardViewer } from "@/features/navigation/queries/get-dashboard-viewer"
import { getRoleHome } from "@/features/navigation/data/role-policy"
import { PwaInstallBanner } from "@/components/pwa-install-banner"

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Project LINK",
  },
}

export default async function FieldLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const viewer = await getDashboardViewer()

  if (!viewer) {
    redirect("/login")
  }

  if (viewer.role !== "bhw") {
    redirect(getRoleHome(viewer.role) ?? "/login")
  }

  return (
    <>
      {children}
      <PwaInstallBanner />
    </>
  )
}
