import { cache } from 'react'

import {
  buildStationPinViews,
} from '@/features/health-stations/pin-map/data'
import { getCityBarangayRegistryData } from '@/features/health-stations/city-barangay-registry/queries'
import { getHealthStations } from '@/features/health-stations/management/queries'

import { buildChoAnalyticsMockBundle } from './data/mock-analytics'
import type { ChoAnalyticsGisData, ChoStationPoint } from './data/schema'

function toChoStationPoints(
  stationViews: ReturnType<typeof buildStationPinViews>
): ChoStationPoint[] {
  return stationViews.map((view) => ({
    id: view.id,
    stationCode: view.station.stationCode,
    name: view.station.name,
    facilityType: view.station.facilityType,
    pinStatus: view.station.pinStatus,
    physicalBarangayName: view.station.physicalBarangayName,
    physicalBarangayPcode: view.station.physicalBarangayPcode,
    coordinates: {
      lat: view.coordinates.lat,
      lng: view.coordinates.lng,
    },
    source: view.source,
  }))
}

export const getChoAnalyticsGisData = cache(
  async (): Promise<ChoAnalyticsGisData> => {
    const generatedAt = new Date()

    const [registryData, stations] = await Promise.all([
      getCityBarangayRegistryData(),
      getHealthStations(),
    ])

    const stationViews = buildStationPinViews(
      stations.filter((station) => station.status === 'active'),
      registryData.records
    )
    const stationPoints = toChoStationPoints(stationViews)
    const mockBundle = buildChoAnalyticsMockBundle(
      registryData.records,
      stationPoints,
      generatedAt
    )

    return {
      generatedAt: generatedAt.toISOString(),
      defaultTimeWindow: '30d',
      availableTimeWindows: ['7d', '30d', '90d'],
      barangays: mockBundle.barangays,
      stationPoints,
      windows: mockBundle.windows,
    }
  }
)
