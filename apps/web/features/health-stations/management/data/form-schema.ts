import { z } from "zod";
import type { CityBarangayRegistryRecord } from "../../city-barangay-registry/data/schema";
import type { HealthStation, HealthStationFacilityType } from "./schema";

export type CityBarangayOption = {
  id: string;
  name: string;
  pcode: string;
};

export type OperationalBarangayOption = {
  id: string;
  name: string;
  pcode: string;
  cityBarangayId: string;
};

export const cityBarangayOptions: CityBarangayOption[] = [];

export function toCityBarangayOptions(
  registryRecords: CityBarangayRegistryRecord[],
): CityBarangayOption[] {
  return registryRecords
    .filter((record) => record.inCho2Scope)
    .map((record) => ({
      id: record.id,
      name: record.name,
      pcode: record.pcode,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

// Populated from DB at runtime; empty array is the safe default for SSR.
export const operationalBarangayOptions: OperationalBarangayOption[] = [];

export type DbCoverageRow = {
  barangayId: string;
  isPrimary: boolean;
  notes: string | null;
};

const coverageRowSchema = z.object({
  barangayId: z.string().min(1),
  isActive: z.boolean(),
  isPrimary: z.boolean(),
  notes: z.string().optional(),
  currentPrimaryStationName: z.string().optional(),
});

const baseStationFormSchema = z.object({
  stationCode: z
    .string()
    .regex(
      /^BHS-\d{4}-\d{6}$/,
      "Station code must follow BHS-YYYY-###### format",
    ),
  name: z.string().min(1, "Station name is required"),
  facilityType: z.enum(["bhs", "main_bhs", "satellite"]),
  physicalCityBarangayId: z
    .string()
    .min(1, "Physical city barangay is required"),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
  deactivationReason: z.string().optional(),
  coverageRows: z.array(coverageRowSchema),
  pinStatus: z.enum(["pinned", "needs_pin", "draft"]),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

function validateStationFormRules(
  value: z.infer<typeof baseStationFormSchema>,
  ctx: z.RefinementCtx,
) {
  if (!value.isActive && !value.deactivationReason?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["deactivationReason"],
      message: "Deactivation reason is required when station is inactive",
    });
  }

  if (!value.coverageRows.some((row) => row.isActive)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["coverageRows"],
      message: "At least one active service barangay is required",
    });
  }
}

export const addStationSchema = baseStationFormSchema.superRefine(
  validateStationFormRules,
);

export const editStationSchema = baseStationFormSchema.superRefine(
  validateStationFormRules,
);

export type AddStationValues = z.infer<typeof addStationSchema>;
export type EditStationValues = z.infer<typeof editStationSchema>;
export type StationFormValues = AddStationValues | EditStationValues;

export function createStationCode(seed: number) {
  const year = new Date().getFullYear();
  return `BHS-${year}-${String(seed).padStart(6, "0")}`;
}

function toCoverageRows(
  operationalBarangays: OperationalBarangayOption[],
  dbCoverageRows: DbCoverageRow[] = [],
): AddStationValues["coverageRows"] {
  return operationalBarangays.map((barangay) => {
    const matched = dbCoverageRows.find(
      (row) => row.barangayId === barangay.id,
    );
    return {
      barangayId: barangay.id,
      isActive: Boolean(matched),
      isPrimary: matched?.isPrimary ?? false,
      notes: matched?.notes ?? "",
    };
  });
}

type BuildDefaultsArgs = {
  stationCode: string;
  station?: HealthStation;
  cityBarangays?: CityBarangayOption[];
  operationalBarangays: OperationalBarangayOption[];
  dbCoverageRows?: DbCoverageRow[];
};

export function buildDefaultStationValues({
  stationCode,
  station,
  cityBarangays = cityBarangayOptions,
  operationalBarangays,
  dbCoverageRows = [],
}: BuildDefaultsArgs): AddStationValues {
  const matchedBarangay = cityBarangays.find(
    (item) => item.pcode === station?.physicalBarangayPcode,
  );

  return {
    stationCode: station?.stationCode ?? stationCode,
    name: station?.name ?? "",
    facilityType: station?.facilityType ?? "bhs",
    physicalCityBarangayId: matchedBarangay?.id ?? "",
    address: station?.address ?? "",
    notes: station?.notes ?? "",
    isActive: station ? station.status === "active" : true,
    deactivationReason: station?.deactivationReason ?? "",
    coverageRows: toCoverageRows(operationalBarangays, dbCoverageRows),
    pinStatus: station?.pinStatus ?? "needs_pin",
    latitude: station?.latitude ?? null,
    longitude: station?.longitude ?? null,
  };
}

export function deriveCoverageWarnings(values: Partial<StationFormValues>) {
  const warnings: string[] = [];
  const activeRows = (values.coverageRows ?? []).filter((row) => row.isActive);

  if (activeRows.length === 0) {
    warnings.push(
      "Add at least one active operational barangay to keep coverage valid.",
    );
  }

  const conflictingRows = activeRows.filter(
    (row) => row.isPrimary && row.currentPrimaryStationName,
  );

  if (conflictingRows.length > 0) {
    warnings.push(
      `${conflictingRows.length} primary assignment${conflictingRows.length > 1 ? "s" : ""} may replace another station and needs confirmation.`,
    );
  }

  if (values.isActive === false && !values.deactivationReason?.trim()) {
    warnings.push(
      "Deactivation reason is required before saving an inactive station.",
    );
  }

  return warnings;
}

export function getCityBarangayLabel(
  id?: string,
  cityBarangays: CityBarangayOption[] = cityBarangayOptions,
) {
  if (!id) return "Not set";

  const value = cityBarangays.find((item) => item.id === id);
  if (!value) return "Not set";

  return `${value.name} (${value.pcode})`;
}

export function getCoverageBarangayLabel(
  barangayId: string,
  options: OperationalBarangayOption[] = operationalBarangayOptions,
) {
  const value = options.find((item) => item.id === barangayId);
  if (!value) return barangayId;

  return `${value.name} (${value.pcode})`;
}

export function getFacilityTypeLabel(value: HealthStationFacilityType) {
  if (value === "main_bhs") return "Barangay Health Center";
  if (value === "satellite") return "Satellite Health Station";
  return "Barangay Health Station";
}
