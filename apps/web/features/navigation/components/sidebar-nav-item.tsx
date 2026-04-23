"use client"

import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { SidebarItem } from "../data/types"
import {
  hasActiveNavDescendant,
  isNavItemSelfActive,
} from "../utils/is-active-nav-item"

type SidebarNavItemProps = {
  item: SidebarItem
  pathname: string
}

export function SidebarNavItem({ item, pathname }: SidebarNavItemProps) {
  const { isMobile, state } = useSidebar()
  const isSelfActive = isNavItemSelfActive(pathname, item)
  const hasActiveChild = hasActiveNavDescendant(pathname, item)
  const isParentActive = isSelfActive && !hasActiveChild
  const isCollapsed = state === "collapsed" && !isMobile
  const isChildMenuOpenByDefault = isSelfActive || hasActiveChild

  if (item.children?.length) {
    if (isCollapsed) {
      return (
        <DropdownMenu>
          <SidebarMenuItem>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                isActive={isParentActive}
                tooltip={item.title}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {item.icon ? <item.icon /> : null}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isMobile ? "bottom" : "right"}
              align={isMobile ? "end" : "start"}
              className="min-w-56 rounded-lg"
            >
              {item.children.map((child) => {
                const isChildActive = isNavItemSelfActive(pathname, child)

                return (
                  <DropdownMenuItem
                    asChild
                    key={child.id}
                    className={isChildActive ? "bg-accent text-accent-foreground" : undefined}
                  >
                    <Link href={child.href ?? "#"}>
                      {child.icon ? <child.icon /> : null}
                      <span>{child.title}</span>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </SidebarMenuItem>
        </DropdownMenu>
      )
    }

    return (
      <Collapsible
        asChild
        defaultOpen={isChildMenuOpenByDefault}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton isActive={isParentActive} tooltip={item.title}>
              {item.icon ? <item.icon /> : null}
              <span>{item.title}</span>
              <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isNavItemSelfActive(pathname, child)}
                  >
                    <Link href={child.href ?? "#"}>
                      {child.icon ? <child.icon /> : null}
                      <span>{child.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  if (!item.href) {
    return null
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isSelfActive}
        tooltip={item.title}
      >
        <Link href={item.href}>
          {item.icon ? <item.icon /> : null}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
