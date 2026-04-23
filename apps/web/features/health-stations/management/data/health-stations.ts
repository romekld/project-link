import type { HealthStation } from "./schema";

type Cho2BarangaySeed = {
  name: string;
  pcode: string;
};

const cho2CoverageBarangays: Cho2BarangaySeed[] = [
  { name: "Burol I", pcode: "PH0402106047" },
  { name: "Burol II", pcode: "PH0402106048" },
  { name: "Burol III", pcode: "PH0402106049" },
  { name: "Emmanuel Bergado I", pcode: "PH0402106021" },
  { name: "Emmanuel Bergado II", pcode: "PH0402106050" },
  { name: "Fatima I", pcode: "PH0402106022" },
  { name: "Fatima II", pcode: "PH0402106051" },
  { name: "Fatima III", pcode: "PH0402106052" },
  { name: "Luzviminda I", pcode: "PH0402106023" },
  { name: "Luzviminda II", pcode: "PH0402106054" },
  { name: "San Andres I", pcode: "PH0402106025" },
  { name: "San Andres II", pcode: "PH0402106067" },
  { name: "San Antonio de Padua I", pcode: "PH0402106026" },
  { name: "San Antonio de Padua II", pcode: "PH0402106068" },
  { name: "San Francisco I", pcode: "PH0402106029" },
  { name: "San Francisco II", pcode: "PH0402106069" },
  { name: "San Lorenzo Ruiz I", pcode: "PH0402106032" },
  { name: "San Lorenzo Ruiz II", pcode: "PH0402106071" },
  { name: "San Luis I", pcode: "PH0402106033" },
  { name: "San Luis II", pcode: "PH0402106072" },
  { name: "San Mateo", pcode: "PH0402106035" },
  { name: "San Nicolas I", pcode: "PH0402106037" },
  { name: "San Nicolas II", pcode: "PH0402106075" },
  { name: "San Roque (Sta. Cristina II)", pcode: "PH0402106038" },
  { name: "San Simon (Barangay 7)", pcode: "PH0402106039" },
  { name: "Santa Cristina I", pcode: "PH0402106040" },
  { name: "Santa Cristina II", pcode: "PH0402106076" },
  { name: "Santa Cruz I", pcode: "PH0402106041" },
  { name: "Santa Cruz II", pcode: "PH0402106077" },
  { name: "Santa Fe", pcode: "PH0402106042" },
  { name: "Santa Maria (Barangay 20)", pcode: "PH0402106044" },
  { name: "Victoria Reyes", pcode: "PH0402106081" },
];

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createMockHealthStations(): HealthStation[] {
  const currentYear = 2026;

  return cho2CoverageBarangays.map((barangay, index) => {
    const serial = String(index + 1).padStart(3, "0");
    const slugBase = toSlug(barangay.name);
    const isInactive = (index + 1) % 11 === 0;

    return {
      id: `station-${slugBase}`,
      stationCode: `BHS-${currentYear}-${serial}`,
      name: `${barangay.name} Health Station`,
      facilityType:
        index === 0 ? "main_bhs" : (index + 1) % 7 === 0 ? "satellite" : "bhs",
      status: isInactive ? "inactive" : "active",
      physicalBarangayName: barangay.name,
      physicalBarangayPcode: barangay.pcode,
      address: `${barangay.name}, Dasmarinas City`,
      notes: null,
      deactivationReason: isInactive ? "Mock inactive station" : null,
      coverageCount: isInactive ? 0 : 1,
      primaryCoverageCount: isInactive ? 0 : 1,
      assignedStaffCount: isInactive ? 0 : (index % 4) + 2,
      pinStatus: isInactive
        ? "draft"
        : (index + 1) % 5 === 0
          ? "needs_pin"
          : "pinned",
      latitude: null,
      longitude: null,
      updatedAt: `2026-04-${String((index % 20) + 1).padStart(2, "0")}T08:00:00.000Z`,
    } satisfies HealthStation;
  });
}
