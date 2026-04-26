import { CircleUserRound, Folder, House } from "lucide-react";

import type { SidebarSection } from "@/features/navigation/data/types";

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
        title: "Household",
        href: "/bhw/households",
        icon: Folder,
        match: ["/bhw/households"],
      },
    ],
  },
  {
    id: "bhw-account",
    label: "Account",
    items: [
      {
        id: "bhw-profile",
        title: "Profile",
        href: "/bhw/profile",
        icon: CircleUserRound,
        match: ["/bhw/profile"],
      },
    ],
  },
] satisfies SidebarSection[];
