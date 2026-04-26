import type { Metadata } from "next"
import { PwaInstallBanner } from "@/components/pwa-install-banner"

export const metadata: Metadata = {
  manifest: "/rhm-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Project LINK RHM",
  },
}

export default function RhmLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PwaInstallBanner />
    </>
  )
}
