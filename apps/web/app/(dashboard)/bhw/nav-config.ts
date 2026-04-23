import { Building2, CloudUpload, House } from "lucide-react"

import type { SidebarSection } from "@/features/navigation/data/types"

export const bhwNavSections = [
  {
    id: "bhw-main",
    label: "Overview",
    items: [
      {
        id: "bhw-dashboard",
        title: "Home",
        href: "/bhw/dashboard",
        icon: House,
        match: ["/bhw/dashboard"],
      },
    ],
  },
  {
    id: "bhw-field",
    label: "Field Operations",
    items: [
      {
        id: "bhw-households",
        title: "Households",
        href: "/bhw/households",
        icon: Building2,
        match: ["/bhw/households"],
      },
    ],
  },
  {
    id: "bhw-data",
    label: "Data",
    items: [
      {
        id: "bhw-sync",
        title: "Sync Queue",
        href: "/bhw/sync",
        icon: CloudUpload,
        match: ["/bhw/sync"],
      },
    ],
  },
] satisfies SidebarSection[]
