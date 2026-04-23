/**
 * Seed script: creates one health station for each active CHO2 barangay.
 *
 * Station format:
 *   <Barangay Name> Health Station
 *
 * Location and service coverage are 1:1 with the barangay:
 *   health_stations.physical_city_barangay_id -> barangays.city_barangay_id
 *   health_station_coverage.barangay_id      -> barangays.id
 *
 * Prerequisites:
 *   1. Apply all migrations
 *   2. Run seeds/seed_city_barangays.ts first
 *   3. Have apps/web/.env.local present (keys are read from there automatically)
 *
 * Run from project-link/packages/supabase/:
 *   npx tsx seeds/seed_health_stations.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

type GeoJsonFeature = {
  type: "Feature";
  properties: Record<string, unknown>;
};

type GeoJsonCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

type ActiveBarangayRow = {
  id: string;
  name: string;
  pcode: string;
  city_barangay_id: string;
};

type HealthStationRpcRow = {
  id: string;
};

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const GIS_ROOT = path.join(__dirname, "../../../docs/gis");
const HEALTH_STATION_IMPORT_REASON = "Initial 1:1 barangay health station seed";
const STATION_CODE_YEAR = new Date().getFullYear();
const SEED_ACTOR_ID = null as unknown as string;

const requireFromWeb = createRequire(
  path.join(__dirname, "../../../apps/web/package.json"),
);
const { createClient } = requireFromWeb("@supabase/supabase-js") as {
  createClient: (
    url: string,
    key: string,
    options?: {
      auth?: { autoRefreshToken?: boolean; persistSession?: boolean };
    },
  ) => any;
};

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function readGeoJson(filename: string): Promise<GeoJsonCollection> {
  const raw = await readFile(path.join(GIS_ROOT, filename), "utf8");
  const parsed = JSON.parse(raw) as Partial<GeoJsonCollection>;

  if (
    !parsed ||
    parsed.type !== "FeatureCollection" ||
    !Array.isArray(parsed.features)
  ) {
    throw new Error(`Invalid GeoJSON file: ${filename}`);
  }

  return parsed as GeoJsonCollection;
}

loadEnvFile(path.join(__dirname, "../../../apps/web/.env.local"));

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function resetHealthStations(): Promise<void> {
  console.log("\nResetting health stations (delete all existing rows)...");

  const { count, error: countError } = await supabase
    .from("health_stations")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw new Error(
      `Failed to count health_stations rows: ${countError.message}`,
    );
  }

  const { error: deleteError } = await supabase
    .from("health_stations")
    .delete()
    .not("id", "is", null);

  if (deleteError) {
    throw new Error(`Failed to clear health_stations: ${deleteError.message}`);
  }

  console.log(`  Cleared ${count ?? 0} health station row(s).`);
}

async function loadCho2Barangays(
  features: GeoJsonFeature[],
): Promise<ActiveBarangayRow[]> {
  const cho2Pcodes = Array.from(
    new Set(
      features
        .map((feature) => asString(feature.properties.ADM4_PCODE))
        .filter(Boolean),
    ),
  ) as string[];

  if (cho2Pcodes.length === 0) {
    throw new Error(
      "No CHO2 barangay pcodes found in cho2_boundaries.geojson.",
    );
  }

  const { data, error } = await supabase
    .from("barangays")
    .select("id, name, pcode, city_barangay_id")
    .eq("is_active", true)
    .in("pcode", cho2Pcodes)
    .order("name");

  if (error) {
    throw new Error(`Failed to load active CHO2 barangays: ${error.message}`);
  }

  const barangays = (data ?? []) as ActiveBarangayRow[];

  if (barangays.length !== cho2Pcodes.length) {
    const foundPcodes = new Set(barangays.map((row) => row.pcode));
    const missingPcodes = cho2Pcodes.filter((pcode) => !foundPcodes.has(pcode));
    throw new Error(
      `Expected ${cho2Pcodes.length} active CHO2 barangays, found ${barangays.length}. Run seed_city_barangays.ts first. Missing pcodes: ${missingPcodes.join(", ")}`,
    );
  }

  return barangays;
}

async function seedHealthStations(
  barangays: ActiveBarangayRow[],
): Promise<void> {
  console.log(`\nSeeding ${barangays.length} health stations...`);

  let seeded = 0;
  let failed = 0;

  for (const [index, barangay] of barangays.entries()) {
    const stationCode = `BHS-${STATION_CODE_YEAR}-${String(index + 1).padStart(6, "0")}`;
    const stationName = `${barangay.name} Health Station`;

    const { data: station, error: stationError } = await supabase.rpc(
      "upsert_health_station",
      {
        p_actor_id: SEED_ACTOR_ID,
        p_station_id: null,
        p_station_code: stationCode,
        p_name: stationName,
        p_facility_type: "bhs",
        p_physical_city_barangay_id: barangay.city_barangay_id,
        p_address: `${barangay.name}, Dasmarinas City`,
        p_notes: HEALTH_STATION_IMPORT_REASON,
        p_is_active: true,
        p_deactivation_reason: null,
        p_latitude: null,
        p_longitude: null,
      },
    );

    if (stationError) {
      failed++;
      console.error(
        `  Error creating station for ${barangay.name} (${barangay.pcode}): ${stationError.message}`,
      );
      continue;
    }

    const stationId = (station as HealthStationRpcRow | null)?.id;
    if (!stationId) {
      failed++;
      console.error(
        `  Error creating station for ${barangay.name} (${barangay.pcode}): missing station id`,
      );
      continue;
    }

    const { error: coverageError } = await supabase.rpc(
      "replace_health_station_coverage",
      {
        p_actor_id: SEED_ACTOR_ID,
        p_health_station_id: stationId,
        p_rows: [
          {
            barangay_id: barangay.id,
            is_primary: true,
            is_active: true,
            notes: HEALTH_STATION_IMPORT_REASON,
          },
        ],
      },
    );

    if (coverageError) {
      failed++;
      console.error(
        `  Error assigning coverage for ${stationName}: ${coverageError.message}`,
      );
      continue;
    }

    seeded++;
  }

  console.log(`  Done - seeded: ${seeded}, failed: ${failed}`);

  if (failed > 0) {
    throw new Error(`Health station seed completed with ${failed} failure(s).`);
  }
}

async function main(): Promise<void> {
  console.log("=== Seeding health stations ===");
  console.log(`Supabase URL: ${SUPABASE_URL}`);

  const cho2Geo = await readGeoJson("cho2_boundaries.geojson");
  const barangays = await loadCho2Barangays(cho2Geo.features);

  await resetHealthStations();
  await seedHealthStations(barangays);

  console.log("\n=== Seed complete ===");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
