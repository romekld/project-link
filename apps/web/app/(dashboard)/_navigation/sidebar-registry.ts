import { adminNavSections } from "../admin/nav-config"
import { bhwNavSections } from "../bhw/nav-config"
import { choNavSections } from "../cho/nav-config"
import { phnNavSections } from "../phn/nav-config"
import { rhmNavSections } from "../rhm/nav-config"
import type {
  DashboardViewer,
  SidebarSection,
  SupportedDashboardRole,
} from "@/features/navigation/data/types"

const sidebarSectionsByRole = {
  system_admin: adminNavSections,
  bhw: bhwNavSections,
  cho: choNavSections,
  phn: phnNavSections,
  rhm: rhmNavSections,
} satisfies Record<SupportedDashboardRole, SidebarSection[]>

export function getSidebarSections(
  viewer: Pick<DashboardViewer, "role">
): SidebarSection[] {
  return sidebarSectionsByRole[viewer.role]
}
