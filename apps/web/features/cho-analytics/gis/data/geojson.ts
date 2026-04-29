import type {
  GisPointFeatureCollection,
  GisPolygonFeatureCollection,
} from '@/features/gis-map/data/types'

import type {
  ChoAnalyticsGisData,
  ChoStationPoint,
  ChoTimeWindow,
} from './schema'

const CHOROPLETH_BUCKETS = [
  {
    fill: '#fee2e2',
    line: '#fca5a5',
    opacity: 0.24,
  },
  {
    fill: '#fecaca',
    line: '#f87171',
    opacity: 0.3,
  },
  {
    fill: '#fca5a5',
    line: '#ef4444',
    opacity: 0.36,
  },
  {
    fill: '#fb7185',
    line: '#e11d48',
    opacity: 0.42,
  },
  {
    fill: '#dc2626',
    line: '#991b1b',
    opacity: 0.48,
  },
] as const

export function toChoAnalyticsPolygonFeatureCollection(
  barangays: ChoAnalyticsGisData['barangays'],
  timeWindow: ChoTimeWindow,
  choroplethEnabled: boolean
): GisPolygonFeatureCollection {
  const scores = barangays.map(
    (barangay) => barangay.analyticsByWindow[timeWindow].burdenScore
  )
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)
  const scoreRange = Math.max(maxScore - minScore, 1)

  return {
    type: 'FeatureCollection',
    features: barangays.map((barangay) => {
      const analytics = barangay.analyticsByWindow[timeWindow]
      const bucket =
        CHOROPLETH_BUCKETS[
          Math.min(
            CHOROPLETH_BUCKETS.length - 1,
            Math.floor(
              ((analytics.burdenScore - minScore) / scoreRange) *
                CHOROPLETH_BUCKETS.length
            )
          )
        ] ?? CHOROPLETH_BUCKETS[0]

      return {
        type: 'Feature',
        id: barangay.id,
        geometry: barangay.geometry,
        properties: {
          id: barangay.id,
          name: barangay.name,
          pcode: barangay.pcode,
          inCho2Scope: barangay.inCho2Scope,
          burdenScore: analytics.burdenScore,
          caseCount: analytics.caseCount,
          alertCount: analytics.alertCount,
          rank: analytics.rank,
          fillColor: choroplethEnabled ? bucket.fill : '#cbd5e1',
          fillOpacity: choroplethEnabled
            ? bucket.opacity
            : barangay.inCho2Scope
              ? 0.16
              : 0.1,
          lineColor: choroplethEnabled
            ? bucket.line
            : barangay.inCho2Scope
              ? '#475569'
              : '#94a3b8',
        },
      }
    }),
  }
}

export function toChoAnalyticsStationPointFeatureCollection(
  stationPoints: ChoStationPoint[]
): GisPointFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: stationPoints.map((station) => ({
      type: 'Feature',
      id: station.id,
      geometry: {
        type: 'Point',
        coordinates: [station.coordinates.lng, station.coordinates.lat],
      },
      properties: {
        id: station.id,
        name: station.name,
        pcode: station.physicalBarangayPcode,
        pinStatus: station.pinStatus,
        stationCode: station.stationCode,
        facilityType: station.facilityType,
        source: station.source,
      },
    })),
  }
}
