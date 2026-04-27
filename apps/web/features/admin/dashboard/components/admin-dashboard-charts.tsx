"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type { AdminDashboardData } from "../types";

type AdminDashboardChartsProps = {
  charts: AdminDashboardData["charts"];
};

const roleChartConfig = {
  system_admin: { label: "System Admin", color: "var(--chart-1)" },
  cho: { label: "City Health Officer", color: "var(--chart-2)" },
  phn: { label: "Public Health Nurse", color: "var(--chart-3)" },
  rhm: { label: "Rural Health Midwife", color: "var(--chart-4)" },
  bhw: { label: "Barangay Health Worker", color: "var(--chart-5)" },
  phis: { label: "PHIS Coordinator", color: "var(--primary)" },
  unknown: { label: "Unknown Role", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const statusChartConfig = {
  active: { label: "Active", color: "var(--chart-2)" },
  invited: { label: "Invited", color: "var(--chart-1)" },
  suspended: { label: "Suspended", color: "var(--destructive)" },
  inactive: { label: "Inactive", color: "var(--chart-4)" },
  unknown: { label: "Unknown", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const stationChartConfig = {
  coverageCount: { label: "Coverage barangays", color: "var(--chart-1)" },
  assignedStaffCount: { label: "Assigned staff", color: "var(--chart-4)" },
} satisfies ChartConfig;

const gisChartConfig = {
  in_scope: { label: "In CHO2 scope", color: "var(--chart-2)" },
  out_of_scope: { label: "Outside scope", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function AdminDashboardCharts({ charts }: AdminDashboardChartsProps) {
  const topRole = [...charts.usersByRole]
    .sort((left, right) => right.count - left.count)
    .find((item) => item.count > 0);

  const statusTotal = charts.accountStatusMix.reduce(
    (total, item) => total + item.count,
    0,
  );

  const coverageLeader = [...charts.coverageVsStaffByStation].sort(
    (left, right) => right.coverageCount - left.coverageCount,
  )[0];

  const scopedBarangays =
    charts.gisScopeSplit.find((item) => item.segment === "in_scope")?.count ??
    0;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="shadow-none">
        <CardHeader className="border-b">
          <CardTitle>Users by role</CardTitle>
          <CardDescription>
            Current directory mix across the platform&apos;s operating roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {charts.usersByRole.some((item) => item.count > 0) ? (
            <ChartContainer
              className="min-h-[280px] w-full"
              config={roleChartConfig}
            >
              <BarChart accessibilityLayer data={charts.usersByRole}>
                <CartesianGrid vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tickLine={false}
                  tickMargin={10}
                  tickFormatter={(value) =>
                    value
                      .replace("Barangay Health Worker", "BHW")
                      .replace("Rural Health Midwife", "RHM")
                      .replace("Public Health Nurse", "PHN")
                      .replace("City Health Officer", "CHO")
                      .replace("System Admin", "Admin")
                  }
                />
                <ChartTooltip
                  content={<ChartTooltipContent labelKey="role" />}
                  cursor={false}
                />
                <Bar dataKey="count" radius={10}>
                  {charts.usersByRole.map((item) => (
                    <Cell fill={`var(--color-${item.role})`} key={item.role} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <Empty className="min-h-[280px]">
              <EmptyHeader>
                <EmptyTitle>No user records yet</EmptyTitle>
                <EmptyDescription>
                  Role distribution will appear here once accounts exist in the
                  live directory.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
        <CardFooter>
          {topRole ? (
            <p className="text-sm text-muted-foreground">
              Largest group:{" "}
              <span className="font-medium text-foreground">
                {topRole.label}
              </span>{" "}
              with {topRole.count} account
              {topRole.count === 1 ? "" : "s"}.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add users to populate the role mix.
            </p>
          )}
        </CardFooter>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="border-b">
          <CardTitle>Account status mix</CardTitle>
          <CardDescription>
            Active versus invited, suspended, and inactive account states.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {statusTotal > 0 ? (
            <ChartContainer
              className="min-h-[280px] w-full"
              config={statusChartConfig}
            >
              <PieChart accessibilityLayer>
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel nameKey="status" />}
                />
                <Pie
                  data={charts.accountStatusMix}
                  dataKey="count"
                  innerRadius={72}
                  nameKey="status"
                  paddingAngle={3}
                  strokeWidth={4}
                >
                  {charts.accountStatusMix.map((item) => (
                    <Cell
                      fill={`var(--color-${item.status})`}
                      key={item.status}
                    />
                  ))}
                </Pie>
                <ChartLegend
                  content={
                    <ChartLegendContent
                      className="flex-wrap"
                      nameKey="status"
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <Empty className="min-h-[280px]">
              <EmptyHeader>
                <EmptyTitle>No account states to chart</EmptyTitle>
                <EmptyDescription>
                  The status mix will render when profile rows are available.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Total tracked accounts:{" "}
            <span className="font-medium text-foreground">
              {statusTotal.toLocaleString()}
            </span>
            .
          </p>
        </CardFooter>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="border-b">
          <CardTitle>Coverage vs assigned staff</CardTitle>
          <CardDescription>
            Top 8 active stations by coverage load against assigned staff.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {charts.coverageVsStaffByStation.length ? (
            <ChartContainer
              className="min-h-[320px] w-full"
              config={stationChartConfig}
            >
              <BarChart
                accessibilityLayer
                data={charts.coverageVsStaffByStation}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="stationCode"
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="coverageCount"
                  fill="var(--color-coverageCount)"
                  radius={8}
                />
                <Bar
                  dataKey="assignedStaffCount"
                  fill="var(--color-assignedStaffCount)"
                  radius={8}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <Empty className="min-h-[320px]">
              <EmptyHeader>
                <EmptyTitle>No station coverage data</EmptyTitle>
                <EmptyDescription>
                  Station analytics appear here once health stations are
                  available in the management view.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
        <CardFooter>
          {coverageLeader ? (
            <p className="text-sm text-muted-foreground">
              Highest current coverage load:{" "}
              <span className="font-medium text-foreground">
                {coverageLeader.stationCode}
              </span>{" "}
              with {coverageLeader.coverageCount} covered barangay
              {coverageLeader.coverageCount === 1 ? "" : "s"}.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add and activate stations to compare staffing against coverage.
            </p>
          )}
        </CardFooter>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="border-b">
          <CardTitle>GIS scope split</CardTitle>
          <CardDescription>
            Registry coverage inside versus outside the CHO2 operational scope.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {charts.gisScopeSplit.some((item) => item.count > 0) ? (
            <ChartContainer
              className="min-h-[320px] w-full"
              config={gisChartConfig}
            >
              <PieChart accessibilityLayer>
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel nameKey="segment" />}
                />
                <Pie
                  data={charts.gisScopeSplit}
                  dataKey="count"
                  innerRadius={72}
                  nameKey="segment"
                  paddingAngle={4}
                  strokeWidth={4}
                >
                  {charts.gisScopeSplit.map((item) => (
                    <Cell
                      fill={`var(--color-${item.segment})`}
                      key={item.segment}
                    />
                  ))}
                </Pie>
                <ChartLegend
                  content={
                    <ChartLegendContent
                      className="flex-wrap"
                      nameKey="segment"
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <Empty className="min-h-[320px]">
              <EmptyHeader>
                <EmptyTitle>No GIS registry data</EmptyTitle>
                <EmptyDescription>
                  Barangay scope distribution will render after registry data is
                  available.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            CHO2 currently mirrors{" "}
            <span className="font-medium text-foreground">
              {scopedBarangays.toLocaleString()}
            </span>{" "}
            barangay{scopedBarangays === 1 ? "" : "s"} into operational scope.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
