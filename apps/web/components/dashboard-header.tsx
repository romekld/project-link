"use client";

import { useEffect, useState } from "react";
import { DashboardHeaderActions } from "@/components/dashboard-header-actions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type DashboardHeaderProps = {
  hideMobileSidebarTrigger?: boolean
}

export function DashboardHeader({ hideMobileSidebarTrigger }: DashboardHeaderProps) {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const inset = document.querySelector<HTMLElement>('[data-slot="sidebar-inset"]');
        const onScroll = () => setOffset(inset?.scrollTop ?? 0);

        onScroll();
        inset?.addEventListener("scroll", onScroll, { passive: true });

        return () => inset?.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className="header-fixed peer/header sticky border-b top-0 z-50 h-16 w-[inherit] shrink-0  bg-background md:rounded-t-xl"
        >

            {/* <header
                className={cn(
                    "header-fixed peer/header sticky top-0 z-50 h-16 w-[inherit] shrink-0 border-b bg-background/85 md:rounded-t-xl backdrop-blur supports-[backdrop-filter]:bg-background/60",
                    offset > 10 ? "shadow" : "shadow-none"
                )}
            > */}
            <div
                className={cn(
                    "relative flex h-full w-full items-center gap-3 p-4 sm:gap-4",
                    offset > 10 &&
                    "after:absolute after:inset-0 after:-z-10 after:bg-background/20 after:backdrop-blur-lg"
                )}
            >
                <SidebarTrigger className={hideMobileSidebarTrigger ? "md:flex hidden" : undefined} />
                <div className="ml-auto">
                    <DashboardHeaderActions />
                </div>
            </div>
        </header>
    );
}