import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { isSupportedDashboardRole } from "../data/role-policy"
import type { DashboardViewer } from "../data/types"

function formatDisplayName(profile: {
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  username: string | null
  email: string | null
}) {
  const parts = [
    profile.first_name,
    profile.middle_name,
    profile.last_name,
  ].filter(Boolean)

  return parts.join(" ") || profile.username || profile.email || "Project LINK User"
}

function formatInitials(name: string, email: string) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return initials || email[0]?.toUpperCase() || "PL"
}

export const getDashboardViewer = cache(async function getDashboardViewer(): Promise<DashboardViewer | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, role, email, first_name, middle_name, last_name, username, profile_photo_url, must_change_password"
    )
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || !isSupportedDashboardRole(profile.role)) {
    return null
  }

  const email = profile.email || user.email || ""
  const name = formatDisplayName(profile)

  return {
    id: profile.id,
    role: profile.role,
    name,
    email,
    avatarUrl: profile.profile_photo_url,
    initials: formatInitials(name, email),
    mustChangePassword: Boolean(profile.must_change_password),
  }
})
