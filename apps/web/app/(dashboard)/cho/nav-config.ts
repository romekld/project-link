import { Building2Icon, MapIcon } from "lucide-react"

import type { SidebarSection } from "@/features/navigation/data/types"

export const choNavSections = [
  {
    id: "cho-main",
    label: "CHO Navigation",
    items: [
      {
        id: "cho-dashboard",
        title: "Dashboard",
        href: "/cho/dashboard",
        icon: Building2Icon,
        match: ["/cho/dashboard"],
      },
      {
        id: "cho-health-stations",
        title: "Health Stations",
        icon: Building2Icon,
        match: ["/cho/health-stations", "/cho/health-stations/*"],
        children: [
          {
            id: "cho-health-stations-city-barangays",
            title: "City Barangays",
            href: "/cho/health-stations/city-barangays",
            icon: MapIcon,
            match: ["/cho/health-stations/city-barangays"],
          },
          {
            id: "cho-health-stations-manage-bhs",
            title: "Manage BHS",
            href: "/cho/health-stations/manage",
            icon: Building2Icon,
            match: ["/cho/health-stations/manage", "/cho/health-stations/manage/*"],
          },
        ],
      },
      {
        id: "cho-analytics-gis",
        title: "Analytics GIS",
        href: "/cho/analytics/gis",
        icon: MapIcon,
        match: ["/cho/analytics/gis"],
      },
    ],
  },
] satisfies SidebarSection[]
