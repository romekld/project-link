export { AppSidebar } from "./components/app-sidebar"
export { getDashboardViewer } from "./queries/get-dashboard-viewer"
export {
  ROLE_HOME,
  ROLE_PREFIXES,
  getRoleHome,
  isSupportedDashboardRole,
} from "./data/role-policy"
export type {
  DashboardViewer,
  SidebarItem,
  SidebarSection,
  SupportedDashboardRole,
  UserRole,
} from "./data/types"
export { getSidebarSections } from "@/app/(dashboard)/_navigation/sidebar-registry"
