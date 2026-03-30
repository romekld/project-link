import { parseGeojsonText, normalizeGeojsonPayload } from '../_shared/geojson.ts'
import { failure, ok, requireCaller, corsHeaders } from '../_shared/common.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const caller = await requireCaller(req, ['system_admin'])
  if (caller instanceof Response) {
    return caller
  }

  try {
    const rawText = await req.text()
    const parsed = parseGeojsonText(rawText)
    const wrappedGeojson = typeof parsed.geojson === 'string'
      ? JSON.parse(parsed.geojson)
      : parsed.geojson
    const payload = normalizeGeojsonPayload(
      typeof wrappedGeojson === 'object' && wrappedGeojson !== null ? wrappedGeojson : parsed,
    )
    const filename = typeof parsed.filename === 'string' ? parsed.filename : 'upload.geojson'

    const { data, error } = await caller.adminClient.rpc('stage_city_barangay_import_job', {
      p_actor_id: caller.userId,
      p_filename: filename,
      p_payload: payload,
      p_payload_size_bytes: new TextEncoder().encode(rawText).length,
    })

    if (error) {
      return failure(400, 'import_validate_failed', error.message)
    }

    return ok(data, {}, 201)
  } catch (error) {
    return failure(400, 'invalid_geojson', error instanceof Error ? error.message : 'Unable to validate GeoJSON payload')
  }
})
