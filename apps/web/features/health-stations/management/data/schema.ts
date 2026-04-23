export type HealthStationStatus = "active" | "inactive";

export type HealthStationFacilityType = "bhs" | "main_bhs" | "satellite";

export type HealthStationPinStatus = "pinned" | "needs_pin" | "draft";

export type HealthStation = {
  id: string;
  stationCode: string;
  name: string;
  facilityType: HealthStationFacilityType;
  status: HealthStationStatus;
  physicalBarangayName: string;
  physicalBarangayPcode: string;
  address: string | null;
  notes: string | null;
  deactivationReason: string | null;
  coverageCount: number;
  primaryCoverageCount: number;
  assignedStaffCount: number;
  pinStatus: HealthStationPinStatus;
  latitude: number | null;
  longitude: number | null;
  updatedAt: string;
};
