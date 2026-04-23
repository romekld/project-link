"use client"

import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import type { SidebarSection } from "../data/types"
import { SidebarNavItem } from "./sidebar-nav-item"

type SidebarNavProps = {
  sections: SidebarSection[]
}

export function SidebarNav({ sections }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <>
      {sections.map((section) => (
        <SidebarGroup key={section.id}>
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {section.items.map((item) => (
              <SidebarNavItem key={item.id} item={item} pathname={pathname} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
