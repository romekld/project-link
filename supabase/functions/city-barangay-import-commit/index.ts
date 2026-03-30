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

  const payload = body as Record<string, unknown>
  const jobId = typeof payload.job_id === 'string' ? payload.job_id : ''
  const decisions = Array.isArray(payload.decisions) ? payload.decisions : []

  if (!jobId) {
    return failure(400, 'missing_job_id', 'job_id is required')
  }

  const { data, error } = await caller.adminClient.rpc('commit_city_barangay_import_job', {
    p_job_id: jobId,
    p_actor_id: caller.userId,
    p_decisions: decisions,
  })

  if (error) {
    return failure(400, 'import_commit_failed', error.message)
  }

  return ok(data)
})
