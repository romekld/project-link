export type DashboardRoleKey =
  | "system_admin"
  | "cho"
  | "phn"
  | "rhm"
  | "bhw"
  | "phis"
  | "unknown";

export type DashboardStatusKey =
  | "active"
  | "invited"
  | "suspended"
  | "inactive"
  | "unknown";

export type DashboardImportStatus =
  | "none"
  | "uploaded"
  | "validated"
  | "committed"
  | "failed"
  | "cancelled";

export type DashboardQuickLink = {
  id: "add-user" | "add-station" | "open-barangays" | "open-pins";
  title: string;
  description: string;
  href: string;
};

export type DashboardImportSummary = {
  status: DashboardImportStatus;
  statusLabel: string;
  filename: string | null;
  totalFeatures: number;
  validFeatures: number;
  errorFeatures: number;
  duplicateFeatures: number;
  createdAt: string | null;
  validatedAt: string | null;
  committedAt: string | null;
  pendingJobs: number;
  failedJobs: number;
};

export type DashboardException = {
  id: "user-status" | "password-change" | "station-pins" | "gis-imports";
  title: string;
  description: string;
  count: number;
  href: string;
  severity: "info" | "warning" | "critical";
};

export type AdminDashboardData = {
  summary: {
    totalUsers: number;
    usersNeedingAttention: number;
    activeStations: number;
    stationsNeedingPins: number;
    cho2BarangaysInScope: number;
    latestGisImport: DashboardImportSummary;
  };
  charts: {
    usersByRole: Array<{
      role: DashboardRoleKey;
      label: string;
      count: number;
    }>;
    accountStatusMix: Array<{
      status: DashboardStatusKey;
      label: string;
      count: number;
    }>;
    coverageVsStaffByStation: Array<{
      stationId: string;
      stationCode: string;
      stationName: string;
      coverageCount: number;
      assignedStaffCount: number;
    }>;
    gisScopeSplit: Array<{
      segment: "in_scope" | "out_of_scope";
      label: string;
      count: number;
    }>;
  };
  exceptions: DashboardException[];
  quickLinks: DashboardQuickLink[];
  meta: {
    generatedAt: string;
    usersCreatedThisMonth: number;
    stationsTracked: number;
    latestImportAt: string | null;
  };
};
