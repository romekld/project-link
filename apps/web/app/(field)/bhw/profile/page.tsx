import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, CloudUpload, FolderPlus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardViewer } from "@/features/navigation/queries/get-dashboard-viewer";

export default async function Page() {
  const viewer = await getDashboardViewer();

  if (!viewer || viewer.role !== "bhw") {
    redirect("/login");
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Your BHW account, quick tools, and sync shortcuts.
        </p>
      </div>

      <Card className="overflow-hidden border border-rose-100/80 bg-gradient-to-br from-white via-rose-50/80 to-orange-50 shadow-[0_24px_50px_-38px_rgba(251,113,133,0.6)]">
        <CardContent className="flex items-center gap-4 pt-4">
          <Avatar size="lg" className="size-14 shadow-sm">
            <AvatarImage
              src={viewer.avatarUrl ?? undefined}
              alt={viewer.name}
            />
            <AvatarFallback>{viewer.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-950">
              {viewer.name}
            </p>
            <p className="truncate text-sm text-slate-500">{viewer.email}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-rose-500">
              Barangay Health Worker
            </p>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Quick access</CardTitle>
          <CardDescription>
            Keep the operational actions that matter close by.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button
            asChild
            variant="outline"
            className="h-auto justify-between rounded-2xl px-4 py-4"
          >
            <Link href="/bhw/households/new">
              <span className="flex items-center gap-3">
                <FolderPlus className="size-4 text-rose-500" />
                <span className="text-left">
                  <span className="block text-sm font-semibold">
                    New household
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Start a new HH profile from here.
                  </span>
                </span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto justify-between rounded-2xl px-4 py-4"
          >
            <Link href="/bhw/sync">
              <span className="flex items-center gap-3">
                <CloudUpload className="size-4 text-sky-500" />
                <span className="text-left">
                  <span className="block text-sm font-semibold">
                    Sync queue
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Review records waiting to upload.
                  </span>
                </span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
