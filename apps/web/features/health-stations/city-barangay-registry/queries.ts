import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type {
  CityBarangayGeometryVersion,
  CityBarangayImportItem,
  CityBarangayImportJob,
  CityBarangayRegistryData,
  CityBarangayRegistryRecord,
  CityBarangayRegistryStats,
  GeoJsonGeometry,
} from './data/schema'

// Row shape returned by city_barangay_registry_view.
type RegistryViewRow = {
  id: string
  name: string
  pcode: string
  city: string
  source_fid: number | null
  source_date: string | null
  source_valid_on: string | null
  source_valid_to: string | null
  source_area_sqkm: number | null
  source_payload: Record<string, unknown> | null
  updated_at: string | null
  geometry: GeoJsonGeometry
  in_cho_scope: boolean
  version_count: number
}

function mapRegistryRow(row: RegistryViewRow): CityBarangayRegistryRecord {
  return {
    id: row.id,
    name: row.name,
    pcode: row.pcode,
    city: row.city,
    sourceFid: row.source_fid ?? 0,
    sourceDate: row.source_date ?? '',
    sourceValidOn: row.source_valid_on ?? '',
    sourceValidTo: row.source_valid_to ?? null,
    sourceAreaSqKm: row.source_area_sqkm ?? 0,
    inCho2Scope: row.in_cho_scope,
    geometry: row.geometry,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sourcePayload: (row.source_payload ?? {}) as any,
    versionCount: row.version_count ?? 0,
    updatedAt: row.updated_at ?? row.source_valid_on ?? '',
  }
}

function buildStats(records: CityBarangayRegistryRecord[]): CityBarangayRegistryStats {
  const sourceDates = new Set(records.map((r) => r.sourceDate).filter(Boolean))
  const validOnDates = new Set(records.map((r) => r.sourceValidOn).filter(Boolean))
  const latestUpdatedAt = records
    .map((r) => r.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null

  return {
    totalBarangays: records.length,
    inCho2Scope: records.filter((r) => r.inCho2Scope).length,
    outsideCho2Scope: records.filter((r) => !r.inCho2Scope).length,
    sourceDate: sourceDates.size === 1 ? [...sourceDates][0] : null,
    validOn: validOnDates.size === 1 ? [...validOnDates][0] : null,
    totalAreaSqKm: records.reduce((sum, r) => sum + r.sourceAreaSqKm, 0),
    latestUpdatedAt,
  }
}

function buildEmptyImportJob(): CityBarangayImportJob {
  return {
    id: '',
    filename: '',
    status: 'uploaded',
    totalFeatures: 0,
    validFeatures: 0,
    errorFeatures: 0,
    duplicateFeatures: 0,
    payloadSizeBytes: 0,
    createdAt: new Date().toISOString(),
    validatedAt: null,
    committedAt: null,
  }
}

export const getCityBarangayRegistryData = cache(
  async (): Promise<CityBarangayRegistryData> => {
    const supabase = await createClient()

    const { data: rows, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('city_barangay_registry_view' as any)
      .select('*')

    if (error) throw error

    const records = ((rows ?? []) as unknown as RegistryViewRow[])
      .map(mapRegistryRow)
      .sort((a, b) => a.name.localeCompare(b.name))

    // Fetch geometry versions (one query for all, grouped client-side).
    const { data: versionRows } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('city_barangay_geometry_versions' as any)
      .select('id, city_barangay_id, version_no, change_type, reason, changed_by, changed_at, source_payload')
      .order('version_no', { ascending: false })

    const geometryVersions: CityBarangayGeometryVersion[] = (
      (versionRows ?? []) as unknown as {
        id: string
        city_barangay_id: string
        version_no: number
        change_type: string
        reason: string
        changed_by: string | null
        changed_at: string
        source_payload: Record<string, unknown>
      }[]
    ).map((v) => ({
      id: v.id,
      cityBarangayId: v.city_barangay_id,
      versionNo: v.version_no,
      changeType: v.change_type as CityBarangayGeometryVersion['changeType'],
      reason: v.reason,
      changedBy: v.changed_by ?? 'System',
      changedAt: v.changed_at,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sourcePayload: (v.source_payload ?? {}) as any,
    }))

    // Fetch latest import job (if any).
    const { data: jobRow } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('city_barangay_import_jobs' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let importJob: CityBarangayImportJob = buildEmptyImportJob()
    let importItems: CityBarangayImportItem[] = []

    if (jobRow) {
      const j = jobRow as unknown as {
        id: string
        filename: string
        status: string
        total_features: number
        valid_features: number
        error_features: number
        duplicate_features: number
        payload_size_bytes: number | null
        created_at: string
        validated_at: string | null
        committed_at: string | null
      }
      importJob = {
        id: j.id,
        filename: j.filename,
        status: j.status as CityBarangayImportJob['status'],
        totalFeatures: j.total_features,
        validFeatures: j.valid_features,
        errorFeatures: j.error_features,
        duplicateFeatures: j.duplicate_features,
        payloadSizeBytes: j.payload_size_bytes ?? 0,
        createdAt: j.created_at,
        validatedAt: j.validated_at,
        committedAt: j.committed_at,
      }

      const { data: itemRows } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('city_barangay_import_items' as any)
        .select('*')
        .eq('job_id', j.id)
        .order('feature_index')

      importItems = ((itemRows ?? []) as unknown as {
        id: string
        job_id: string
        feature_index: number
        pcode: string | null
        name: string | null
        action: string
        validation_errors: string[]
        normalized_geometry: GeoJsonGeometry | null
        source_payload: Record<string, unknown> | null
        selected_overwrite: boolean
        existing_city_barangay_id: string | null
        processed_at: string | null
      }[]).map((item) => ({
        id: item.id,
        jobId: item.job_id,
        featureIndex: item.feature_index,
        pcode: item.pcode,
        name: item.name,
        action: item.action as CityBarangayImportItem['action'],
        validationErrors: item.validation_errors ?? [],
        geometry: item.normalized_geometry,
        selectedOverwrite: item.selected_overwrite,
        existingCityBarangayId: item.existing_city_barangay_id,
        existingBarangayName: null,
        processedAt: item.processed_at,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sourcePayload: (item.source_payload ?? null) as any,
      }))
    }

    return {
      records,
      geometryVersions,
      importJob,
      importItems,
      stats: buildStats(records),
    }
  }
)

export async function getGeometryVersions(
  cityBarangayId: string
): Promise<CityBarangayGeometryVersion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('city_barangay_geometry_versions' as any)
    .select('id, city_barangay_id, version_no, change_type, reason, changed_by, changed_at, source_payload')
    .eq('city_barangay_id', cityBarangayId)
    .order('version_no', { ascending: false })

  if (error) throw error

  return ((data ?? []) as unknown as {
    id: string
    city_barangay_id: string
    version_no: number
    change_type: string
    reason: string
    changed_by: string | null
    changed_at: string
    source_payload: Record<string, unknown>
  }[]).map((v) => ({
    id: v.id,
    cityBarangayId: v.city_barangay_id,
    versionNo: v.version_no,
    changeType: v.change_type as CityBarangayGeometryVersion['changeType'],
    reason: v.reason,
    changedBy: v.changed_by ?? 'System',
    changedAt: v.changed_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sourcePayload: (v.source_payload ?? {}) as any,
  }))
}
