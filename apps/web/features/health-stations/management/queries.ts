import { createClient } from "@/lib/supabase/server";
import type { HealthStation } from "./data/schema";
import type { OperationalBarangayOption } from "./data/form-schema";

// Row shape returned by health_station_management_view.
type ManagementViewRow = {
  id: string;
  station_code: string | null;
  name: string;
  facility_type: string;
  is_active: boolean;
  deactivated_at: string | null;
  deactivation_reason: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  notes: string | null;
  physical_city_barangay_id: string | null;
  physical_barangay_name: string;
  physical_barangay_pcode: string;
  coverage_count: number;
  primary_coverage_count: number;
  assigned_staff_count: number;
  updated_at: string | null;
};

function mapRow(row: ManagementViewRow): HealthStation {
  return {
    id: row.id,
    stationCode: row.station_code ?? "",
    name: row.name,
    facilityType: row.facility_type as HealthStation["facilityType"],
    status: row.is_active ? "active" : "inactive",
    physicalBarangayName: row.physical_barangay_name,
    physicalBarangayPcode: row.physical_barangay_pcode,
    address: row.address,
    notes: row.notes,
    deactivationReason: row.deactivation_reason,
    coverageCount: row.coverage_count ?? 0,
    primaryCoverageCount: row.primary_coverage_count ?? 0,
    assignedStaffCount: row.assigned_staff_count ?? 0,
    pinStatus:
      row.latitude != null && row.longitude != null ? "pinned" : "needs_pin",
    latitude: row.latitude,
    longitude: row.longitude,
    updatedAt: row.updated_at ?? row.deactivated_at ?? new Date().toISOString(),
  };
}

export async function getHealthStations(): Promise<HealthStation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("health_station_management_view" as any)
    .select("*")
    .order("name");

  if (error) throw error;

  return ((data ?? []) as unknown as ManagementViewRow[]).map(mapRow);
}

export async function getHealthStation(
  id: string,
): Promise<HealthStation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("health_station_management_view" as any)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  return mapRow(data as unknown as ManagementViewRow);
}

export type CoverageRow = {
  id: string;
  barangayId: string;
  barangayName: string;
  barangayPcode: string;
  cityBarangayId: string;
  isPrimary: boolean;
  isActive: boolean;
  notes: string | null;
};

export async function getStationCoverageRows(
  stationId: string,
): Promise<CoverageRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("health_station_coverage_view" as any)
    .select(
      "id, barangay_id, barangay_name, barangay_pcode, city_barangay_id, is_primary, is_active, notes",
    )
    .eq("health_station_id", stationId)
    .eq("is_active", true);

  if (error) throw error;

  return (
    (data ?? []) as unknown as {
      id: string;
      barangay_id: string;
      barangay_name: string;
      barangay_pcode: string;
      city_barangay_id: string;
      is_primary: boolean;
      is_active: boolean;
      notes: string | null;
    }[]
  ).map((row) => ({
    id: row.id,
    barangayId: row.barangay_id,
    barangayName: row.barangay_name,
    barangayPcode: row.barangay_pcode,
    cityBarangayId: row.city_barangay_id,
    isPrimary: row.is_primary,
    isActive: row.is_active,
    notes: row.notes,
  }));
}

export async function getOperationalBarangays(): Promise<
  OperationalBarangayOption[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("barangays" as any)
    .select("id, name, pcode, city_barangay_id")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return (
    (data ?? []) as unknown as {
      id: string;
      name: string;
      pcode: string;
      city_barangay_id: string;
    }[]
  ).map((row) => ({
    id: row.id,
    name: row.name,
    pcode: row.pcode,
    cityBarangayId: row.city_barangay_id,
  }));
}

export async function getNextStationCode(): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();

  const { count } = await supabase
    .from("health_stations")
    .select("*", { count: "exact", head: true });

  const serial = String((count ?? 0) + 1).padStart(6, "0");
  return `BHS-${year}-${serial}`;
}
