"use client"

import Link from "next/link"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Heart } from "lucide-react"

type TeamSwitcherProps = {
  homeHref?: string
}

export function TeamSwitcher({ homeHref = "/dashboard" }: TeamSwitcherProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href={homeHref}>
            {/* <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"> */}
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
              <Heart className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Project LINK</span>
              <span className="truncate text-xs">City Health Office II</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
