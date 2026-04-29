import type { CityBarangayRegistryRecord } from '@/features/health-stations/city-barangay-registry/data/schema'
import { getGeometryCentroid, buildStationPinViews } from '../../pin-map/data'
import type { HealthStation } from './schema'

export type HeatmapSignalLevel = 'critical' | 'elevated' | 'watch'

export type HealthStationsHeatmapPoint = {
  id: string
  lat: number
  lng: number
  weight: number
  level: HeatmapSignalLevel
  stationId: string | null
  stationName: string | null
  barangayId: string | null
  barangayName: string | null
}

type ClusterProfile = {
  level: HeatmapSignalLevel
  count: number
  spreadLat: number
  spreadLng: number
  baseWeight: number
  variance: number
}

const CLUSTER_PROFILES: ClusterProfile[] = [
  {
    level: 'critical',
    count: 28,
    spreadLat: 0.0022,
    spreadLng: 0.0028,
    baseWeight: 1.28,
    variance: 0.2,
  },
  {
    level: 'critical',
    count: 22,
    spreadLat: 0.0025,
    spreadLng: 0.003,
    baseWeight: 1.12,
    variance: 0.18,
  },
  {
    level: 'elevated',
    count: 18,
    spreadLat: 0.0029,
    spreadLng: 0.0033,
    baseWeight: 0.92,
    variance: 0.16,
  },
  {
    level: 'elevated',
    count: 14,
    spreadLat: 0.0031,
    spreadLng: 0.0035,
    baseWeight: 0.76,
    variance: 0.14,
  },
  {
    level: 'watch',
    count: 10,
    spreadLat: 0.0035,
    spreadLng: 0.0042,
    baseWeight: 0.54,
    variance: 0.1,
  },
]

const TARGET_FRACTIONS = [0.1, 0.26, 0.44, 0.62, 0.82]
const SCATTER_FRACTIONS = [0.05, 0.15, 0.31, 0.49, 0.58, 0.73, 0.91]

export function buildMockHeatmapPoints(
  stations: HealthStation[],
  registryRecords: CityBarangayRegistryRecord[]
): HealthStationsHeatmapPoint[] {
  const scopedRecords = getScopedRecords(registryRecords)
  const pinViews = buildStationPinViews(stations, scopedRecords).sort((left, right) =>
    left.station.name.localeCompare(right.station.name)
  )

  const clusterTargets = pickClusterTargets(pinViews)
  const points: HealthStationsHeatmapPoint[] = []

  clusterTargets.forEach((target, targetIndex) => {
    const profile = CLUSTER_PROFILES[targetIndex] ?? CLUSTER_PROFILES.at(-1)
    if (!profile) return

    points.push(
      ...Array.from({ length: profile.count }, (_, pointIndex) =>
        buildClusterPoint(target, profile, targetIndex, pointIndex)
      )
    )
  })

  const scatteredTargets = pickScatterTargets(scopedRecords)
  scatteredTargets.forEach((record, index) => {
    const centroid = getGeometryCentroid(record.geometry)
    if (!centroid) return

    const seed = 800 + index
    points.push({
      id: `heat-scatter-${record.id}-${index + 1}`,
      lat: roundCoordinate(
        centroid.lat + oscillate(seed * 0.61, 0.0014) + oscillate(seed * 0.17, 0.0004)
      ),
      lng: roundCoordinate(
        centroid.lng + oscillate(seed * 0.43, 0.0018) + oscillate(seed * 0.29, 0.0005)
      ),
      weight: roundWeight(0.22 + unit(seed * 0.73) * 0.28),
      level: 'watch',
      stationId: null,
      stationName: null,
      barangayId: record.id,
      barangayName: record.name,
    })
  })

  return points
}

function getScopedRecords(records: CityBarangayRegistryRecord[]) {
  const scoped = records.filter((record) => record.inCho2Scope)
  return scoped.length ? scoped : records
}

function pickClusterTargets(
  pinViews: ReturnType<typeof buildStationPinViews>
) {
  if (!pinViews.length) return []

  const picked = new Set<string>()
  const targets = TARGET_FRACTIONS.map((fraction) => {
    const fallbackIndex = Math.min(
      pinViews.length - 1,
      Math.max(0, Math.round((pinViews.length - 1) * fraction))
    )

    let candidate = pinViews[fallbackIndex]
    if (candidate && !picked.has(candidate.id)) {
      picked.add(candidate.id)
      return candidate
    }

    candidate = pinViews.find((view) => !picked.has(view.id)) ?? pinViews[fallbackIndex]
    picked.add(candidate.id)
    return candidate
  })

  return targets
}

function pickScatterTargets(records: CityBarangayRegistryRecord[]) {
  if (!records.length) return []

  return SCATTER_FRACTIONS.map((fraction) => {
    const index = Math.min(
      records.length - 1,
      Math.max(0, Math.round((records.length - 1) * fraction))
    )

    return records[index]
  })
}

function buildClusterPoint(
  target: ReturnType<typeof buildStationPinViews>[number],
  profile: ClusterProfile,
  targetIndex: number,
  pointIndex: number
): HealthStationsHeatmapPoint {
  const seed = targetIndex * 97 + pointIndex + 1
  const angle = ((seed * 137.507764) % 360) * (Math.PI / 180)
  const radialFactor = 0.25 + unit(seed * 0.91) * 0.85
  const latOffset = Math.cos(angle) * profile.spreadLat * radialFactor
  const lngOffset =
    Math.sin(angle) *
    profile.spreadLng *
    radialFactor *
    (0.88 + unit(seed * 0.33) * 0.34)
  const taper = (profile.count - pointIndex) / profile.count

  return {
    id: `heat-${target.id}-${profile.level}-${pointIndex + 1}`,
    lat: roundCoordinate(target.coordinates.lat + latOffset),
    lng: roundCoordinate(target.coordinates.lng + lngOffset),
    weight: roundWeight(
      clamp(
        profile.baseWeight +
          Math.sin(seed * 0.73) * profile.variance +
          taper * 0.1 +
          unit(seed * 0.19) * 0.08,
        0.18,
        1.65
      )
    ),
    level: profile.level,
    stationId: target.station.id,
    stationName: target.station.name,
    barangayId: target.physicalBarangay?.id ?? null,
    barangayName: target.physicalBarangay?.name ?? target.station.physicalBarangayName,
  }
}

function unit(seed: number) {
  return (Math.sin(seed * 12.9898) + 1) / 2
}

function oscillate(seed: number, amplitude: number) {
  return Math.sin(seed * 7.531) * amplitude
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6))
}

function roundWeight(value: number) {
  return Number(value.toFixed(3))
}
