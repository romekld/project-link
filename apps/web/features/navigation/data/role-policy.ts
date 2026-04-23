import type { SupportedDashboardRole, UserRole } from "./types"

export const ROLE_HOME = {
  system_admin: "/admin/dashboard",
  bhw: "/bhw/dashboard",
  cho: "/cho/dashboard",
  phn: "/phn/dashboard",
  rhm: "/rhm/dashboard",
} as const satisfies Record<SupportedDashboardRole, string>

export const ROLE_PREFIXES = [
  { prefix: "/admin", role: "system_admin" },
  { prefix: "/bhw", role: "bhw" },
  { prefix: "/cho", role: "cho" },
  { prefix: "/phn", role: "phn" },
  { prefix: "/rhm", role: "rhm" },
] as const satisfies Array<{ prefix: string; role: SupportedDashboardRole }>

export function isSupportedDashboardRole(
  role: UserRole | string | null | undefined
): role is SupportedDashboardRole {
  return Boolean(role && role in ROLE_HOME)
}

export function getRoleHome(role: UserRole | string | null | undefined) {
  if (!isSupportedDashboardRole(role)) {
    return null
  }

  return ROLE_HOME[role]
}
