import { StethoscopeIcon } from "lucide-react"

import type { SidebarSection } from "@/features/navigation/data/types"

export const phnNavSections = [
  {
    id: "phn-main",
    label: "PHN Navigation",
    items: [
      {
        id: "phn-dashboard",
        title: "Dashboard",
        href: "/phn/dashboard",
        icon: StethoscopeIcon,
        match: ["/phn/dashboard"],
      },
    ],
  },
] satisfies SidebarSection[]
