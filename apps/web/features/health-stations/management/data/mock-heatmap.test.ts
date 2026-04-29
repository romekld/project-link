import { describe, expect, it } from 'vitest'
import type { CityBarangayRegistryRecord } from '@/features/health-stations/city-barangay-registry/data/schema'
import type { HealthStation } from './schema'
import { buildMockHeatmapPoints } from './mock-heatmap'

const sampleRegistryRecords: CityBarangayRegistryRecord[] = [
  buildBarangayRecord('barangay-1', 'Burol I', 'PH0402106047', 120.94, 14.31),
  buildBarangayRecord('barangay-2', 'Fatima I', 'PH0402106022', 120.955, 14.315),
  buildBarangayRecord('barangay-3', 'San Andres I', 'PH0402106025', 120.968, 14.325),
  buildBarangayRecord('barangay-4', 'San Mateo', 'PH0402106035', 120.982, 14.337),
  buildBarangayRecord('barangay-5', 'Santa Cruz I', 'PH0402106041', 120.996, 14.348),
]

const sampleStations: HealthStation[] = [
  buildStation('station-1', 'Burol I Health Station', 'PH0402106047', 120.944, 14.314),
  buildStation('station-2', 'Fatima I Health Station', 'PH0402106022', 120.959, 14.318),
  buildStation('station-3', 'San Mateo Health Station', 'PH0402106035', 120.985, 14.34),
]

describe('buildMockHeatmapPoints', () => {
  it('returns deterministic hotspot points with valid coordinates', () => {
    const first = buildMockHeatmapPoints(sampleStations, sampleRegistryRecords)
    const second = buildMockHeatmapPoints(sampleStations, sampleRegistryRecords)

    expect(first).toEqual(second)
    expect(first.length).toBeGreaterThan(60)
    expect(first.every((point) => point.lat > 14 && point.lat < 15)).toBe(true)
    expect(first.every((point) => point.lng > 120 && point.lng < 122)).toBe(true)
  })

  it('produces non-uniform weights across multiple hotspot levels', () => {
    const points = buildMockHeatmapPoints(sampleStations, sampleRegistryRecords)
    const weights = new Set(points.map((point) => point.weight))
    const levels = new Set(points.map((point) => point.level))

    expect(weights.size).toBeGreaterThan(12)
    expect(levels).toEqual(new Set(['critical', 'elevated', 'watch']))
    expect(points.some((point) => point.weight > 1)).toBe(true)
    expect(points.some((point) => point.weight < 0.4)).toBe(true)
  })
})

function buildBarangayRecord(
  id: string,
  name: string,
  pcode: string,
  lng: number,
  lat: number
): CityBarangayRegistryRecord {
  return {
    id,
    name,
    pcode,
    city: 'Dasmarinas City',
    sourceFid: Number(id.replace(/\D/g, '')),
    sourceDate: '2026-04-01',
    sourceValidOn: '2026-04-01',
    sourceValidTo: null,
    sourceAreaSqKm: 1.5,
    inCho2Scope: true,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [lng, lat],
          [lng + 0.01, lat],
          [lng + 0.01, lat + 0.01],
          [lng, lat + 0.01],
          [lng, lat],
        ],
      ],
    },
    sourcePayload: {
      fid: Number(id.replace(/\D/g, '')),
      ADM4_EN: name,
      ADM4_PCODE: pcode,
      ADM4_REF: null,
      ADM3_EN: 'Dasmarinas City',
      ADM3_PCODE: '042106',
      ADM2_EN: 'Cavite',
      ADM2_PCODE: '0421',
      ADM1_EN: 'Calabarzon',
      ADM1_PCODE: '04',
      ADM0_EN: 'Philippines',
      ADM0_PCODE: 'PH',
      date: '2026-04-01',
      validOn: '2026-04-01',
      validTo: null,
      Shape_Leng: 0,
      Shape_Area: 0,
      AREA_SQKM: 1.5,
    },
    versionCount: 1,
    updatedAt: '2026-04-01T00:00:00.000Z',
  }
}

function buildStation(
  id: string,
  name: string,
  physicalBarangayPcode: string,
  longitude: number,
  latitude: number
): HealthStation {
  return {
    id,
    stationCode: `BHS-2026-${id.slice(-1)}`,
    name,
    facilityType: 'bhs',
    status: 'active',
    physicalBarangayName: name.replace(' Health Station', ''),
    physicalBarangayPcode,
    address: null,
    notes: null,
    deactivationReason: null,
    coverageCount: 1,
    primaryCoverageCount: 1,
    assignedStaffCount: 3,
    pinStatus: 'pinned',
    latitude,
    longitude,
    updatedAt: '2026-04-20T08:00:00.000Z',
  }
}
