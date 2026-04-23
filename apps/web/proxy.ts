import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { ROLE_PREFIXES, getRoleHome } from '@/features/navigation/data/role-policy'

const PUBLIC_PATHS = ['/login', '/forgot-password']

export async function proxy(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  // Always refresh the session so auth cookies stay current
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public paths: redirect to role home if already authenticated
  if (PUBLIC_PATHS.includes(pathname)) {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const roleHome = getRoleHome(profile.role)

      if (!roleHome) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/login', request.url))
      }

      return NextResponse.redirect(new URL(roleHome, request.url))
    }
    return response
  }

  // All other paths require a session
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // /change-password is open to any authenticated user — skip further checks
  if (pathname === '/change-password') {
    return response
  }

  // Fetch profile for must_change_password + role checks
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, must_change_password')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // must_change_password is now handled by the dashboard dialog (skippable)
  // — no page-level redirect needed here

  // Role-based route access
  const restricted = ROLE_PREFIXES.find(({ prefix }) => pathname.startsWith(prefix))
  const roleHome = getRoleHome(profile.role)

  if (!roleHome) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (restricted && restricted.role !== profile.role) {
    return NextResponse.redirect(new URL(roleHome, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
