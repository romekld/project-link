import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { AdminDashboardData } from "./types";

vi.mock("./components/admin-dashboard-charts", () => ({
  AdminDashboardCharts: () => (
    <div data-testid="dashboard-charts">dashboard charts</div>
  ),
}));

import { AdminDashboardPage } from "./index";

const baseData: AdminDashboardData = {
  summary: {
    totalUsers: 12,
    usersNeedingAttention: 3,
    activeStations: 5,
    stationsNeedingPins: 2,
    cho2BarangaysInScope: 19,
    latestGisImport: {
      status: "validated",
      statusLabel: "Validated",
      filename: "barangays-2026-04.geojson",
      totalFeatures: 19,
      validFeatures: 18,
      errorFeatures: 1,
      duplicateFeatures: 0,
      createdAt: "2026-04-24T00:00:00.000Z",
      validatedAt: "2026-04-24T01:00:00.000Z",
      committedAt: null,
      pendingJobs: 1,
      failedJobs: 0,
    },
  },
  charts: {
    usersByRole: [],
    accountStatusMix: [],
    coverageVsStaffByStation: [],
    gisScopeSplit: [],
  },
  exceptions: [
    {
      id: "station-pins",
      title: "Active stations still need map pins",
      description:
        "Station placement is incomplete for part of the operational map footprint.",
      count: 2,
      href: "/admin/health-stations/pins",
      severity: "warning",
    },
  ],
  quickLinks: [
    {
      id: "add-user",
      title: "Add User",
      description: "Create a new account and assign its operating role.",
      href: "/admin/users/new",
    },
    {
      id: "add-station",
      title: "Add Station",
      description: "Register a health station with coverage and location data.",
      href: "/admin/health-stations/manage/new",
    },
    {
      id: "open-barangays",
      title: "Open Barangays",
      description:
        "Review city registry scope, imports, and operational coverage.",
      href: "/admin/health-stations/city-barangays",
    },
    {
      id: "open-pins",
      title: "Open Pins",
      description: "Inspect station pin placement and unresolved mapping gaps.",
      href: "/admin/health-stations/pins",
    },
  ],
  meta: {
    generatedAt: "2026-04-27T00:00:00.000Z",
    usersCreatedThisMonth: 4,
    stationsTracked: 7,
    latestImportAt: "2026-04-24T00:00:00.000Z",
  },
};

describe("AdminDashboardPage", () => {
  it("renders the main KPI labels and quick actions for populated data", () => {
    const markup = renderToStaticMarkup(<AdminDashboardPage data={baseData} />);

    expect(markup).toContain("System Admin Dashboard");
    expect(markup).toContain("Total users");
    expect(markup).toContain("Users needing attention");
    expect(markup).toContain("Latest GIS import");
    expect(markup).toContain("Add User");
    expect(markup).toContain("Open Pins");
    expect(markup).toContain("Operational alerts");
    expect(markup).toContain("dashboard charts");
  });

  it("renders the exception empty state when no alerts are present", () => {
    const markup = renderToStaticMarkup(
      <AdminDashboardPage
        data={{
          ...baseData,
          summary: {
            ...baseData.summary,
            latestGisImport: {
              ...baseData.summary.latestGisImport,
              status: "none",
              statusLabel: "No imports yet",
              filename: null,
              createdAt: null,
              validatedAt: null,
              pendingJobs: 0,
            },
          },
          exceptions: [],
          meta: {
            ...baseData.meta,
            latestImportAt: null,
          },
        }}
      />,
    );

    expect(markup).toContain("No admin exceptions right now");
    expect(markup).toContain("No recent activity");
    expect(markup).toContain("No import");
  });
});
