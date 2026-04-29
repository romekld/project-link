import type { CityBarangayRegistryRecord } from '@/features/health-stations/city-barangay-registry/data/schema'
import type {
  HealthStationFacilityType,
  HealthStationPinStatus,
} from '@/features/health-stations/management/data/schema'

export type ChoTimeWindow = '7d' | '30d' | '90d'

export type ChoOverlayKey = 'choropleth' | 'heatmap' | 'stations'

export type ChoAlertSeverity = 'low' | 'medium' | 'high'

export type ChoStationPointSource = 'saved' | 'centroid' | 'fallback'

export type ChoAnalyticsKpis = {
  totalCases: number
  activeAlerts: number
  hotspotBarangays: number
  reportingStations: number
}

export type ChoBarangayAnalytics = {
  caseCount: number
  incidencePer10k: number
  burdenScore: number
  alertCount: number
  trendDeltaPct: number
  rank: number
}

export type ChoStationPoint = {
  id: string
  stationCode: string
  name: string
  facilityType: HealthStationFacilityType
  pinStatus: HealthStationPinStatus
  physicalBarangayName: string
  physicalBarangayPcode: string
  coordinates: {
    lat: number
    lng: number
  }
  source: ChoStationPointSource
}

export type ChoHeatPoint = {
  id: string
  cityBarangayId: string
  lat: number
  lng: number
  weight: number
  label: string
}

export type ChoAlertPreview = {
  id: string
  cityBarangayId: string
  barangayName: string
  title: string
  category: string
  severity: ChoAlertSeverity
  recordedAt: string
}

export type ChoAnalyticsTrendPoint = {
  label: string
  cases: number
  alerts: number
}

export type ChoBarangayRankingItem = {
  cityBarangayId: string
  barangayName: string
  pcode: string
  burdenScore: number
  caseCount: number
  alertCount: number
  rank: number
}

export type ChoAnalyticsWindowData = {
  kpis: ChoAnalyticsKpis
  trend: ChoAnalyticsTrendPoint[]
  topBarangays: ChoBarangayRankingItem[]
  heatPoints: ChoHeatPoint[]
  alerts: ChoAlertPreview[]
}

export type ChoBarangayMapRecord = Pick<
  CityBarangayRegistryRecord,
  'id' | 'name' | 'pcode' | 'city' | 'geometry' | 'inCho2Scope'
> & {
  areaSqKm: number
  stationIds: string[]
  analyticsByWindow: Record<ChoTimeWindow, ChoBarangayAnalytics>
}

export type ChoAnalyticsGisData = {
  generatedAt: string
  defaultTimeWindow: ChoTimeWindow
  availableTimeWindows: ChoTimeWindow[]
  barangays: ChoBarangayMapRecord[]
  stationPoints: ChoStationPoint[]
  windows: Record<ChoTimeWindow, ChoAnalyticsWindowData>
}
