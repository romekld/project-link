/**
 * Seed script: creates realistic synthetic staff accounts for the current health stations.
 *
 * For each active health station:
 *   - 1 RHM / midwife
 *   - 5 BHWs
 *
 * City-wide staff:
 *   - 3 PHNs
 *   - 5 CHOs
 *
 * Prerequisites:
 *   1. Apply all migrations
 *   2. Seed or create health_stations first
 *   3. Have apps/web/.env.local present (keys are read from there automatically)
 *
 * Run from project-link/packages/supabase/:
 *   npx tsx seeds/seed_users.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { faker } from "@faker-js/faker";
import {
  createRandomAvatarSeed,
  createUserAvatarDataUri,
} from "../../../apps/web/features/admin/users/data/avatar";

type UserRole = "bhw" | "rhm" | "phn" | "cho" | "system_admin";

type HealthStationRow = {
  id: string;
  name: string;
  station_code: string | null;
};

type AuthUser = {
  id: string;
  email?: string;
};

type PersonName = {
  firstName: string;
  middleName: string;
  lastName: string;
  sex: "M" | "F";
};

type SeedUser = {
  role: Exclude<UserRole, "system_admin">;
  email: string;
  username: string;
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  sex: "M" | "F";
  dateOfBirth: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  cityMunicipality: string;
  province: string;
  healthStationId: string | null;
  purokAssignment: string | null;
  coverageNotes: string | null;
  profilePhotoUrl: string;
};

const __dirname = fileURLToPath(new URL(".", import.meta.url));
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

const DEFAULT_PASSWORD = "projectlink@cho2";
const USER_ID_YEAR = new Date().getFullYear();
const SEED_USER_ID_OFFSET = 900000;
const MAX_SEED_USERS = 100;
const BHW_PER_STATION = 5;
const PHN_COUNT = 3;
const CHO_COUNT = 5;
const FAKER_SEED = 20260423;
const CREATED_NOTE =
  "Seeded staff account for user management and role dashboard testing.";
const EMAIL_PROVIDERS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "icloud.com",
  "proton.me",
] as const;

const rolePrefixes: Record<SeedUser["role"], string> = {
  bhw: "BHW",
  rhm: "RHM",
  phn: "PHN",
  cho: "CHO",
};

faker.seed(FAKER_SEED);

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

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function createUserId(role: SeedUser["role"], sequence: number): string {
  return `${rolePrefixes[role]}-${USER_ID_YEAR}-${String(SEED_USER_ID_OFFSET + sequence).padStart(6, "0")}`;
}

function createDateOfBirth(sequence: number, role: SeedUser["role"]): string {
  const ageRange =
    role === "cho"
      ? { min: 42, max: 64 }
      : role === "phn"
        ? { min: 30, max: 52 }
        : { min: 22, max: 50 };
  const date = faker.date.birthdate({ mode: "age", ...ageRange });
  return date.toISOString().slice(0, 10);
}

function createMobileNumber(sequence: number): string {
  return `09${String(170000000 + sequence).padStart(9, "0")}`;
}

function stationDisplayName(station: HealthStationRow): string {
  return station.name.replace(/\s+Health Station$/i, "").trim();
}

function createPersonName(role: SeedUser["role"], sequence: number): PersonName {
  const preferFemale =
    role === "rhm" ||
    role === "phn" ||
    (role === "bhw" && sequence % 4 !== 0) ||
    (role === "cho" && sequence % 2 !== 0);
  const fakerSex = preferFemale ? "female" : "male";

  return {
    firstName: faker.person.firstName(fakerSex),
    middleName: faker.person.middleName(fakerSex),
    lastName: faker.person.lastName(fakerSex),
    sex: preferFemale ? "F" : "M",
  };
}

const usedSeedEmails = new Set<string>();

function createSeedEmail(person: PersonName) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const email = faker.internet.email({
      firstName: person.firstName,
      lastName: person.lastName,
      provider: faker.helpers.arrayElement(EMAIL_PROVIDERS),
      allowSpecialCharacters: false,
    }).toLowerCase();

    if (!usedSeedEmails.has(email)) {
      usedSeedEmails.add(email);
      return email;
    }
  }

  const fallback = faker.internet.email({
    firstName: person.firstName,
    lastName: `${person.lastName}${faker.string.numeric(4)}`,
    provider: faker.helpers.arrayElement(EMAIL_PROVIDERS),
    allowSpecialCharacters: false,
  }).toLowerCase();
  usedSeedEmails.add(fallback);
  return fallback;
}

function createSeedUsername(
  role: SeedUser["role"],
  person: PersonName,
  sequence: number,
) {
  return `${role}.${slugify(person.firstName)}.${slugify(person.lastName)}.${String(sequence).padStart(3, "0")}`;
}

function buildStationUsers(stations: HealthStationRow[]): SeedUser[] {
  const users: SeedUser[] = [];
  let rhmSequence = 1;
  let bhwSequence = 1;

  for (const [stationIndex, station] of stations.entries()) {
    const displayName = stationDisplayName(station);
    const addressLine2 = displayName.replace(/^BHS\s+/i, "");
    const rhmUserSequence = rhmSequence++;
    const rhmPerson = createPersonName("rhm", rhmUserSequence);

    users.push({
      role: "rhm",
      email: createSeedEmail(rhmPerson),
      username: createSeedUsername("rhm", rhmPerson, rhmUserSequence),
      userId: createUserId("rhm", rhmUserSequence),
      firstName: rhmPerson.firstName,
      middleName: rhmPerson.middleName,
      lastName: rhmPerson.lastName,
      sex: rhmPerson.sex,
      dateOfBirth: createDateOfBirth(rhmUserSequence, "rhm"),
      mobileNumber: createMobileNumber(1000 + stationIndex),
      addressLine1: "Assigned barangay health station",
      addressLine2,
      cityMunicipality: "Dasmarinas City",
      province: "Cavite",
      healthStationId: station.id,
      purokAssignment: null,
      coverageNotes: `Primary RHM assignment for ${station.name}.`,
      profilePhotoUrl: createUserAvatarDataUri({
        userId: createUserId("rhm", rhmUserSequence),
        firstName: rhmPerson.firstName,
        lastName: rhmPerson.lastName,
        role: "rhm",
        sex: rhmPerson.sex,
      }, {
        seed: createRandomAvatarSeed(),
      }),
    });

    for (let bhwIndex = 1; bhwIndex <= BHW_PER_STATION; bhwIndex++) {
      const bhwUserSequence = bhwSequence++;
      const bhwPerson = createPersonName("bhw", bhwUserSequence);

      users.push({
        role: "bhw",
        email: createSeedEmail(bhwPerson),
        username: createSeedUsername("bhw", bhwPerson, bhwUserSequence),
        userId: createUserId("bhw", bhwUserSequence),
        firstName: bhwPerson.firstName,
        middleName: bhwPerson.middleName,
        lastName: bhwPerson.lastName,
        sex: bhwPerson.sex,
        dateOfBirth: createDateOfBirth(bhwUserSequence, "bhw"),
        mobileNumber: createMobileNumber(2000 + stationIndex * 10 + bhwIndex),
        addressLine1: `Purok ${bhwIndex}`,
        addressLine2,
        cityMunicipality: "Dasmarinas City",
        province: "Cavite",
        healthStationId: station.id,
        purokAssignment: `Purok ${bhwIndex}`,
        coverageNotes: `BHW ${bhwIndex} assignment for ${station.name}.`,
        profilePhotoUrl: createUserAvatarDataUri({
          userId: createUserId("bhw", bhwUserSequence),
          firstName: bhwPerson.firstName,
          lastName: bhwPerson.lastName,
          role: "bhw",
          sex: bhwPerson.sex,
        }, {
          seed: createRandomAvatarSeed(),
        }),
      });
    }
  }

  return users;
}

function buildCityWideUsers(): SeedUser[] {
  const users: SeedUser[] = [];

  for (let index = 1; index <= PHN_COUNT; index++) {
    const phnPerson = createPersonName("phn", index);

    users.push({
      role: "phn",
      email: createSeedEmail(phnPerson),
      username: createSeedUsername("phn", phnPerson, index),
      userId: createUserId("phn", index),
      firstName: phnPerson.firstName,
      middleName: phnPerson.middleName,
      lastName: phnPerson.lastName,
      sex: phnPerson.sex,
      dateOfBirth: createDateOfBirth(index, "phn"),
      mobileNumber: createMobileNumber(3000 + index),
      addressLine1: "City Health Office II",
      addressLine2: null,
      cityMunicipality: "Dasmarinas City",
      province: "Cavite",
      healthStationId: null,
      purokAssignment: null,
      coverageNotes: "City-wide PHN account.",
      profilePhotoUrl: createUserAvatarDataUri({
        userId: createUserId("phn", index),
        firstName: phnPerson.firstName,
        lastName: phnPerson.lastName,
        role: "phn",
        sex: phnPerson.sex,
      }, {
        seed: createRandomAvatarSeed(),
      }),
    });
  }

  for (let index = 1; index <= CHO_COUNT; index++) {
    const choPerson = createPersonName("cho", index);

    users.push({
      role: "cho",
      email: createSeedEmail(choPerson),
      username: createSeedUsername("cho", choPerson, index),
      userId: createUserId("cho", index),
      firstName: choPerson.firstName,
      middleName: choPerson.middleName,
      lastName: choPerson.lastName,
      sex: choPerson.sex,
      dateOfBirth: createDateOfBirth(index, "cho"),
      mobileNumber: createMobileNumber(4000 + index),
      addressLine1: "City Health Office II",
      addressLine2: null,
      cityMunicipality: "Dasmarinas City",
      province: "Cavite",
      healthStationId: null,
      purokAssignment: null,
      coverageNotes: "City-wide CHO account.",
      profilePhotoUrl: createUserAvatarDataUri({
        userId: createUserId("cho", index),
        firstName: choPerson.firstName,
        lastName: choPerson.lastName,
        role: "cho",
        sex: choPerson.sex,
      }, {
        seed: createRandomAvatarSeed(),
      }),
    });
  }

  return users;
}

loadEnvFile(path.join(__dirname, "../../../apps/web/.env.local"));
loadEnvFile(path.join(__dirname, "../../../.env"));

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

function isProtectedEmail(email?: string): boolean {
  if (!email) return true;
  return email.toLowerCase().endsWith("@projectlink.ph");
}

async function emptyUsersExceptProjectLinkDomain(): Promise<void> {
  console.log("\nCleaning existing users (except @projectlink.ph)...");

  const usersByEmail = await listAuthUsersByEmail();
  const deletableAuthUsers = Array.from(usersByEmail.values()).filter(
    (user) => !isProtectedEmail(user.email),
  );

  const { error: profileDeleteError } = await supabase
    .from("profiles")
    .delete()
    .not("email", "ilike", "%@projectlink.ph");

  if (profileDeleteError) {
    throw new Error(
      `Failed to clean profiles before seeding: ${profileDeleteError.message}`,
    );
  }

  let deletedAuthUsers = 0;
  for (const user of deletableAuthUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      throw new Error(
        `Failed to delete auth user ${user.email ?? user.id}: ${error.message}`,
      );
    }
    deletedAuthUsers++;
  }

  console.log(
    `  Cleanup complete - removed ${deletedAuthUsers} auth users and non-projectlink profiles.`,
  );
}

async function listAuthUsersByEmail(): Promise<Map<string, AuthUser>> {
  const usersByEmail = new Map<string, AuthUser>();
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Failed to list auth users: ${error.message}`);
    }

    const users = (data?.users ?? []) as AuthUser[];
    for (const user of users) {
      if (user.email) {
        usersByEmail.set(user.email.toLowerCase(), user);
      }
    }

    if (users.length < perPage) break;
    page++;
  }

  return usersByEmail;
}

async function ensureAuthUser(
  user: SeedUser,
  usersByEmail: Map<string, AuthUser>,
): Promise<AuthUser> {
  const existing = usersByEmail.get(user.email.toLowerCase());
  if (existing) return existing;

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: { role: user.role },
  });

  if (error) {
    throw new Error(`Failed to create auth user ${user.email}: ${error.message}`);
  }

  const authUser = data.user as AuthUser | null;
  if (!authUser?.id) {
    throw new Error(`Failed to create auth user ${user.email}: missing user id`);
  }

  usersByEmail.set(user.email.toLowerCase(), authUser);
  return authUser;
}

async function loadActiveHealthStations(): Promise<HealthStationRow[]> {
  const { data, error } = await supabase
    .from("health_stations")
    .select("id, name, station_code")
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(`Failed to load active health stations: ${error.message}`);
  }

  const stations = (data ?? []) as HealthStationRow[];
  if (stations.length === 0) {
    throw new Error(
      "No active health stations found. Run seed_health_stations.ts or create stations first.",
    );
  }

  return stations;
}

async function upsertProfile(user: SeedUser, authUser: AuthUser): Promise<void> {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: authUser.id,
      user_id: user.userId,
      email: user.email,
      first_name: user.firstName,
      middle_name: user.middleName ?? null,
      last_name: user.lastName,
      name_suffix: null,
      date_of_birth: user.dateOfBirth,
      sex: user.sex,
      username: user.username,
      mobile_number: user.mobileNumber,
      alternate_mobile_number: null,
      address_line_1: user.addressLine1,
      address_line_2: user.addressLine2,
      city_municipality: user.cityMunicipality,
      province: user.province,
      role: user.role,
      health_station_id: user.healthStationId,
      purok_assignment: user.purokAssignment,
      coverage_notes: user.coverageNotes,
      admin_notes: CREATED_NOTE,
      profile_photo_url: user.profilePhotoUrl,
      must_change_password: true,
      status: "active",
      deactivation_reason: null,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Failed to upsert profile ${user.email}: ${error.message}`);
  }
}

async function seedUsers(users: SeedUser[]): Promise<void> {
  console.log(`\nSeeding ${users.length} staff users...`);
  console.log(`Default password: ${DEFAULT_PASSWORD}`);

  const usersByEmail = await listAuthUsersByEmail();
  let createdOrUpdated = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const authUser = await ensureAuthUser(user, usersByEmail);
      await upsertProfile(user, authUser);
      createdOrUpdated++;
      console.log(`  ${user.role.toUpperCase()} ${user.email}`);
    } catch (error) {
      failed++;
      console.error(
        `  Error seeding ${user.email}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  console.log(`  Done - upserted: ${createdOrUpdated}, failed: ${failed}`);

  if (failed > 0) {
    throw new Error(`User seed completed with ${failed} failure(s).`);
  }
}

async function main(): Promise<void> {
  console.log("=== Seeding staff users ===");
  console.log(`Supabase URL: ${SUPABASE_URL}`);

  await emptyUsersExceptProjectLinkDomain();

  const stations = await loadActiveHealthStations();
  const stationUsers = buildStationUsers(stations);
  const cityWideUsers = buildCityWideUsers();
  const stationUserLimit = Math.max(0, MAX_SEED_USERS - cityWideUsers.length);
  const selectedStationUsers = stationUsers.slice(0, stationUserLimit);
  const users = [...selectedStationUsers, ...cityWideUsers];

  console.log(`Active health stations: ${stations.length}`);
  console.log(`Seed cap: ${MAX_SEED_USERS}`);
  console.log(`RHM users: ${users.filter((user) => user.role === "rhm").length}`);
  console.log(`BHW users: ${users.filter((user) => user.role === "bhw").length}`);
  console.log(`PHN users: ${users.filter((user) => user.role === "phn").length}`);
  console.log(`CHO users: ${users.filter((user) => user.role === "cho").length}`);

  await seedUsers(users);

  console.log("\n=== Seed complete ===");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
