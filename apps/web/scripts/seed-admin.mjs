/**
 * seed-admin.mjs
 *
 * Creates the first system_admin test account.
 * Run once from apps/web:
 *   node scripts/seed-admin.mjs
 *
 * Reads credentials from .env.local automatically.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// ── load .env.local ─────────────────────────────────────────────────────────
const __dir = fileURLToPath(new URL('.', import.meta.url))
const envPath = resolve(__dir, '..', '.env.local')

function loadEnv(path) {
  const env = {}
  try {
    const lines = readFileSync(path, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
    }
  } catch {
    console.error('Could not read .env.local — make sure you run this from apps/web/')
    process.exit(1)
  }
  return env
}

const env = loadEnv(envPath)
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// ── seed config — change these before running ────────────────────────────────
const SEED_USER = {
  email: 'admin@projectlink.ph',
  password: 'projectlink@cho2',   // ≥ 12 chars — user will be forced to change this
  firstName: 'System',
  lastName: 'Admin',
  username: 'system.admin',
}

// ── helpers ──────────────────────────────────────────────────────────────────
async function adminFetch(path, body) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(json))
  return json
}

async function restInsert(table, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(json))
  return json
}

// ── main ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`\nSeeding system_admin: ${SEED_USER.email}`)

  // 1. Create auth user
  let authUser
  try {
    const result = await adminFetch('/auth/v1/admin/users', {
      email: SEED_USER.email,
      password: SEED_USER.password,
      email_confirm: true,
      user_metadata: { role: 'system_admin' },
    })
    authUser = result
    console.log(`✓  Auth user created — id: ${authUser.id}`)
  } catch (err) {
    const msg = String(err)
    if (msg.includes('already been registered') || msg.includes('already exists')) {
      console.log('⚠  Auth user already exists — fetching existing user')
      const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(SEED_USER.email)}`, {
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          apikey: SERVICE_ROLE_KEY,
        },
      })
      const data = await res.json()
      authUser = data?.users?.[0]
      if (!authUser) {
        console.error('Could not retrieve existing auth user', data)
        process.exit(1)
      }
      console.log(`  Existing auth user id: ${authUser.id}`)
    } else {
      console.error('Failed to create auth user:', err.message)
      process.exit(1)
    }
  }

  // 2. Insert profile
  const userId = 'USR-2026-0001'
  const profileRow = {
    id: authUser.id,
    user_id: userId,
    email: SEED_USER.email,
    first_name: SEED_USER.firstName,
    last_name: SEED_USER.lastName,
    username: SEED_USER.username,
    role: 'system_admin',
    status: 'active',
    must_change_password: true,
    health_station_id: null,
  }

  try {
    await restInsert('profiles', profileRow)
    console.log(`✓  Profile inserted — user_id: ${userId}`)
  } catch (err) {
    const msg = String(err)
    if (msg.includes('duplicate key') || msg.includes('already exists') || msg.includes('23505')) {
      console.log('⚠  Profile row already exists — skipping')
    } else {
      console.error('Failed to insert profile:', err.message)
      process.exit(1)
    }
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Seed complete. Test credentials:

   URL      : http://localhost:3000/login
   Email    : ${SEED_USER.email}
   Password : ${SEED_USER.password}

 On first login you will be redirected
 to /change-password (must_change_password = true).
 After changing password → /admin/users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

seed()
