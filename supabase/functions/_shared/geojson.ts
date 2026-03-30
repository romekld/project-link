const MAX_IMPORT_BYTES = 10 * 1024 * 1024

type JsonRecord = Record<string, unknown>

interface ParsedFeatureInput {
  feature: JsonRecord
  geometry: unknown
  name: string | null
  pcode: string | null
  sourceAreaSqkm: number | null
  sourceDate: string | null
  sourceFid: number | null
  sourceValidOn: string | null
  sourceValidTo: string | null
}

function asRecord(value: unknown): JsonRecord {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as JsonRecord
  }

  return {}
}

function parseMaybeRecord(value: unknown): JsonRecord {
  if (typeof value === 'string') {
    try {
      return asRecord(JSON.parse(value))
    } catch {
      return {}
    }
  }

  return asRecord(value)
}

export function parseGeojsonText(rawText: string) {
  if (new TextEncoder().encode(rawText).length > MAX_IMPORT_BYTES) {
    throw new Error('GeoJSON payload exceeds the 10 MB limit')
  }

  return JSON.parse(rawText) as JsonRecord
}

export function normalizeGeojsonPayload(payload: unknown): JsonRecord {
  const record = asRecord(payload)
  const type = String(record.type ?? '')

  if (type === 'FeatureCollection') {
    const features = Array.isArray(record.features) ? record.features : []
    return { type: 'FeatureCollection', features }
  }

  if (type === 'Feature') {
    return { type: 'FeatureCollection', features: [record] }
  }

  throw new Error('Payload must be a GeoJSON Feature or FeatureCollection')
}

export function extractFeatureInput(body: JsonRecord): ParsedFeatureInput {
  const feature = Object.keys(parseMaybeRecord(body.feature)).length > 0
    ? parseMaybeRecord(body.feature)
    : Object.keys(parseMaybeRecord(body.geojson)).length > 0
      ? parseMaybeRecord(body.geojson)
      : {
          type: 'Feature',
          properties: {
            ADM4_EN: body.name,
            ADM4_PCODE: body.pcode,
            fid: body.source_fid,
            date: body.source_date,
            validOn: body.source_valid_on,
            validTo: body.source_valid_to,
            AREA_SQKM: body.source_area_sqkm,
          },
          geometry: body.geometry,
        }

  const properties = asRecord(feature.properties)

  return {
    feature,
    geometry: feature.geometry,
    name: typeof body.name === 'string'
      ? body.name
      : typeof properties.ADM4_EN === 'string'
        ? properties.ADM4_EN
        : typeof properties.name === 'string'
          ? properties.name
          : null,
    pcode: typeof body.pcode === 'string'
      ? body.pcode
      : typeof properties.ADM4_PCODE === 'string'
        ? properties.ADM4_PCODE
        : typeof properties.pcode === 'string'
          ? properties.pcode
          : null,
    sourceAreaSqkm: typeof body.source_area_sqkm === 'number'
      ? body.source_area_sqkm
      : typeof properties.AREA_SQKM === 'number'
        ? properties.AREA_SQKM
        : null,
    sourceDate: typeof body.source_date === 'string'
      ? body.source_date
      : typeof properties.date === 'string'
        ? properties.date
        : null,
    sourceFid: typeof body.source_fid === 'number'
      ? body.source_fid
      : typeof properties.fid === 'number'
        ? properties.fid
        : null,
    sourceValidOn: typeof body.source_valid_on === 'string'
      ? body.source_valid_on
      : typeof properties.validOn === 'string'
        ? properties.validOn
        : null,
    sourceValidTo: typeof body.source_valid_to === 'string'
      ? body.source_valid_to
      : typeof properties.validTo === 'string'
        ? properties.validTo
        : null,
  }
}
