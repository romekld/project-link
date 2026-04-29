import { getGeometryCentroid } from '@/features/health-stations/pin-map/data'
import type { CityBarangayRegistryRecord } from '@/features/health-stations/city-barangay-registry/data/schema'

import type {
  ChoAlertPreview,
  ChoAlertSeverity,
  ChoAnalyticsGisData,
  ChoAnalyticsKpis,
  ChoAnalyticsTrendPoint,
  ChoAnalyticsWindowData,
  ChoBarangayAnalytics,
  ChoBarangayMapRecord,
  ChoBarangayRankingItem,
  ChoHeatPoint,
  ChoStationPoint,
  ChoTimeWindow,
} from './schema'

const TIME_WINDOWS: ChoTimeWindow[] = ['7d', '30d', '90d']

const WINDOW_MULTIPLIERS: Record<ChoTimeWindow, number> = {
  '7d': 0.42,
  '30d': 1,
  '90d': 2.35,
}

const TREND_WEIGHTS: number[] = [0.11, 0.13, 0.15, 0.17, 0.2, 0.24]

type MockBundle = Pick<ChoAnalyticsGisData, 'barangays' | 'windows'>

export function buildChoAnalyticsMockBundle(
  records: CityBarangayRegistryRecord[],
  stationPoints: ChoStationPoint[],
  generatedAt: Date
): MockBundle {
  const stationIdsByPcode = new Map<string, string[]>()

  for (const station of stationPoints) {
    const existing = stationIdsByPcode.get(station.physicalBarangayPcode) ?? []
    existing.push(station.id)
    stationIdsByPcode.set(station.physicalBarangayPcode, existing)
  }

  const windowAnalytics = Object.fromEntries(
    TIME_WINDOWS.map((window) => [window, buildWindowAnalytics(records, stationPoints, generatedAt, window)])
  ) as Record<ChoTimeWindow, WindowAnalyticsResult>

  const barangays: ChoBarangayMapRecord[] = records.map((record) => ({
    id: record.id,
    name: record.name,
    pcode: record.pcode,
    city: record.city,
    geometry: record.geometry,
    inCho2Scope: record.inCho2Scope,
    areaSqKm: record.sourceAreaSqKm,
    stationIds: stationIdsByPcode.get(record.pcode) ?? [],
    analyticsByWindow: {
      '7d': windowAnalytics['7d'].analyticsByBarangay.get(record.id)!,
      '30d': windowAnalytics['30d'].analyticsByBarangay.get(record.id)!,
      '90d': windowAnalytics['90d'].analyticsByBarangay.get(record.id)!,
    },
  }))

  return {
    barangays,
    windows: {
      '7d': windowAnalytics['7d'].window,
      '30d': windowAnalytics['30d'].window,
      '90d': windowAnalytics['90d'].window,
    },
  }
}

type WindowAnalyticsResult = {
  analyticsByBarangay: Map<string, ChoBarangayAnalytics>
  window: ChoAnalyticsWindowData
}

function buildWindowAnalytics(
  records: CityBarangayRegistryRecord[],
  stationPoints: ChoStationPoint[],
  generatedAt: Date,
  window: ChoTimeWindow
): WindowAnalyticsResult {
  const multiplier = WINDOW_MULTIPLIERS[window]
  const analyticsRows = records.map((record, index) => {
    const pseudoPopulation = 2_500 + (index % 8) * 620 + Math.round(record.sourceAreaSqKm * 90)
    const baseIntensity = (index % 6) + 2 + (record.inCho2Scope ? 2 : 0)
    const caseCount = Math.max(
      3,
      Math.round(baseIntensity * multiplier * 4 + (index % 3) * 2)
    )
    const alertCount = Math.max(
      0,
      Math.floor(caseCount / (window === '7d' ? 11 : window === '30d' ? 15 : 21))
    )
    const incidencePer10k = Number(
      ((caseCount / Math.max(pseudoPopulation, 1)) * 10_000).toFixed(1)
    )
    const trendDeltaPct =
      ((index % 7) - 3) * 4 + (window === '7d' ? 6 : window === '90d' ? -2 : 0)
    const burdenScore = Number(
      (
        caseCount * 1.4 +
        alertCount * 10 +
        incidencePer10k * 0.35 +
        (record.inCho2Scope ? 6 : 0)
      ).toFixed(1)
    )

    return {
      record,
      analytics: {
        caseCount,
        incidencePer10k,
        burdenScore,
        alertCount,
        trendDeltaPct,
        rank: 0,
      } satisfies ChoBarangayAnalytics,
    }
  })

  analyticsRows.sort((left, right) => right.analytics.burdenScore - left.analytics.burdenScore)
  analyticsRows.forEach((entry, index) => {
    entry.analytics.rank = index + 1
  })

  const analyticsByBarangay = new Map(
    analyticsRows.map((entry) => [entry.record.id, entry.analytics] satisfies [string, ChoBarangayAnalytics])
  )

  const topBarangays: ChoBarangayRankingItem[] = analyticsRows.slice(0, 8).map((entry) => ({
    cityBarangayId: entry.record.id,
    barangayName: entry.record.name,
    pcode: entry.record.pcode,
    burdenScore: entry.analytics.burdenScore,
    caseCount: entry.analytics.caseCount,
    alertCount: entry.analytics.alertCount,
    rank: entry.analytics.rank,
  }))

  const alerts = buildAlertPreviews(topBarangays, generatedAt, window)
  const totalCases = analyticsRows.reduce((sum, entry) => sum + entry.analytics.caseCount, 0)
  const totalAlerts = analyticsRows.reduce((sum, entry) => sum + entry.analytics.alertCount, 0)
  const hotspotThreshold = analyticsRows[Math.min(5, analyticsRows.length - 1)]?.analytics.burdenScore ?? 0
  const kpis: ChoAnalyticsKpis = {
    totalCases,
    activeAlerts: alerts.length,
    hotspotBarangays: analyticsRows.filter((entry) => entry.analytics.burdenScore >= hotspotThreshold).length,
    reportingStations: stationPoints.length,
  }

  return {
    analyticsByBarangay,
    window: {
      kpis,
      trend: buildTrendSeries(generatedAt, window, totalCases, totalAlerts),
      topBarangays,
      heatPoints: buildHeatPoints(analyticsRows, window),
      alerts,
    },
  }
}

function buildHeatPoints(
  analyticsRows: Array<{
    record: CityBarangayRegistryRecord
    analytics: ChoBarangayAnalytics
  }>,
  window: ChoTimeWindow
): ChoHeatPoint[] {
  const multiplier = window === '7d' ? 0.7 : window === '30d' ? 1 : 1.15
  const heatPoints: ChoHeatPoint[] = []

  analyticsRows.forEach(({ record, analytics }, index) => {
    const centroid = getGeometryCentroid(record.geometry)
    if (!centroid) return

    const pointCount = Math.min(3, Math.max(1, Math.round(analytics.caseCount / 18)))

    for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
      const offsetSeed = index + pointIndex + 1
      heatPoints.push({
        id: `${window}-${record.id}-${pointIndex}`,
        cityBarangayId: record.id,
        lat: Number((centroid.lat + buildOffset(offsetSeed, 0.004)).toFixed(6)),
        lng: Number((centroid.lng + buildOffset(offsetSeed + 2, 0.004)).toFixed(6)),
        weight: Number((analytics.burdenScore * multiplier - pointIndex * 2).toFixed(1)),
        label: `${record.name} hotspot ${pointIndex + 1}`,
      })
    }
  })

  return heatPoints
}

function buildAlertPreviews(
  topBarangays: ChoBarangayRankingItem[],
  generatedAt: Date,
  window: ChoTimeWindow
): ChoAlertPreview[] {
  return topBarangays.slice(0, 5).map((barangay, index) => {
    const severity = getSeverity(index)

    return {
      id: `${window}-alert-${barangay.cityBarangayId}`,
      cityBarangayId: barangay.cityBarangayId,
      barangayName: barangay.barangayName,
      title: `${barangay.barangayName} shows elevated disease activity`,
      category: index % 2 === 0 ? 'Communicable disease watch' : 'Case clustering',
      severity,
      recordedAt: toIsoOffset(generatedAt, -index * (window === '7d' ? 7 : 18)),
    }
  })
}

function buildTrendSeries(
  generatedAt: Date,
  window: ChoTimeWindow,
  totalCases: number,
  totalAlerts: number
): ChoAnalyticsTrendPoint[] {
  return TREND_WEIGHTS.map((weight, index) => ({
    label: formatTrendLabel(generatedAt, window, index),
    cases: Math.max(2, Math.round(totalCases * weight)),
    alerts: Math.max(0, Math.round(totalAlerts * weight)),
  }))
}

function formatTrendLabel(
  generatedAt: Date,
  window: ChoTimeWindow,
  index: number
): string {
  const offsets: Record<ChoTimeWindow, number> = {
    '7d': 6 - index,
    '30d': (5 - index) * 5,
    '90d': (5 - index) * 15,
  }

  const date = new Date(generatedAt)
  date.setDate(date.getDate() - offsets[window])

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function getSeverity(index: number): ChoAlertSeverity {
  if (index === 0) return 'high'
  if (index <= 2) return 'medium'
  return 'low'
}

function toIsoOffset(base: Date, minuteOffset: number): string {
  const timestamp = new Date(base)
  timestamp.setMinutes(timestamp.getMinutes() + minuteOffset)
  return timestamp.toISOString()
}

function buildOffset(seed: number, magnitude: number): number {
  const polarity = seed % 2 === 0 ? 1 : -1
  return polarity * magnitude * ((seed % 3) + 1) * 0.35
}
