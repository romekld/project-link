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
    // Verify caller is system_admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ data: null, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use the caller's JWT to verify role
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

    const callerRole =
      caller.app_metadata?.app_role ??
      caller.app_metadata?.role

    if (callerRole !== 'system_admin') {
      return new Response(
        JSON.stringify({ data: null, error: 'Forbidden: system_admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body = await req.json()
    const {
      email,
      password,
      first_name,
      middle_name,
      last_name,
      name_suffix,
      username,
      date_of_birth,
      sex,
      mobile_number,
      alternate_mobile_number,
      role,
      health_station_id,
      purok_assignment,
      coverage_notes,
      admin_notes,
    } = body

    const normalizedEmail = typeof email === 'string' ? email.trim() : ''
    const normalizedFirstName = typeof first_name === 'string' ? first_name.trim() : ''
    const normalizedLastName = typeof last_name === 'string' ? last_name.trim() : ''
    const normalizedUsername = typeof username === 'string' ? username.trim() : ''

    // Validate required fields
    if (!normalizedEmail || !password || !normalizedFirstName || !normalizedLastName || !normalizedUsername || !date_of_birth || !sex || !role) {
      return new Response(
        JSON.stringify({ data: null, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['M', 'F'].includes(sex)) {
      return new Response(
        JSON.stringify({ data: null, error: 'Sex must be either M or F.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (mobile_number && !/^\+639\d{9}$/.test(mobile_number)) {
      return new Response(
        JSON.stringify({ data: null, error: 'Mobile number must be in +639XXXXXXXXX format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (alternate_mobile_number && !/^\+639\d{9}$/.test(alternate_mobile_number)) {
      return new Response(
        JSON.stringify({ data: null, error: 'Alternate mobile number must be in +639XXXXXXXXX format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const needsStation = ['bhw', 'midwife_rhm'].includes(role)
    if (needsStation && !health_station_id) {
      return new Response(
        JSON.stringify({ data: null, error: 'BHS assignment is required for this role.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const normalizedStationId = needsStation ? health_station_id : null
    const normalizedPurokAssignment = role === 'bhw' ? (purok_assignment ?? null) : null

    // Use service role client for admin operations
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
      },
    })

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ data: null, error: authError?.message ?? 'Failed to create auth user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert user_profiles row
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        first_name: normalizedFirstName,
        middle_name: middle_name ?? null,
        last_name: normalizedLastName,
        name_suffix: name_suffix ?? null,
        email: normalizedEmail,
        username: normalizedUsername,
        date_of_birth,
        sex,
        mobile_number: mobile_number ?? null,
        alternate_mobile_number: alternate_mobile_number ?? null,
        role,
        health_station_id: normalizedStationId,
        purok_assignment: normalizedPurokAssignment,
        coverage_notes: coverage_notes ?? null,
        admin_notes: admin_notes ?? null,
        must_change_password: true,
        created_by: caller.id,
        updated_by: caller.id,
      })
      .select()
      .single()

    if (profileError) {
      // Clean up auth user if profile insert fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ data: null, error: profileError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ data: profile, error: null }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ data: null, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
