import type { HealthStation } from '../management/data/schema'
import type {
  CityBarangayRegistryRecord,
  GeoJsonGeometry,
  GeoJsonPolygonCoordinates,
  GeoJsonPosition,
} from '../city-barangay-registry/data/schema'
import { getGeometryBounds } from '../city-barangay-registry/data/geojson'
import type { GisPointFeatureCollection } from '@/features/gis-map/data/types'

export type StationPinCoordinates = {
  lng: number
  lat: number
}

export type StationPinView = {
  id: string
  station: HealthStation
  physicalBarangay: CityBarangayRegistryRecord | null
  coordinates: StationPinCoordinates
  source: 'saved' | 'centroid' | 'fallback'
}

const DEFAULT_CENTER: StationPinCoordinates = {
  lng: 120.94,
  lat: 14.32,
}

export function buildStationPinViews(
  stations: HealthStation[],
  registryRecords: CityBarangayRegistryRecord[]
): StationPinView[] {
  const registryByPcode = new Map(
    registryRecords.map((record) => [record.pcode, record])
  )

  return stations.map((station) => {
    const physicalBarangay = registryByPcode.get(station.physicalBarangayPcode) ?? null

    if (
      typeof station.latitude === 'number' &&
      typeof station.longitude === 'number'
    ) {
      return {
        id: station.id,
        station,
        physicalBarangay,
        coordinates: {
          lng: station.longitude,
          lat: station.latitude,
        },
        source: 'saved',
      }
    }

    if (physicalBarangay) {
      const centroid = getGeometryCentroid(physicalBarangay.geometry)

      return {
        id: station.id,
        station,
        physicalBarangay,
        coordinates: centroid ?? DEFAULT_CENTER,
        source: centroid ? 'centroid' : 'fallback',
      }
    }

    return {
      id: station.id,
      station,
      physicalBarangay,
      coordinates: DEFAULT_CENTER,
      source: 'fallback',
    }
  })
}

export function toStationPointFeatureCollection(
  views: StationPinView[]
): GisPointFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: views.map((view) => ({
      type: 'Feature',
      id: view.id,
      geometry: {
        type: 'Point',
        coordinates: [view.coordinates.lng, view.coordinates.lat],
      },
      properties: {
        id: view.id,
        name: view.station.name,
        pcode: view.station.physicalBarangayPcode,
        stationCode: view.station.stationCode,
        pinStatus: view.station.pinStatus,
        facilityType: view.station.facilityType,
        source: view.source,
      },
    })),
  }
}

export function getStationPinCoordinates(view: StationPinView) {
  return view.coordinates
}

export function getStationPinCoordinateLabel(view: StationPinView) {
  return `${formatCoordinate(view.coordinates.lat)}, ${formatCoordinate(view.coordinates.lng)}`
}

export function getStationPinFallbackLabel(view: StationPinView) {
  if (view.source === 'saved') return 'Saved pin'
  if (view.source === 'centroid') return 'Barangay centroid'
  return 'City fallback'
}

export function getGeometryCentroid(
  geometry: CityBarangayRegistryRecord['geometry'] | null
): StationPinCoordinates | null {
  if (!geometry) return null

  const bounds = getGeometryBounds([geometry])
  if (!bounds) return null

  return {
    lng: (bounds[0][0] + bounds[1][0]) / 2,
    lat: (bounds[0][1] + bounds[1][1]) / 2,
  }
}

function formatCoordinate(value: number) {
  return value.toFixed(6)
}

export function isPointInGeometry(
  point: [number, number],
  geometry: GeoJsonGeometry
): boolean {
  if (geometry.type === 'Polygon') {
    return isPointInPolygonCoords(point, geometry.coordinates)
  }
  return geometry.coordinates.some((rings) => isPointInPolygonCoords(point, rings))
}

function isPointInPolygonCoords(
  point: [number, number],
  rings: GeoJsonPolygonCoordinates
): boolean {
  const [x, y] = point
  if (!raycastRing(x, y, rings[0])) return false
  for (let i = 1; i < rings.length; i++) {
    if (raycastRing(x, y, rings[i])) return false
  }
  return true
}

function raycastRing(x: number, y: number, ring: GeoJsonPosition[]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}