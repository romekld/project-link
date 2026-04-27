import { cache } from "react";

import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

import {
  buildAdminDashboardData,
  type DashboardImportJobInput,
  type DashboardProfileInput,
  type DashboardRegistryInput,
  type DashboardStationInput,
} from "./lib/aggregations";
import type { AdminDashboardData } from "./types";

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "role" | "status" | "must_change_password" | "created_at"
>;

type StationRow =
  Database["public"]["Views"]["health_station_management_view"]["Row"];

type RegistryRow = Pick<
  Database["public"]["Views"]["city_barangay_registry_view"]["Row"],
  "id" | "in_cho_scope"
>;

type ImportJobRow = Pick<
  Database["public"]["Tables"]["city_barangay_import_jobs"]["Row"],
  | "id"
  | "filename"
  | "status"
  | "total_features"
  | "valid_features"
  | "error_features"
  | "duplicate_features"
  | "created_at"
  | "validated_at"
  | "committed_at"
>;

export const getAdminDashboardData = cache(
  async (): Promise<AdminDashboardData> => {
    const supabase = await createClient();

    const [profilesResult, stationsResult, registryResult, importJobsResult] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, role, status, must_change_password, created_at"),
        supabase
          .from("health_station_management_view")
          .select(
            "id, station_code, name, is_active, coverage_count, assigned_staff_count, latitude, longitude",
          ),
        supabase.from("city_barangay_registry_view").select("id, in_cho_scope"),
        supabase
          .from("city_barangay_import_jobs")
          .select(
            "id, filename, status, total_features, valid_features, error_features, duplicate_features, created_at, validated_at, committed_at",
          )
          .order("created_at", { ascending: false }),
      ]);

    if (profilesResult.error) throw profilesResult.error;
    if (stationsResult.error) throw stationsResult.error;
    if (registryResult.error) throw registryResult.error;
    if (importJobsResult.error) throw importJobsResult.error;

    const profiles: DashboardProfileInput[] = (
      profilesResult.data ?? ([] as ProfileRow[])
    ).map((profile) => ({
      id: profile.id,
      role: profile.role,
      status: profile.status,
      mustChangePassword: profile.must_change_password,
      createdAt: profile.created_at,
    }));

    const stations: DashboardStationInput[] = (
      stationsResult.data ?? ([] as StationRow[])
    )
      .filter((station): station is StationRow & { id: string } =>
        Boolean(station.id),
      )
      .map((station) => ({
        id: station.id,
        stationCode: station.station_code ?? "",
        stationName: station.name ?? "Unnamed station",
        isActive: station.is_active === true,
        coverageCount: station.coverage_count ?? 0,
        assignedStaffCount: station.assigned_staff_count ?? 0,
        latitude: station.latitude,
        longitude: station.longitude,
      }));

    const registryRecords: DashboardRegistryInput[] = (
      registryResult.data ?? ([] as RegistryRow[])
    ).map((record) => ({
      inChoScope: record.in_cho_scope === true,
    }));

    const importJobs: DashboardImportJobInput[] = (
      importJobsResult.data ?? ([] as ImportJobRow[])
    )
      .filter((job): job is ImportJobRow & { id: string } => Boolean(job.id))
      .map((job) => ({
        id: job.id,
        filename: job.filename,
        status: job.status,
        totalFeatures: job.total_features,
        validFeatures: job.valid_features,
        errorFeatures: job.error_features,
        duplicateFeatures: job.duplicate_features,
        createdAt: job.created_at,
        validatedAt: job.validated_at,
        committedAt: job.committed_at,
      }));

    return buildAdminDashboardData({
      profiles,
      stations,
      registryRecords,
      importJobs,
    });
  },
);
