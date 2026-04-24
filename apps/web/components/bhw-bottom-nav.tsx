"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, CloudUpload, House, UserCircle2 } from "lucide-react"
import { motion, LayoutGroup } from "framer-motion"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Home", href: "/bhw/dashboard", icon: House, match: ["/bhw/dashboard"] },
  { label: "Households", href: "/bhw/households", icon: Building2, match: ["/bhw/households"] },
  { label: "Sync", href: "/bhw/sync", icon: CloudUpload, match: ["/bhw/sync"] },
  { label: "Profile", href: "/bhw/profile", icon: UserCircle2, match: ["/bhw/profile"] },
]

export function BhwBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="BHW navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t bg-background md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <LayoutGroup id="bhw-bottom-nav">
        {tabs.map(({ label, href, icon: Icon, match }) => {
          const isActive = match.some((m) => pathname === m || pathname.startsWith(m + "/"))
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="bhw-bottom-nav-pill"
                  className="absolute inset-x-1 inset-y-1 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Icon
                className={cn("relative z-10 size-5", isActive && "stroke-[2.5]")}
                aria-hidden="true"
              />
              <span className="relative z-10">{label}</span>
            </Link>
          )
        })}
      </LayoutGroup>
    </nav>
  )
}
