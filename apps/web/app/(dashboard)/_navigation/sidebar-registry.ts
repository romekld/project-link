import { adminNavSections } from "../admin/nav-config"
import { choNavSections } from "../cho/nav-config"
import { phnNavSections } from "../phn/nav-config"
import { rhmNavSections } from "../rhm/nav-config"
import type {
  DashboardViewer,
  SidebarSection,
  SupportedDashboardRole,
} from "@/features/navigation/data/types"

type DashboardSidebarRole = Exclude<SupportedDashboardRole, "bhw">

const sidebarSectionsByRole = {
  system_admin: adminNavSections,
  cho: choNavSections,
  phn: phnNavSections,
  rhm: rhmNavSections,
} satisfies Record<DashboardSidebarRole, SidebarSection[]>

export function getSidebarSections(
  viewer: Pick<DashboardViewer, "role">
): SidebarSection[] {
  if (viewer.role === "bhw") return []
  return sidebarSectionsByRole[viewer.role]
}
