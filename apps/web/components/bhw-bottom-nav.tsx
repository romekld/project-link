"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, CloudUpload, House } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Home", href: "/bhw/dashboard", icon: House, match: ["/bhw/dashboard"] },
  { label: "Households", href: "/bhw/households", icon: Building2, match: ["/bhw/households"] },
  { label: "Sync", href: "/bhw/sync", icon: CloudUpload, match: ["/bhw/sync"] },
]

export function BhwBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="BHW navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t bg-background md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ label, href, icon: Icon, match }) => {
        const isActive = match.some((m) => pathname === m || pathname.startsWith(m + "/"))
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon
              className={cn("size-5", isActive && "stroke-[2.5]")}
              aria-hidden="true"
            />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
