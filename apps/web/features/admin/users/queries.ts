import { createAdminClient } from '@/lib/supabase/admin'
import type { AdminUser } from './data/schema'

function mapRow(row: {
  id: string
  user_id: string
  first_name: string
  middle_name: string | null
  last_name: string
  name_suffix: string | null
  date_of_birth: string | null
  sex: 'M' | 'F' | null
  username: string
  email: string
  mobile_number: string | null
  alternate_mobile_number: string | null
  address_line_1: string | null
  address_line_2: string | null
  city_municipality: string | null
  province: string | null
  status: AdminUser['status']
  role: AdminUser['role']
  health_station_id: string | null
  purok_assignment: string | null
  coverage_notes: string | null
  admin_notes: string | null
  profile_photo_url: string | null
  deactivation_reason: string | null
  must_change_password: boolean
  last_login_at: string | null
  password_changed_at: string | null
  created_at: string
  updated_at: string
  health_station: { name: string; station_code: string | null } | null
}): AdminUser {
  return {
    id: row.id,
    userId: row.user_id,
    firstName: row.first_name,
    middleName: row.middle_name ?? undefined,
    lastName: row.last_name,
    nameSuffix: row.name_suffix ?? undefined,
    dateOfBirth: row.date_of_birth ?? undefined,
    sex: row.sex ?? undefined,
    username: row.username,
    email: row.email,
    mobileNumber: row.mobile_number ?? '',
    alternateMobileNumber: row.alternate_mobile_number ?? undefined,
    addressLine1: row.address_line_1 ?? undefined,
    addressLine2: row.address_line_2 ?? undefined,
    cityMunicipality: row.city_municipality ?? undefined,
    province: row.province ?? undefined,
    status: row.status,
    role: row.role,
    healthStationName: row.health_station?.name ?? null,
    healthStationId: row.health_station_id,
    healthStationCode: row.health_station?.station_code ?? null,
    purokAssignment: row.purok_assignment ?? undefined,
    coverageNotes: row.coverage_notes ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
    profilePhotoUrl: row.profile_photo_url ?? undefined,
    deactivationReason: row.deactivation_reason ?? undefined,
    mustChangePassword: row.must_change_password,
    lastLoginAt: row.last_login_at,
    passwordChangedAt: row.password_changed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const PROFILE_SELECT = `
  id,
  user_id,
  first_name,
  middle_name,
  last_name,
  name_suffix,
  date_of_birth,
  sex,
  username,
  email,
  mobile_number,
  alternate_mobile_number,
  address_line_1,
  address_line_2,
  city_municipality,
  province,
  status,
  role,
  health_station_id,
  purok_assignment,
  coverage_notes,
  admin_notes,
  profile_photo_url,
  deactivation_reason,
  must_change_password,
  last_login_at,
  password_changed_at,
  created_at,
  updated_at,
  health_station:health_stations!profiles_health_station_id_fkey (
    name,
    station_code
  )
` as const

export async function getUsers(): Promise<AdminUser[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) =>
    mapRow(row as Parameters<typeof mapRow>[0])
  )
}

export async function getUser(id: string): Promise<AdminUser | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', id)
    .single()

  if (error || !data) return null

  return mapRow(data as Parameters<typeof mapRow>[0])
}

export async function getRoleUserCounts(): Promise<Record<string, number>> {
  const supabase = createAdminClient()

  const { data } = await supabase.from('profiles').select('role')

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.role] = (counts[row.role] ?? 0) + 1
  }
  return counts
}

export async function getHealthStations() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('health_stations')
    .select('id, name, station_code')
    .eq('is_active', true)
    .order('name')

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    stationCode: (row.station_code as string | null) ?? '',
  }))
}
