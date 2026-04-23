import { ClipboardCheckIcon } from "lucide-react"

import type { SidebarSection } from "@/features/navigation/data/types"

export const rhmNavSections = [
  {
    id: "rhm-main",
    label: "RHM Navigation",
    items: [
      {
        id: "rhm-dashboard",
        title: "Dashboard",
        href: "/rhm/dashboard",
        icon: ClipboardCheckIcon,
        match: ["/rhm/dashboard"],
      },
    ],
  },
] satisfies SidebarSection[]
