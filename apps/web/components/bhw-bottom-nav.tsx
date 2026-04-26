"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserRound,
  Folder,
  House,
  Plus,
  UserRoundPlus ,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const tabs = [
  {
    label: "Home",
    href: "/bhw/dashboard",
    icon: House,
    match: ["/bhw/dashboard"],
  },
  {
    label: "Household",
    href: "/bhw/households",
    icon: Folder,
    match: ["/bhw/households"],
  },
  {
    label: "Profile",
    href: "/bhw/profile",
    icon: UserRound,
    match: ["/bhw/profile"],
  },
];

export function BhwBottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div
        className="mx-auto flex w-full max-w-md items-end justify-center gap-2 px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <nav
          aria-label="BHW navigation"
          className="pointer-events-auto flex h-12 flex-1 items-center gap-1 rounded-full border bg-background/95 p-1 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90"
        >
          {tabs.map(({ label, href, icon: Icon, match }) => {
            const isActive = match.some(
              (m) => pathname === m || pathname.startsWith(m + "/"),
            );

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-10 min-w-0 items-center justify-center gap-2 rounded-full px-2.5 text-sm font-medium transition-all duration-200 ease-out active:scale-[0.98]",
                  isActive
                    ? "flex-1 justify-start bg-accent text-accent-foreground"
                    : "w-10 shrink-0 text-muted-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap transition-all duration-200 ease-out",
                    isActive ? "max-w-24 opacity-100" : "max-w-0 opacity-0",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon-lg"
              aria-label="Create a new record"
              className="pointer-events-auto size-12 shrink-0 rounded-full shadow-sm"
            >
              <Plus aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="end"
            sideOffset={12}
            className="w-72"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Choose Action</DropdownMenuLabel>

              <DropdownMenuItem asChild className="px-0 py-0">
                <Link
                  href="/bhw/households/new"
                  className="flex min-w-0 items-start gap-2.5 rounded-md px-2 py-2"
                >
                  <Plus />
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-medium">
                      New household
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Create a new household record.
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled
                className="items-start gap-2.5 px-2 py-2"
              >
                <UserRoundPlus  />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-sm font-medium">New patient</span>
                  <span className="block text-xs text-muted-foreground">
                    Coming next.
                  </span>
                </span>
                <Badge variant="outline">Soon</Badge>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
