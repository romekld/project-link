import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ data: null, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser()
    if (callerError || !caller) {
      return new Response(
        JSON.stringify({ data: null, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const callerRole = caller.app_metadata?.app_role ?? caller.app_metadata?.role
    if (callerRole !== 'system_admin') {
      return new Response(
        JSON.stringify({ data: null, error: 'Forbidden: system_admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const userId = typeof body.id === 'string' ? body.id : null

    if (!userId) {
      return new Response(
        JSON.stringify({ data: null, error: 'User id is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: existing, error: existingError } = await adminClient
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingError || !existing) {
      return new Response(
        JSON.stringify({ data: null, error: 'User not found.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const normalizedFirstName = typeof body.first_name === 'string' ? body.first_name.trim() : existing.first_name
    const normalizedMiddleName = typeof body.middle_name === 'string' ? body.middle_name.trim() || null : existing.middle_name
    const normalizedLastName = typeof body.last_name === 'string' ? body.last_name.trim() : existing.last_name
    const normalizedNameSuffix = typeof body.name_suffix === 'string' ? body.name_suffix.trim() || null : existing.name_suffix
    const normalizedEmail = typeof body.email === 'string' ? body.email.trim() : existing.email
    const normalizedUsername = typeof body.username === 'string' ? body.username.trim() : existing.username
    const normalizedMobileNumber = typeof body.mobile_number === 'string' ? body.mobile_number.trim() || null : existing.mobile_number
    const normalizedAlternateMobileNumber = typeof body.alternate_mobile_number === 'string'
      ? body.alternate_mobile_number.trim() || null
      : existing.alternate_mobile_number
    const normalizedCoverageNotes = typeof body.coverage_notes === 'string' ? body.coverage_notes.trim() || null : existing.coverage_notes
    const normalizedAdminNotes = typeof body.admin_notes === 'string' ? body.admin_notes.trim() || null : existing.admin_notes
    const normalizedUserId = typeof body.user_id === 'string' ? body.user_id.trim() : existing.user_id

    const effectiveRole = body.role ?? existing.role
    const effectiveStationId = ['bhw', 'midwife_rhm'].includes(effectiveRole)
      ? body.health_station_id ?? existing.health_station_id
      : null
    const effectivePurokAssignment = effectiveRole === 'bhw'
      ? body.purok_assignment ?? existing.purok_assignment
      : null
    const effectiveEmail = normalizedEmail
    const effectiveIsActive = typeof body.is_active === 'boolean' ? body.is_active : existing.is_active
    const effectiveDeactivationReason = effectiveIsActive
      ? null
      : body.deactivation_reason ?? existing.deactivation_reason

    if (!normalizedFirstName) {
      return new Response(
        JSON.stringify({ data: null, error: 'First name is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!normalizedLastName) {
      return new Response(
        JSON.stringify({ data: null, error: 'Last name is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!effectiveEmail) {
      return new Response(
        JSON.stringify({ data: null, error: 'Email is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['M', 'F'].includes(body.sex ?? existing.sex)) {
      return new Response(
        JSON.stringify({ data: null, error: 'Sex must be either M or F.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (normalizedMobileNumber && !/^\+639\d{9}$/.test(normalizedMobileNumber)) {
      return new Response(
        JSON.stringify({ data: null, error: 'Mobile number must be in +639XXXXXXXXX format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (normalizedAlternateMobileNumber && !/^\+639\d{9}$/.test(normalizedAlternateMobileNumber)) {
      return new Response(
        JSON.stringify({ data: null, error: 'Alternate mobile number must be in +639XXXXXXXXX format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (['bhw', 'midwife_rhm'].includes(effectiveRole) && !effectiveStationId) {
      return new Response(
        JSON.stringify({ data: null, error: 'BHS assignment is required for this role.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!effectiveIsActive && !effectiveDeactivationReason) {
      return new Response(
        JSON.stringify({ data: null, error: 'Deactivation reason is required when deactivating a user.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (effectiveEmail !== existing.email) {
      const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(userId, {
        email: effectiveEmail,
        user_metadata: {
          first_name: normalizedFirstName,
          last_name: normalizedLastName,
        },
      })

      if (authUpdateError) {
        return new Response(
          JSON.stringify({ data: null, error: authUpdateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const updates = {
      user_id: normalizedUserId,
      first_name: normalizedFirstName,
      middle_name: normalizedMiddleName,
      last_name: normalizedLastName,
      name_suffix: normalizedNameSuffix,
      email: effectiveEmail,
      username: normalizedUsername,
      date_of_birth: body.date_of_birth ?? existing.date_of_birth,
      sex: body.sex ?? existing.sex,
      mobile_number: normalizedMobileNumber,
      alternate_mobile_number: normalizedAlternateMobileNumber,
      role: effectiveRole,
      health_station_id: effectiveStationId,
      purok_assignment: effectivePurokAssignment,
      coverage_notes: normalizedCoverageNotes,
      admin_notes: normalizedAdminNotes,
      is_active: effectiveIsActive,
      must_change_password: typeof body.must_change_password === 'boolean'
        ? body.must_change_password
        : existing.must_change_password,
      deactivation_reason: effectiveDeactivationReason,
      profile_photo_path: body.profile_photo_path ?? existing.profile_photo_path,
      profile_photo_updated_at: body.profile_photo_path !== undefined ? new Date().toISOString() : existing.profile_photo_updated_at,
      updated_by: caller.id,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedProfile, error: updateError } = await adminClient
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single()

    if (updateError) {
      return new Response(
        JSON.stringify({ data: null, error: updateError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ data: updatedProfile, error: null }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ data: null, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
