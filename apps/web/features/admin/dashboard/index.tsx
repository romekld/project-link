import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRightIcon,
  Building2Icon,
  FileJson2Icon,
  MapIcon,
  MapPinnedIcon,
  ShieldAlertIcon,
  TriangleAlertIcon,
  UserRoundPlusIcon,
  UsersRoundIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";

import { AdminDashboardCharts } from "./components/admin-dashboard-charts";
import type { AdminDashboardData, DashboardImportStatus } from "./types";

type AdminDashboardPageProps = {
  data: AdminDashboardData;
};

const quickLinkIcons = {
  "add-user": UserRoundPlusIcon,
  "add-station": Building2Icon,
  "open-barangays": MapIcon,
  "open-pins": MapPinnedIcon,
} as const;

export function AdminDashboardPage({ data }: AdminDashboardPageProps) {
  const latestImportBadgeVariant = getImportBadgeVariant(
    data.summary.latestGisImport.status,
  );

  return (
    <section className="flex flex-col gap-6">
      <Card className="overflow-hidden shadow-none">
        <CardHeader className="border-b bg-gradient-to-br from-muted/80 via-card to-card">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">System Admin</Badge>
                <Badge variant="outline">Live Supabase data</Badge>
                <Badge variant="outline">
                  {data.exceptions.length} queue
                  {data.exceptions.length === 1 ? "" : "s"} monitored
                </Badge>
              </div>
              <CardTitle className="mt-4 text-3xl font-semibold tracking-tight">
                System Admin Dashboard
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-sm/6">
                Monitor account readiness, health-station setup, and GIS
                registry health from one operational surface before diving into
                the dedicated workspaces.
              </CardDescription>
            </div>

            <CardAction className="static flex w-full flex-wrap gap-2 xl:w-auto">
              {data.quickLinks.map((link) => {
                const Icon = quickLinkIcons[link.id];

                return (
                  <Button asChild className="h-10 px-4" key={link.id} size="lg">
                    <Link href={link.href}>
                      <Icon data-icon="inline-start" />
                      {link.title}
                    </Link>
                  </Button>
                );
              })}
            </CardAction>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4 md:grid-cols-3">
          <SummaryBadge
            label="New this month"
            value={`${data.meta.usersCreatedThisMonth.toLocaleString()} user${
              data.meta.usersCreatedThisMonth === 1 ? "" : "s"
            }`}
          />
          <SummaryBadge
            label="Stations tracked"
            value={`${data.meta.stationsTracked.toLocaleString()} station${
              data.meta.stationsTracked === 1 ? "" : "s"
            }`}
          />
          <SummaryBadge
            label="Latest GIS activity"
            value={formatRelativeTimestamp(data.meta.latestImportAt)}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard
          description={`${data.meta.usersCreatedThisMonth.toLocaleString()} created this month`}
          href="/admin/users"
          icon={UsersRoundIcon}
          label="Total users"
          value={data.summary.totalUsers.toLocaleString()}
        />
        <MetricCard
          description="Unique accounts with status or password action needed"
          href="/admin/users"
          icon={ShieldAlertIcon}
          label="Users needing attention"
          tone="warning"
          value={data.summary.usersNeedingAttention.toLocaleString()}
        />
        <MetricCard
          description={`${data.meta.stationsTracked.toLocaleString()} tracked in management`}
          href="/admin/health-stations/manage"
          icon={Building2Icon}
          label="Active stations"
          value={data.summary.activeStations.toLocaleString()}
        />
        <MetricCard
          description="Active stations still missing coordinates"
          href="/admin/health-stations/pins"
          icon={MapPinnedIcon}
          tone="warning"
          label="Stations needing pins"
          value={data.summary.stationsNeedingPins.toLocaleString()}
        />
        <MetricCard
          description="Operational barangays mirrored from the registry"
          href="/admin/health-stations/city-barangays"
          icon={MapIcon}
          label="CHO2 barangays in scope"
          value={data.summary.cho2BarangaysInScope.toLocaleString()}
        />
        <MetricCard
          badge={
            <Badge variant={latestImportBadgeVariant}>
              {data.summary.latestGisImport.statusLabel}
            </Badge>
          }
          description={buildImportDetail(data.summary.latestGisImport)}
          href="/admin/health-stations/city-barangays"
          icon={FileJson2Icon}
          label="Latest GIS import"
          value={data.summary.latestGisImport.filename ?? "No import"}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="font-heading text-lg font-medium tracking-tight">
            Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Live operational breakdowns for accounts, station workload, and GIS
            scope health.
          </p>
        </div>
        <Separator className="hidden flex-1 lg:block" />
      </div>

      <AdminDashboardCharts charts={data.charts} />

      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="font-heading text-lg font-medium tracking-tight">
            Exception queue
          </h2>
          <p className="text-sm text-muted-foreground">
            Direct links into the admin workflows that currently need action.
          </p>
        </div>
        <Separator className="hidden flex-1 lg:block" />
      </div>

      <Card className="shadow-none">
        <CardHeader className="border-b">
          <CardTitle>Operational alerts</CardTitle>
          <CardDescription>
            Balanced coverage across user access, station readiness, and GIS
            administration.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {data.exceptions.length ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {data.exceptions.map((item) => (
                <Alert
                  key={item.id}
                  variant={
                    item.severity === "critical" ? "destructive" : "default"
                  }
                >
                  <TriangleAlertIcon />
                  <AlertTitle className="flex items-center gap-2">
                    {item.title}
                    <Badge
                      variant={
                        item.severity === "critical"
                          ? "destructive"
                          : item.severity === "warning"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {item.count.toLocaleString()}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>{item.description}</AlertDescription>
                  <AlertAction>
                    <Button asChild size="sm" variant="outline">
                      <Link href={item.href}>
                        Review
                        <ArrowRightIcon data-icon="inline-end" />
                      </Link>
                    </Button>
                  </AlertAction>
                </Alert>
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No admin exceptions right now</EmptyTitle>
                <EmptyDescription>
                  User access, station setup, and GIS import queues are all
                  currently clear.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  href,
  tone = "default",
  badge,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof UsersRoundIcon;
  href: string;
  tone?: "default" | "warning";
  badge?: ReactNode;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4" />
          {label}
        </CardTitle>
        {badge ? <CardAction>{badge}</CardAction> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-4">
        <div className="flex flex-col gap-1">
          <p className="truncate text-2xl font-semibold tracking-tight">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          asChild
          className="w-full justify-between"
          variant={tone === "warning" ? "outline" : "secondary"}
        >
          <Link href={href}>
            Open workspace
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function SummaryBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background px-3 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-medium text-foreground">{value}</p>
    </div>
  );
}

function buildImportDetail(
  latestImport: AdminDashboardData["summary"]["latestGisImport"],
) {
  if (!latestImport.createdAt) {
    return "No GIS import jobs have been recorded yet.";
  }

  return `${latestImport.validFeatures.toLocaleString()} valid, ${latestImport.errorFeatures.toLocaleString()} errors, ${latestImport.duplicateFeatures.toLocaleString()} duplicates.`;
}

function formatRelativeTimestamp(value: string | null) {
  if (!value) {
    return "No recent activity";
  }

  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

function getImportBadgeVariant(
  status: DashboardImportStatus,
): NonNullable<ComponentProps<typeof Badge>["variant"]> {
  switch (status) {
    case "committed":
      return "default";
    case "failed":
      return "destructive";
    case "uploaded":
    case "validated":
      return "secondary";
    case "cancelled":
    case "none":
    default:
      return "outline";
  }
}
