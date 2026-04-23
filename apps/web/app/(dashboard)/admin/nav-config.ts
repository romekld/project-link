import {
  Building2Icon,
  LayoutDashboardIcon,
  MapIcon,
  MapPinnedIcon,
  UsersIcon,
} from "lucide-react"

import type { SidebarSection } from "@/features/navigation/data/types"

export const adminNavSections = [
  {
    id: "admin-main",
    label: "Navigation",
    items: [
      {
        id: "admin-dashboard",
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboardIcon,
        match: ["/admin/dashboard"],
      },
      {
        id: "admin-users",
        title: "Users",
        href: "/admin/users",
        icon: UsersIcon,
        match: ["/admin/users", "/admin/users/*"],
      },
      {
        id: "admin-health-stations",
        title: "Health Stations",
        icon: Building2Icon,
        match: ["/admin/health-stations", "/admin/health-stations/*"],
        children: [
          {
            id: "admin-health-stations-city-barangays",
            title: "Barangays",
            href: "/admin/health-stations/city-barangays",
            icon: MapIcon,
            match: ["/admin/health-stations/city-barangays"],
          },
          {
            id: "admin-health-stations-manage-bhs",
            title: "Manage BHS",
            href: "/admin/health-stations/manage",
            icon: MapPinnedIcon,
            match: ["/admin/health-stations/manage"],
          },

        ],
      },
    ],
  },
] satisfies SidebarSection[]
