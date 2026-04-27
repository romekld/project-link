import type {
  AdminDashboardData,
  DashboardException,
  DashboardImportSummary,
  DashboardImportStatus,
  DashboardQuickLink,
  DashboardRoleKey,
  DashboardStatusKey,
} from "../types";

export type DashboardProfileInput = {
  id: string;
  role: string | null;
  status: string | null;
  mustChangePassword: boolean;
  createdAt: string;
};

export type DashboardStationInput = {
  id: string;
  stationCode: string;
  stationName: string;
  isActive: boolean;
  coverageCount: number;
  assignedStaffCount: number;
  latitude: number | null;
  longitude: number | null;
};

export type DashboardRegistryInput = {
  inChoScope: boolean;
};

export type DashboardImportJobInput = {
  id: string;
  filename: string | null;
  status: string | null;
  totalFeatures: number;
  validFeatures: number;
  errorFeatures: number;
  duplicateFeatures: number;
  createdAt: string;
  validatedAt: string | null;
  committedAt: string | null;
};

type UserAnalytics = {
  totalUsers: number;
  usersNeedingAttention: number;
  usersCreatedThisMonth: number;
  nonActiveUsers: number;
  passwordChangeUsers: number;
  usersByRole: AdminDashboardData["charts"]["usersByRole"];
  accountStatusMix: AdminDashboardData["charts"]["accountStatusMix"];
};

type StationAnalytics = {
  activeStations: number;
  stationsTracked: number;
  stationsNeedingPins: number;
  coverageVsStaffByStation: AdminDashboardData["charts"]["coverageVsStaffByStation"];
};

type GisAnalytics = {
  cho2BarangaysInScope: number;
  gisScopeSplit: AdminDashboardData["charts"]["gisScopeSplit"];
  latestGisImport: DashboardImportSummary;
};

const ROLE_ORDER: DashboardRoleKey[] = [
  "system_admin",
  "cho",
  "phn",
  "rhm",
  "bhw",
  "phis",
  "unknown",
];

const STATUS_ORDER: DashboardStatusKey[] = [
  "active",
  "invited",
  "suspended",
  "inactive",
  "unknown",
];

const ROLE_LABELS: Record<DashboardRoleKey, string> = {
  system_admin: "System Admin",
  cho: "City Health Officer",
  phn: "Public Health Nurse",
  rhm: "Rural Health Midwife",
  bhw: "Barangay Health Worker",
  phis: "PHIS Coordinator",
  unknown: "Unknown Role",
};

const STATUS_LABELS: Record<DashboardStatusKey, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
  inactive: "Inactive",
  unknown: "Unknown Status",
};

const IMPORT_STATUS_LABELS: Record<DashboardImportStatus, string> = {
  none: "No imports yet",
  uploaded: "Uploaded",
  validated: "Validated",
  committed: "Committed",
  failed: "Failed",
  cancelled: "Cancelled",
};

const QUICK_LINKS: DashboardQuickLink[] = [
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
];

function normalizeRole(role: string | null): DashboardRoleKey {
  switch (role) {
    case "system_admin":
    case "cho":
    case "phn":
    case "rhm":
    case "bhw":
    case "phis":
      return role;
    default:
      return "unknown";
  }
}

function normalizeStatus(status: string | null): DashboardStatusKey {
  switch (status) {
    case "active":
    case "invited":
    case "suspended":
    case "inactive":
      return status;
    default:
      return "unknown";
  }
}

function normalizeImportStatus(status: string | null): DashboardImportStatus {
  switch (status) {
    case "uploaded":
    case "validated":
    case "committed":
    case "failed":
    case "cancelled":
      return status;
    default:
      return "none";
  }
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function countUsersNeedingAttention(profiles: DashboardProfileInput[]) {
  const attentionIds = new Set<string>();

  for (const profile of profiles) {
    const status = normalizeStatus(profile.status);

    if (status !== "active" || profile.mustChangePassword) {
      attentionIds.add(profile.id);
    }
  }

  return attentionIds.size;
}

export function buildUserAnalytics(
  profiles: DashboardProfileInput[],
): UserAnalytics {
  const roleCounts = new Map<DashboardRoleKey, number>(
    ROLE_ORDER.map((role) => [role, 0]),
  );
  const statusCounts = new Map<DashboardStatusKey, number>(
    STATUS_ORDER.map((status) => [status, 0]),
  );

  const createdThisMonthBoundary = startOfCurrentMonth();
  let createdThisMonth = 0;
  let passwordChangeUsers = 0;

  for (const profile of profiles) {
    const role = normalizeRole(profile.role);
    const status = normalizeStatus(profile.status);

    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);

    if (profile.mustChangePassword) {
      passwordChangeUsers += 1;
    }

    if (new Date(profile.createdAt) >= createdThisMonthBoundary) {
      createdThisMonth += 1;
    }
  }

  const nonActiveUsers =
    (statusCounts.get("invited") ?? 0) +
    (statusCounts.get("suspended") ?? 0) +
    (statusCounts.get("inactive") ?? 0);

  return {
    totalUsers: profiles.length,
    usersNeedingAttention: countUsersNeedingAttention(profiles),
    usersCreatedThisMonth: createdThisMonth,
    nonActiveUsers,
    passwordChangeUsers,
    usersByRole: ROLE_ORDER.map((role) => ({
      role,
      label: ROLE_LABELS[role],
      count: roleCounts.get(role) ?? 0,
    })),
    accountStatusMix: STATUS_ORDER.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: statusCounts.get(status) ?? 0,
    })),
  };
}

export function buildStationAnalytics(
  stations: DashboardStationInput[],
): StationAnalytics {
  const activeStations = stations.filter((station) => station.isActive);
  const stationsNeedingPins = activeStations.filter(
    (station) => station.latitude == null || station.longitude == null,
  ).length;

  const coverageVsStaffByStation = [...activeStations]
    .sort((left, right) => {
      if (right.coverageCount !== left.coverageCount) {
        return right.coverageCount - left.coverageCount;
      }

      if (right.assignedStaffCount !== left.assignedStaffCount) {
        return right.assignedStaffCount - left.assignedStaffCount;
      }

      return left.stationName.localeCompare(right.stationName);
    })
    .slice(0, 8)
    .map((station) => ({
      stationId: station.id,
      stationCode: station.stationCode || "Uncoded",
      stationName: station.stationName,
      coverageCount: station.coverageCount,
      assignedStaffCount: station.assignedStaffCount,
    }));

  return {
    activeStations: activeStations.length,
    stationsTracked: stations.length,
    stationsNeedingPins,
    coverageVsStaffByStation,
  };
}

export function normalizeLatestImportSummary(
  jobs: DashboardImportJobInput[],
): DashboardImportSummary {
  const sortedJobs = [...jobs].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  const latestJob = sortedJobs[0];
  const pendingJobs = sortedJobs.filter((job) => {
    const status = normalizeImportStatus(job.status);
    return status === "uploaded" || status === "validated";
  }).length;
  const failedJobs = sortedJobs.filter((job) => {
    const status = normalizeImportStatus(job.status);
    return status === "failed" || status === "cancelled";
  }).length;

  if (!latestJob) {
    return {
      status: "none",
      statusLabel: IMPORT_STATUS_LABELS.none,
      filename: null,
      totalFeatures: 0,
      validFeatures: 0,
      errorFeatures: 0,
      duplicateFeatures: 0,
      createdAt: null,
      validatedAt: null,
      committedAt: null,
      pendingJobs,
      failedJobs,
    };
  }

  const status = normalizeImportStatus(latestJob.status);

  return {
    status,
    statusLabel: IMPORT_STATUS_LABELS[status],
    filename: latestJob.filename,
    totalFeatures: latestJob.totalFeatures,
    validFeatures: latestJob.validFeatures,
    errorFeatures: latestJob.errorFeatures,
    duplicateFeatures: latestJob.duplicateFeatures,
    createdAt: latestJob.createdAt,
    validatedAt: latestJob.validatedAt,
    committedAt: latestJob.committedAt,
    pendingJobs,
    failedJobs,
  };
}

export function buildGisAnalytics(
  registryRecords: DashboardRegistryInput[],
  importJobs: DashboardImportJobInput[],
): GisAnalytics {
  const cho2BarangaysInScope = registryRecords.filter(
    (record) => record.inChoScope,
  ).length;
  const outsideScope = registryRecords.length - cho2BarangaysInScope;

  return {
    cho2BarangaysInScope,
    gisScopeSplit: [
      {
        segment: "in_scope",
        label: "In CHO2 scope",
        count: cho2BarangaysInScope,
      },
      {
        segment: "out_of_scope",
        label: "Outside CHO2 scope",
        count: Math.max(outsideScope, 0),
      },
    ],
    latestGisImport: normalizeLatestImportSummary(importJobs),
  };
}

function buildExceptions(
  users: UserAnalytics,
  stations: StationAnalytics,
  latestImport: DashboardImportSummary,
): DashboardException[] {
  const exceptions: DashboardException[] = [];

  if (users.nonActiveUsers > 0) {
    exceptions.push({
      id: "user-status",
      title: "Accounts with non-active status",
      description:
        "Invited, inactive, or suspended users need admin review before operations rely on them.",
      count: users.nonActiveUsers,
      href: "/admin/users",
      severity: users.nonActiveUsers > 3 ? "critical" : "warning",
    });
  }

  if (users.passwordChangeUsers > 0) {
    exceptions.push({
      id: "password-change",
      title: "Password change still pending",
      description:
        "These accounts will be blocked into the forced password-change flow on next login.",
      count: users.passwordChangeUsers,
      href: "/admin/users",
      severity: "info",
    });
  }

  if (stations.stationsNeedingPins > 0) {
    exceptions.push({
      id: "station-pins",
      title: "Active stations still need map pins",
      description:
        "Station placement is incomplete for part of the operational map footprint.",
      count: stations.stationsNeedingPins,
      href: "/admin/health-stations/pins",
      severity: "warning",
    });
  }

  const importAttentionCount =
    latestImport.pendingJobs + latestImport.failedJobs;

  if (importAttentionCount > 0) {
    exceptions.push({
      id: "gis-imports",
      title: "GIS import queue needs attention",
      description:
        "Pending validation or failed import batches are waiting in the barangay registry workspace.",
      count: importAttentionCount,
      href: "/admin/health-stations/city-barangays",
      severity: latestImport.failedJobs > 0 ? "critical" : "warning",
    });
  }

  return exceptions;
}

export function buildAdminDashboardData({
  profiles,
  stations,
  registryRecords,
  importJobs,
}: {
  profiles: DashboardProfileInput[];
  stations: DashboardStationInput[];
  registryRecords: DashboardRegistryInput[];
  importJobs: DashboardImportJobInput[];
}): AdminDashboardData {
  const users = buildUserAnalytics(profiles);
  const stationAnalytics = buildStationAnalytics(stations);
  const gis = buildGisAnalytics(registryRecords, importJobs);

  return {
    summary: {
      totalUsers: users.totalUsers,
      usersNeedingAttention: users.usersNeedingAttention,
      activeStations: stationAnalytics.activeStations,
      stationsNeedingPins: stationAnalytics.stationsNeedingPins,
      cho2BarangaysInScope: gis.cho2BarangaysInScope,
      latestGisImport: gis.latestGisImport,
    },
    charts: {
      usersByRole: users.usersByRole,
      accountStatusMix: users.accountStatusMix,
      coverageVsStaffByStation: stationAnalytics.coverageVsStaffByStation,
      gisScopeSplit: gis.gisScopeSplit,
    },
    exceptions: buildExceptions(users, stationAnalytics, gis.latestGisImport),
    quickLinks: QUICK_LINKS,
    meta: {
      generatedAt: new Date().toISOString(),
      usersCreatedThisMonth: users.usersCreatedThisMonth,
      stationsTracked: stationAnalytics.stationsTracked,
      latestImportAt: gis.latestGisImport.createdAt,
    },
  };
}
