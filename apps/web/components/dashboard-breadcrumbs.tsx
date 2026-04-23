"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const labelMap: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  users: "Users",
  new: "Add User",
  edit: "Manage User",
  bhw: "BHW",
  phn: "PHN",
  rhm: "RHM",
  phis: "PHIS",
  cho: "CHO",
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname()
  const parts = pathname.split("/").filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {parts.flatMap((part, index) => {
          const href = `/${parts.slice(0, index + 1).join("/")}`
          const label = labelMap[part] ?? part
          const isLast = index === parts.length - 1

          if (isLast) {
            return [
              <BreadcrumbItem key={href}>
                <BreadcrumbPage>{label}</BreadcrumbPage>
              </BreadcrumbItem>
            ]
          }

          return [
            <BreadcrumbItem key={href}>
              <BreadcrumbLink asChild>
                <Link href={href}>{label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>,
            <BreadcrumbSeparator key={`${href}-separator`} />,
          ]
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
