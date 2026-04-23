export type GeoJsonPosition = [number, number] | [number, number, number]

export type GeoJsonPolygonCoordinates = GeoJsonPosition[][]

export type GeoJsonMultiPolygonCoordinates = GeoJsonPolygonCoordinates[]

export type GeoJsonGeometry =
  | {
      type: 'Polygon'
      coordinates: GeoJsonPolygonCoordinates
    }
  | {
      type: 'MultiPolygon'
      coordinates: GeoJsonMultiPolygonCoordinates
    }

export type CityBarangaySourceProperties = {
  fid: number
  ADM4_EN: string
  ADM4_PCODE: string
  ADM4_REF: string | null
  ADM3_EN: string
  ADM3_PCODE: string
  ADM2_EN: string
  ADM2_PCODE: string
  ADM1_EN: string
  ADM1_PCODE: string
  ADM0_EN: string
  ADM0_PCODE: string
  date: string
  validOn: string
  validTo: string | null
  Shape_Leng: number
  Shape_Area: number
  AREA_SQKM: number
}

export type CityBarangayRegistryRecord = {
  id: string
  name: string
  pcode: string
  city: string
  sourceFid: number
  sourceDate: string
  sourceValidOn: string
  sourceValidTo: string | null
  sourceAreaSqKm: number
  inCho2Scope: boolean
  geometry: GeoJsonGeometry
  sourcePayload: CityBarangaySourceProperties
  versionCount: number
  updatedAt: string
}

export type CityBarangayGeometryVersion = {
  id: string
  cityBarangayId: string
  versionNo: number
  changeType: 'create' | 'overwrite' | 'manual_edit'
  reason: string
  changedBy: string
  changedAt: string
  sourcePayload: CityBarangaySourceProperties
}

export type CityBarangayImportStatus =
  | 'uploaded'
  | 'validated'
  | 'committed'
  | 'failed'
  | 'cancelled'

export type CityBarangayImportAction =
  | 'create'
  | 'skip'
  | 'overwrite'
  | 'invalid'
  | 'review_required'
  | 'committed'

export type CityBarangayImportJob = {
  id: string
  filename: string
  status: CityBarangayImportStatus
  totalFeatures: number
  validFeatures: number
  errorFeatures: number
  duplicateFeatures: number
  payloadSizeBytes: number
  createdAt: string
  validatedAt: string | null
  committedAt: string | null
}

export type CityBarangayImportItem = {
  id: string
  jobId: string
  featureIndex: number
  pcode: string | null
  name: string | null
  action: CityBarangayImportAction
  validationErrors: string[]
  geometry: GeoJsonGeometry | null
  selectedOverwrite: boolean
  existingCityBarangayId: string | null
  existingBarangayName: string | null
  processedAt: string | null
  sourcePayload: CityBarangaySourceProperties | null
}

export type CityBarangayRegistryStats = {
  totalBarangays: number
  inCho2Scope: number
  outsideCho2Scope: number
  sourceDate: string | null
  validOn: string | null
  totalAreaSqKm: number
  latestUpdatedAt: string | null
}

export type CityBarangayRegistryData = {
  records: CityBarangayRegistryRecord[]
  geometryVersions: CityBarangayGeometryVersion[]
  importJob: CityBarangayImportJob
  importItems: CityBarangayImportItem[]
  stats: CityBarangayRegistryStats
}

export type CityBarangayPageMode = 'admin' | 'cho-readonly'

