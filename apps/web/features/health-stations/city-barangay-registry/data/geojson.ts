import type {
  CityBarangayRegistryRecord,
  CityBarangaySourceProperties,
  GeoJsonGeometry,
} from './schema'

export type RegistryFeature = {
  type: 'Feature'
  geometry: GeoJsonGeometry
  properties: {
    id: string
    name: string
    pcode: string
    city: string
    inCho2Scope: boolean
    sourceFid: number
    sourceDate: string
    validOn: string
    validTo: string | null
    areaSqKm: number
  }
}

export type RegistryFeatureCollection = {
  type: 'FeatureCollection'
  features: RegistryFeature[]
}

export type SourceFeature = {
  type: 'Feature'
  geometry: GeoJsonGeometry
  properties: CityBarangaySourceProperties
}

export type SourceFeatureCollection = {
  type: 'FeatureCollection'
  features: SourceFeature[]
}

export function toRegistryFeature(record: CityBarangayRegistryRecord): RegistryFeature {
  return {
    type: 'Feature',
    geometry: record.geometry,
    properties: {
      id: record.id,
      name: record.name,
      pcode: record.pcode,
      city: record.city,
      inCho2Scope: record.inCho2Scope,
      sourceFid: record.sourceFid,
      sourceDate: record.sourceDate,
      validOn: record.sourceValidOn,
      validTo: record.sourceValidTo,
      areaSqKm: record.sourceAreaSqKm,
    },
  }
}

export function toRegistryFeatureCollection(
  records: CityBarangayRegistryRecord[]
): RegistryFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: records.map(toRegistryFeature),
  }
}

function visitPositions(
  geometry: GeoJsonGeometry,
  visit: (position: [number, number]) => void
) {
  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates) {
      for (const position of ring) {
        visit([position[0], position[1]])
      }
    }
    return
  }

  for (const polygon of geometry.coordinates) {
    for (const ring of polygon) {
      for (const position of ring) {
        visit([position[0], position[1]])
      }
    }
  }
}

export function getGeometryBounds(geometries: GeoJsonGeometry[]) {
  let minLng = Number.POSITIVE_INFINITY
  let minLat = Number.POSITIVE_INFINITY
  let maxLng = Number.NEGATIVE_INFINITY
  let maxLat = Number.NEGATIVE_INFINITY

  for (const geometry of geometries) {
    visitPositions(geometry, ([lng, lat]) => {
      minLng = Math.min(minLng, lng)
      minLat = Math.min(minLat, lat)
      maxLng = Math.max(maxLng, lng)
      maxLat = Math.max(maxLat, lat)
    })
  }

  if (!Number.isFinite(minLng)) {
    return null
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ] as [[number, number], [number, number]]
}

