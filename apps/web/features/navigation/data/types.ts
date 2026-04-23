import type { LucideIcon } from "lucide-react"
import type { Database } from "@/lib/supabase/database.types"

export type UserRole = Database["public"]["Enums"]["user_role"]
export type SupportedDashboardRole = Exclude<UserRole, "phis">

export type DashboardViewer = {
  id: string
  role: SupportedDashboardRole
  name: string
  email: string
  avatarUrl: string | null
  initials: string
  mustChangePassword: boolean
}

export type SidebarItem = {
  id: string
  title: string
  href?: string
  icon?: LucideIcon
  match?: string[]
  children?: SidebarItem[]
}

export type SidebarSection = {
  id: string
  label: string
  items: SidebarItem[]
}
