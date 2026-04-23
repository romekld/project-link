/**
 * Seed script: imports Dasmarinas city barangay polygons from GeoJSON
 * into city_barangays and activates CHO2 coverage in barangays.
 *
 * Prerequisites:
 *   1. Apply all migrations
 *   2. Have apps/web/.env.local present (keys are read from there automatically)
 *
 * Run from project-link/packages/supabase/:
 *   npx tsx seeds/seed_city_barangays.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

type GeoJsonGeometry = {
  type: string;
  coordinates: unknown;
};

type GeoJsonFeature = {
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: Record<string, unknown>;
};

type GeoJsonCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

type CityPcodeRow = {
  pcode: string;
};

type CityBarangayRow = {
  id: string;
  pcode: string;
};

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const GIS_ROOT = path.join(__dirname, "../../../docs/gis");
const CITY_IMPORT_REASON = "Initial GeoJSON seed import";
const COVERAGE_IMPORT_REASON = "Initial CHO2 scope seed";

const requireFromWeb = createRequire(
  path.join(__dirname, "../../../apps/web/package.json"),
);
const { createClient } = requireFromWeb("@supabase/supabase-js") as {
  createClient: (
    url: string,
    key: string,
    options?: { auth?: { persistSession?: boolean } },
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

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asIsoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  if (dateOnly) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
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
  auth: { persistSession: false },
});

async function seedCityBarangays(features: GeoJsonFeature[]): Promise<void> {
  console.log(`\nSeeding ${features.length} city barangays...`);

  const { data: existingRows, error: existingError } = await supabase
    .from("city_barangays")
    .select("pcode");

  if (existingError) {
    throw new Error(
      `Failed to read existing city_barangays: ${existingError.message}`,
    );
  }

  const existingPcodes = new Set(
    ((existingRows ?? []) as CityPcodeRow[]).map((row) => row.pcode),
  );

  let created = 0;
  let overwritten = 0;
  let skipped = 0;
  let failed = 0;

  for (const feature of features) {
    const props = feature.properties;
    const pcode = asString(props.ADM4_PCODE);
    const name = asString(props.ADM4_EN);
    const city = asString(props.ADM3_EN) ?? "Dasmarinas";

    if (!pcode || !name) {
      console.warn(
        `  Skipping feature with missing pcode/name: ${JSON.stringify(props)}`,
      );
      skipped++;
      continue;
    }

    const existedBefore = existingPcodes.has(pcode);

    const { error } = await supabase.rpc("upsert_city_barangay", {
      p_actor_id: null as unknown as string,
      p_name: name,
      p_pcode: pcode,
      p_city: city,
      p_reason: CITY_IMPORT_REASON,
      p_geometry_geojson: feature.geometry,
      p_source_payload: props,
      p_source_fid: asNumber(props.fid),
      p_source_date: asIsoDate(props.date),
      p_source_valid_on: asIsoDate(props.validOn),
      p_source_valid_to: asIsoDate(props.validTo),
      p_source_area_sqkm: asNumber(props.AREA_SQKM),
      p_overwrite: true,
    });

    if (error) {
      failed++;
      console.error(`  Error seeding ${pcode} (${name}): ${error.message}`);
      continue;
    }

    if (existedBefore) {
      overwritten++;
    } else {
      created++;
      existingPcodes.add(pcode);
    }

    const processed = created + overwritten;
    if (processed > 0 && processed % 10 === 0) {
      process.stdout.write(".");
    }
  }

  console.log(
    `\n  Done - created: ${created}, overwritten: ${overwritten}, skipped: ${skipped}, failed: ${failed}`,
  );

  if (failed > 0) {
    throw new Error(`City barangay seed completed with ${failed} failure(s).`);
  }
}

async function seedCho2Barangays(features: GeoJsonFeature[]): Promise<void> {
  const cho2Pcodes = Array.from(
    new Set(
      features
        .map((feature) => asString(feature.properties.ADM4_PCODE))
        .filter(Boolean),
    ),
  ) as string[];

  console.log(`\nActivating ${cho2Pcodes.length} CHO2 scope barangays...`);

  const { data: cityRows, error: cityError } = await supabase
    .from("city_barangays")
    .select("id, pcode")
    .in("pcode", cho2Pcodes);

  if (cityError) {
    throw new Error(
      `Failed to load city_barangays for CHO2 coverage: ${cityError.message}`,
    );
  }

  const cityByPcode = new Map(
    ((cityRows ?? []) as CityBarangayRow[]).map((row) => [row.pcode, row.id]),
  );

  let activated = 0;
  let unchanged = 0;
  let missing = 0;
  let failed = 0;

  for (const pcode of cho2Pcodes) {
    const cityBarangayId = cityByPcode.get(pcode);
    if (!cityBarangayId) {
      console.warn(`  city_barangay not found for pcode ${pcode}`);
      missing++;
      continue;
    }

    const { data, error } = await supabase.rpc(
      "apply_barangay_coverage_change",
      {
        p_actor_id: null as unknown as string,
        p_city_barangay_id: cityBarangayId,
        p_action: "add",
        p_reason: COVERAGE_IMPORT_REASON,
      },
    );

    if (error) {
      failed++;
      console.error(`  Error activating ${pcode}: ${error.message}`);
      continue;
    }

    const action = (data as { action?: string } | null)?.action;
    if (action === "no_change") {
      unchanged++;
    } else {
      activated++;
    }
  }

  console.log(
    `  Done - activated: ${activated}, unchanged: ${unchanged}, missing_city_barangay: ${missing}, failed: ${failed}`,
  );

  if (failed > 0) {
    throw new Error(`CHO2 coverage seed completed with ${failed} failure(s).`);
  }
}

async function main(): Promise<void> {
  console.log("=== Seeding city barangays and CHO2 coverage ===");
  console.log(`Supabase URL: ${SUPABASE_URL}`);

  const [dasmarinasGeo, cho2Geo] = await Promise.all([
    readGeoJson("dasmarinas_boundaries.geojson"),
    readGeoJson("cho2_boundaries.geojson"),
  ]);

  const cho2PcodeCount = new Set(
    cho2Geo.features
      .map((feature) => asString(feature.properties.ADM4_PCODE))
      .filter(Boolean),
  ).size;

  console.log(`City barangays to seed: ${dasmarinasGeo.features.length}`);
  console.log(`CHO2 scope barangays: ${cho2PcodeCount}`);

  await seedCityBarangays(dasmarinasGeo.features);
  await seedCho2Barangays(cho2Geo.features);

  console.log("\n=== Seed complete ===");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
