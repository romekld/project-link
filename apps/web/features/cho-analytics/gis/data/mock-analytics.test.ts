import { describe, expect, it } from 'vitest'

import type { CityBarangayRegistryRecord } from '@/features/health-stations/city-barangay-registry/data/schema'

import { buildChoAnalyticsMockBundle } from './mock-analytics'
import type { ChoStationPoint } from './schema'

const sampleBarangays: CityBarangayRegistryRecord[] = [
  {
    id: 'barangay-1',
    name: 'Sample One',
    pcode: '042106001',
    city: 'Dasmarinas City',
    sourceFid: 1,
    sourceDate: '2026-04-01',
    sourceValidOn: '2026-04-01',
    sourceValidTo: null,
    sourceAreaSqKm: 1.5,
    inCho2Scope: true,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [120.94, 14.31],
          [120.95, 14.31],
          [120.95, 14.32],
          [120.94, 14.32],
          [120.94, 14.31],
        ],
      ],
    },
    sourcePayload: {
      fid: 1,
      ADM4_EN: 'Sample One',
      ADM4_PCODE: '042106001',
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
  },
  {
    id: 'barangay-2',
    name: 'Sample Two',
    pcode: '042106002',
    city: 'Dasmarinas City',
    sourceFid: 2,
    sourceDate: '2026-04-01',
    sourceValidOn: '2026-04-01',
    sourceValidTo: null,
    sourceAreaSqKm: 1.8,
    inCho2Scope: false,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [120.96, 14.31],
          [120.97, 14.31],
          [120.97, 14.32],
          [120.96, 14.32],
          [120.96, 14.31],
        ],
      ],
    },
    sourcePayload: {
      fid: 2,
      ADM4_EN: 'Sample Two',
      ADM4_PCODE: '042106002',
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
      AREA_SQKM: 1.8,
    },
    versionCount: 1,
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
]

const sampleStations: ChoStationPoint[] = [
  {
    id: 'station-1',
    stationCode: 'BHS-001',
    name: 'Main Station',
    facilityType: 'main_bhs',
    pinStatus: 'pinned',
    physicalBarangayName: 'Sample One',
    physicalBarangayPcode: '042106001',
    coordinates: {
      lat: 14.315,
      lng: 120.945,
    },
    source: 'saved',
  },
]

describe('buildChoAnalyticsMockBundle', () => {
  it('returns deterministic GIS analytics windows and enriches barangays', () => {
    const generatedAt = new Date('2026-04-29T00:00:00.000Z')
    const result = buildChoAnalyticsMockBundle(
      sampleBarangays,
      sampleStations,
      generatedAt
    )

    expect(result.barangays).toHaveLength(2)
    expect(result.barangays[0]?.analyticsByWindow['30d'].burdenScore).toBeGreaterThan(0)
    expect(result.barangays[0]?.stationIds).toEqual(['station-1'])
    expect(result.windows['30d'].topBarangays).toHaveLength(2)
    expect(result.windows['30d'].trend).toHaveLength(6)
    expect(result.windows['30d'].heatPoints.length).toBeGreaterThan(0)
    expect(result.windows['30d'].alerts.length).toBeGreaterThan(0)
  })
})
