import { describe, expect, it } from "vitest";

import {
  buildAdminDashboardData,
  buildStationAnalytics,
  buildUserAnalytics,
  normalizeLatestImportSummary,
} from "./aggregations";

describe("dashboard aggregations", () => {
  it("counts users needing attention without double-counting a user", () => {
    const currentMonthDate = new Date();
    currentMonthDate.setDate(2);
    currentMonthDate.setHours(0, 0, 0, 0);

    const previousMonthDate = new Date(currentMonthDate);
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

    const analytics = buildUserAnalytics([
      {
        id: "user-1",
        role: "system_admin",
        status: "active",
        mustChangePassword: true,
        createdAt: currentMonthDate.toISOString(),
      },
      {
        id: "user-2",
        role: "bhw",
        status: "invited",
        mustChangePassword: false,
        createdAt: currentMonthDate.toISOString(),
      },
      {
        id: "user-3",
        role: "rhm",
        status: "active",
        mustChangePassword: false,
        createdAt: currentMonthDate.toISOString(),
      },
      {
        id: "user-4",
        role: "phn",
        status: "suspended",
        mustChangePassword: true,
        createdAt: previousMonthDate.toISOString(),
      },
    ]);

    expect(analytics.totalUsers).toBe(4);
    expect(analytics.usersNeedingAttention).toBe(3);
    expect(analytics.passwordChangeUsers).toBe(2);
    expect(analytics.nonActiveUsers).toBe(2);
    expect(analytics.usersCreatedThisMonth).toBe(3);
    expect(
      analytics.usersByRole.find((item) => item.role === "system_admin")?.count,
    ).toBe(1);
  });

  it("builds station readiness and limits the chart to the highest-coverage active stations", () => {
    const analytics = buildStationAnalytics([
      {
        id: "station-1",
        stationCode: "BHS-001",
        stationName: "Station 1",
        isActive: true,
        coverageCount: 5,
        assignedStaffCount: 2,
        latitude: 14.2,
        longitude: 120.9,
      },
      {
        id: "station-2",
        stationCode: "BHS-002",
        stationName: "Station 2",
        isActive: true,
        coverageCount: 8,
        assignedStaffCount: 1,
        latitude: null,
        longitude: null,
      },
      {
        id: "station-3",
        stationCode: "BHS-003",
        stationName: "Station 3",
        isActive: false,
        coverageCount: 11,
        assignedStaffCount: 4,
        latitude: null,
        longitude: null,
      },
    ]);

    expect(analytics.activeStations).toBe(2);
    expect(analytics.stationsTracked).toBe(3);
    expect(analytics.stationsNeedingPins).toBe(1);
    expect(analytics.coverageVsStaffByStation).toHaveLength(2);
    expect(analytics.coverageVsStaffByStation[0]?.stationId).toBe("station-2");
  });

  it("normalizes the latest GIS import and tracks pending or failed jobs", () => {
    const summary = normalizeLatestImportSummary([
      {
        id: "job-2",
        filename: "validated.geojson",
        status: "validated",
        totalFeatures: 40,
        validFeatures: 39,
        errorFeatures: 1,
        duplicateFeatures: 0,
        createdAt: "2026-04-22T00:00:00.000Z",
        validatedAt: "2026-04-22T01:00:00.000Z",
        committedAt: null,
      },
      {
        id: "job-1",
        filename: "failed.geojson",
        status: "failed",
        totalFeatures: 32,
        validFeatures: 0,
        errorFeatures: 32,
        duplicateFeatures: 0,
        createdAt: "2026-04-18T00:00:00.000Z",
        validatedAt: null,
        committedAt: null,
      },
    ]);

    expect(summary.status).toBe("validated");
    expect(summary.statusLabel).toBe("Validated");
    expect(summary.pendingJobs).toBe(1);
    expect(summary.failedJobs).toBe(1);
  });

  it("returns stable empty-state dashboard data when all source tables are empty", () => {
    const dashboard = buildAdminDashboardData({
      profiles: [],
      stations: [],
      registryRecords: [],
      importJobs: [],
    });

    expect(dashboard.summary.totalUsers).toBe(0);
    expect(dashboard.summary.usersNeedingAttention).toBe(0);
    expect(dashboard.summary.activeStations).toBe(0);
    expect(dashboard.summary.latestGisImport.status).toBe("none");
    expect(dashboard.exceptions).toHaveLength(0);
    expect(dashboard.quickLinks).toHaveLength(4);
  });
});
