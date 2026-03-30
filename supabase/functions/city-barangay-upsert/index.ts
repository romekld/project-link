import { extractFeatureInput } from '../_shared/geojson.ts'
import { failure, ok, parseJsonBody, requireCaller, corsHeaders } from '../_shared/common.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const caller = await requireCaller(req, ['system_admin'])
  if (caller instanceof Response) {
    return caller
  }

  const body = await parseJsonBody(req)
  if (!body || typeof body !== 'object') {
    return failure(400, 'invalid_body', 'Request body must be valid JSON')
  }

  try {
    const payload = body as Record<string, unknown>
    const featureInput = extractFeatureInput(payload)
    const reason = typeof payload.reason === 'string' ? payload.reason.trim() : ''
    const overwrite = payload.overwrite === true || payload.overwrite === 'true'

    if (!reason) {
      return failure(400, 'missing_reason', 'Reason is required')
    }

    if (!featureInput.pcode || !featureInput.name || !featureInput.geometry) {
      return failure(400, 'missing_fields', 'Feature must include barangay name, PSGC code, and geometry')
    }

    if (!overwrite) {
      const { data: existing } = await caller.adminClient
        .from('city_barangays')
        .select('id, name, pcode')
        .eq('pcode', featureInput.pcode)
        .maybeSingle()

      if (existing) {
        return failure(409, 'duplicate_pcode', 'City barangay with this PSGC code already exists', { existing })
      }
    }

    const { data, error } = await caller.adminClient.rpc('upsert_city_barangay', {
      p_actor_id: caller.userId,
      p_name: featureInput.name,
      p_pcode: featureInput.pcode,
      p_city: typeof payload.city === 'string' ? payload.city : null,
      p_reason: reason,
      p_geometry_geojson: featureInput.geometry,
      p_source_payload: featureInput.feature,
      p_source_fid: featureInput.sourceFid,
      p_source_date: featureInput.sourceDate,
      p_source_valid_on: featureInput.sourceValidOn,
      p_source_valid_to: featureInput.sourceValidTo,
      p_source_area_sqkm: featureInput.sourceAreaSqkm,
      p_overwrite: overwrite,
    })

    if (error) {
      return failure(400, 'upsert_failed', error.message)
    }

    return ok(data, {}, overwrite ? 200 : 201)
  } catch (error) {
    return failure(400, 'invalid_geojson', error instanceof Error ? error.message : 'Unable to process payload')
  }
})
