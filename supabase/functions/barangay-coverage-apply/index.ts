import { failure, ok, parseJsonBody, requireCaller, corsHeaders } from '../_shared/common.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const caller = await requireCaller(req, ['system_admin', 'city_health_officer'])
  if (caller instanceof Response) {
    return caller
  }

  const body = await parseJsonBody(req)
  if (!body || typeof body !== 'object') {
    return failure(400, 'invalid_body', 'Request body must be valid JSON')
  }

  const payload = body as Record<string, unknown>
  const cityBarangayId = typeof payload.city_barangay_id === 'string' ? payload.city_barangay_id : ''
  const action = typeof payload.action === 'string' ? payload.action : ''
  const reason = typeof payload.reason === 'string' ? payload.reason.trim() : ''
  const name = typeof payload.name === 'string' ? payload.name : null

  if (!cityBarangayId || !action || !reason) {
    return failure(400, 'missing_fields', 'city_barangay_id, action, and reason are required')
  }

  const { data, error } = await caller.adminClient.rpc('apply_barangay_coverage_change', {
    p_actor_id: caller.userId,
    p_city_barangay_id: cityBarangayId,
    p_action: action,
    p_reason: reason,
    p_name: name,
  })

  if (error) {
    return failure(400, 'coverage_apply_failed', error.message)
  }

  return ok(data)
})
