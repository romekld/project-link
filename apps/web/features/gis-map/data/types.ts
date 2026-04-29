export type GisPosition = [number, number] | [number, number, number]

export type GisPointCoordinates = [number, number]

export type GisPolygonCoordinates = GisPosition[][]

export type GisMultiPolygonCoordinates = GisPolygonCoordinates[]

export type GisGeometry =
  | {
      type: 'Point'
      coordinates: GisPointCoordinates
    }
  | {
      type: 'Polygon'
      coordinates: GisPolygonCoordinates
    }
  | {
      type: 'MultiPolygon'
      coordinates: GisMultiPolygonCoordinates
    }

export type GisMapStyleMode = 'light' | 'dark'

export type GisMapPopupState = {
  id: string
  lngLat: {
    lng: number
    lat: number
  }
  point: {
    x: number
    y: number
  }
}

export type GisPolygonFeatureProperties = {
  id: string
  name: string
  pcode: string
  inCho2Scope: boolean
  stagedAction?: string | null
  fillColor?: string | null
  fillOpacity?: number | null
  lineColor?: string | null
  [key: string]: string | number | boolean | null | undefined
}

export type GisPolygonFeature = {
  type: 'Feature'
  id?: string | number
  geometry: GisGeometry
  properties: GisPolygonFeatureProperties
}

export type GisPolygonFeatureCollection = {
  type: 'FeatureCollection'
  features: GisPolygonFeature[]
}

export type GisPointFeatureProperties = {
  id: string
  name: string
  pcode: string
  pinStatus?: string | null
  [key: string]: string | number | boolean | null | undefined
}

export type GisPointFeature = {
  type: 'Feature'
  id?: string | number
  geometry: Extract<GisGeometry, { type: 'Point' }>
  properties: GisPointFeatureProperties
}

export type GisPointFeatureCollection = {
  type: 'FeatureCollection'
  features: GisPointFeature[]
}

export type GisPreviewFeatureCollection = {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: GisGeometry
    properties: Record<string, never>
  }>
}
