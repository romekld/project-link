'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { AddStationValues, EditStationValues } from './data/form-schema'
import type { ManagementRouteContext } from './data/route-context'

type ActionResult = { success: true; id?: string } | { error: string }
type ManagementBasePath = ManagementRouteContext['basePath']

function resolveManagementBasePath(basePath?: string): ManagementBasePath {
  return basePath === '/cho/health-stations/manage'
    ? '/cho/health-stations/manage'
    : '/admin/health-stations/manage'
}

async function getActorId(): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

function buildCoveragePayload(coverageRows: AddStationValues['coverageRows']) {
  return coverageRows
    .filter((row) => row.isActive)
    .map((row) => ({
      barangay_id: row.barangayId,
      is_primary: row.isPrimary,
      is_active: true,
      notes: row.notes || null,
    }))
}

export async function createStationAction(
  values: AddStationValues,
  basePath?: string
): Promise<ActionResult> {
  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }
  const resolvedBasePath = resolveManagementBasePath(basePath)

  const admin = createAdminClient()

  const { data: station, error: stationError } = await admin.rpc(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'upsert_health_station' as any,
    {
      p_actor_id: actorId,
      p_station_id: null,
      p_station_code: values.stationCode,
      p_name: values.name,
      p_facility_type: values.facilityType,
      p_physical_city_barangay_id: values.physicalCityBarangayId,
      p_address: values.address || null,
      p_notes: values.notes || null,
      p_is_active: values.isActive,
      p_deactivation_reason: values.deactivationReason || null,
      p_latitude: values.latitude,
      p_longitude: values.longitude,
    }
  )

  if (stationError) return { error: stationError.message }

  const coveragePayload = buildCoveragePayload(values.coverageRows)

  if (coveragePayload.length > 0) {
    const { error: coverageError } = await admin.rpc(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'replace_health_station_coverage' as any,
      {
        p_actor_id: actorId,
        p_health_station_id: (station as { id: string }).id,
        p_rows: coveragePayload,
      }
    )

    if (coverageError) return { error: coverageError.message }
  }

  revalidatePath(resolvedBasePath)
  return { success: true, id: (station as { id: string }).id }
}

export async function updateStationAction(
  stationId: string,
  values: EditStationValues,
  basePath?: string
): Promise<ActionResult> {
  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }
  const resolvedBasePath = resolveManagementBasePath(basePath)

  const admin = createAdminClient()

  const { error: stationError } = await admin.rpc(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'upsert_health_station' as any,
    {
      p_actor_id: actorId,
      p_station_id: stationId,
      p_station_code: values.stationCode,
      p_name: values.name,
      p_facility_type: values.facilityType,
      p_physical_city_barangay_id: values.physicalCityBarangayId,
      p_address: values.address || null,
      p_notes: values.notes || null,
      p_is_active: values.isActive,
      p_deactivation_reason: values.deactivationReason || null,
      p_latitude: values.latitude,
      p_longitude: values.longitude,
    }
  )

  if (stationError) return { error: stationError.message }

  const coveragePayload = buildCoveragePayload(values.coverageRows)

  const { error: coverageError } = await admin.rpc(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'replace_health_station_coverage' as any,
    {
      p_actor_id: actorId,
      p_health_station_id: stationId,
      p_rows: coveragePayload,
    }
  )

  if (coverageError) return { error: coverageError.message }

  revalidatePath(resolvedBasePath)
  revalidatePath(`${resolvedBasePath}/${stationId}/edit`)
  return { success: true }
}

export async function setStationStatusAction(
  ids: string[],
  status: 'active' | 'inactive',
  reason?: string,
  basePath?: string
): Promise<ActionResult> {
  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }
  const resolvedBasePath = resolveManagementBasePath(basePath)

  if (status === 'inactive' && (!reason || !reason.trim())) {
    return { error: 'Deactivation reason is required' }
  }

  const admin = createAdminClient()

  for (const id of ids) {
    const fnName = status === 'inactive' ? 'deactivate_health_station' : 'reactivate_health_station'

    const args =
      status === 'inactive'
        ? { p_actor_id: actorId, p_health_station_id: id, p_reason: reason! }
        : { p_actor_id: actorId, p_health_station_id: id }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await admin.rpc(fnName as any, args as any)
    if (error) return { error: error.message }
  }

  revalidatePath(resolvedBasePath)
  return { success: true }
}
