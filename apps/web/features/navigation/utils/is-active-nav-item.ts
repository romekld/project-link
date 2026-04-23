import type { SidebarItem } from "../data/types"

function matchesPattern(pathname: string, pattern: string): boolean {
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2)

    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  }

  return pathname === pattern
}

function getItemPatterns(item: SidebarItem): string[] {
  const patterns = item.match ?? (item.href ? [item.href, `${item.href}/*`] : [])

  return patterns
}

export function isNavItemSelfActive(pathname: string, item: SidebarItem): boolean {
  const patterns = getItemPatterns(item)

  return patterns.some((pattern) => matchesPattern(pathname, pattern))
}

export function hasActiveNavDescendant(pathname: string, item: SidebarItem): boolean {
  return Boolean(
    item.children?.some(
      (child) =>
        isNavItemSelfActive(pathname, child) ||
        hasActiveNavDescendant(pathname, child)
    )
  )
}

export function isActiveNavItem(pathname: string, item: SidebarItem): boolean {
  const isSelfActive = isNavItemSelfActive(pathname, item)
  const hasActiveChild = hasActiveNavDescendant(pathname, item)

  return isSelfActive || hasActiveChild
}
