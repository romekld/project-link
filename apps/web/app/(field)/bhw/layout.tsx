"use client"

import { usePathname } from "next/navigation"
import { BhwBottomNav } from "@/components/bhw-bottom-nav"

export default function BhwLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isWizard = pathname.startsWith("/bhw/households/new")

  if (isWizard) {
    return (
      <div className="pt-3 px-3">{children}</div>
    )
  }

  return (
    <>
      <div className="pb-24 md:pb-0 pt-3 px-3">{children}</div>
      <BhwBottomNav />
    </>
  )
}
