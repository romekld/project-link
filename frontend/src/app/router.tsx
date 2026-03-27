import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { Providers } from '@/app/providers'
import { AppShell } from '@/components/layout/app-shell'
import { supabase } from '@/lib/supabase'
import { env } from '@/config/env'
import type { UserRole } from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_ROOTS: Record<UserRole, string> = {
  bhw: '/bhw/dashboard',
  midwife_rhm: '/midwife/dashboard',
  nurse_phn: '/phn/dashboard',
  phis_coordinator: '/phis/dashboard',
  dso: '/dso/dashboard',
  city_health_officer: '/cho/dashboard',
  system_admin: '/admin/dashboard',
}

const DEV_ROLE = env.devRole

async function requireAuth() {
  if (env.disableAuth) return null
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw redirect({ to: '/login' })
  return session
}

async function requireRole(allowedPrefixes: string[]) {
  if (env.disableAuth) return { session: null, role: DEV_ROLE, root: ROLE_ROOTS[DEV_ROLE] }
  const session = await requireAuth()
  const role = session!.user?.app_metadata?.role as UserRole | undefined
  if (!role) throw redirect({ to: '/login' })

  const root = role ? ROLE_ROOTS[role] : null
  if (!root) throw redirect({ to: '/login' })

  // Check if the current role is allowed for this route group
  const isAllowed = allowedPrefixes.some((prefix) => root.startsWith(prefix))
  if (!isAllowed) throw redirect({ to: root })

  return { session, role, root }
}

// ---------------------------------------------------------------------------
// Root route — wraps everything in <Providers>
// ---------------------------------------------------------------------------
const rootRoute = createRootRoute({
  component: () => (
    <Providers>
      <Outlet />
    </Providers>
  ),
})

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------
import { LoginPage } from '@/pages/auth/login'

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: async () => {
    if (env.disableAuth) throw redirect({ to: ROLE_ROOTS[DEV_ROLE] })
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const role = session.user?.app_metadata?.role as UserRole | undefined
      const root = role ? ROLE_ROOTS[role] : null
      if (root) throw redirect({ to: root })
    }
  },
  component: LoginPage,
})

// ---------------------------------------------------------------------------
// Redirect root → login
// ---------------------------------------------------------------------------
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    if (env.disableAuth) throw redirect({ to: ROLE_ROOTS[DEV_ROLE] })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })
    const role = session.user?.app_metadata?.role as UserRole | undefined
    const root = role ? ROLE_ROOTS[role] : null
    throw redirect({ to: root ?? '/login' })
  },
  component: () => null,
})

// ---------------------------------------------------------------------------
// BHW routes
// ---------------------------------------------------------------------------
import { BHWDashboardPage } from '@/pages/bhw/dashboard'
import { PatientSearchPage } from '@/pages/bhw/patients/search'
import { PatientRegistrationPage } from '@/pages/bhw/patients/new'
import { PatientDetailPage } from '@/pages/bhw/patients/$id'
import { NewEncounterPage } from '@/pages/bhw/patients/$id.encounters.new'
import { EncounterDetailPage } from '@/pages/bhw/patients/$id.encounters.$eid'
import { PlaceholderPage } from '@/pages/placeholder'

const bhwLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bhw',
  beforeLoad: () => requireRole(['/bhw']),
  component: AppShell,
})
const bhwDashboardRoute = createRoute({
  getParentRoute: () => bhwLayoutRoute,
  path: '/dashboard',
  component: BHWDashboardPage,
})
const bhwPatientsSearchRoute = createRoute({
  getParentRoute: () => bhwLayoutRoute,
  path: '/patients/search',
  component: PatientSearchPage,
})
const bhwPatientsNewRoute = createRoute({
  getParentRoute: () => bhwLayoutRoute,
  path: '/patients/new',
  component: PatientRegistrationPage,
})
const bhwPatientDetailRoute = createRoute({
  getParentRoute: () => bhwLayoutRoute,
  path: '/patients/$id',
  component: PatientDetailPage,
})
const bhwEncounterNewRoute = createRoute({
  getParentRoute: () => bhwLayoutRoute,
  path: '/patients/$id/encounters/new',
  component: NewEncounterPage,
})
const bhwEncounterDetailRoute = createRoute({
  getParentRoute: () => bhwLayoutRoute,
  path: '/patients/$id/encounters/$eid',
  component: EncounterDetailPage,
})
const bhwCatchAllRoute = createRoute({
  getParentRoute: () => bhwLayoutRoute,
  path: '/$',
  component: PlaceholderPage,
})

// ---------------------------------------------------------------------------
// Midwife routes
// ---------------------------------------------------------------------------
import { MidwifeDashboardPage } from '@/pages/midwife/dashboard'

const midwifeLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/midwife',
  beforeLoad: () => requireRole(['/midwife']),
  component: AppShell,
})
const midwifeDashboardRoute = createRoute({
  getParentRoute: () => midwifeLayoutRoute,
  path: '/dashboard',
  component: MidwifeDashboardPage,
})
const midwifeCatchAllRoute = createRoute({
  getParentRoute: () => midwifeLayoutRoute,
  path: '/$',
  component: PlaceholderPage,
})

// ---------------------------------------------------------------------------
// PHN routes
// ---------------------------------------------------------------------------
import { PHNDashboardPage } from '@/pages/phn/dashboard'

const phnLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/phn',
  beforeLoad: () => requireRole(['/phn']),
  component: AppShell,
})
const phnDashboardRoute = createRoute({
  getParentRoute: () => phnLayoutRoute,
  path: '/dashboard',
  component: PHNDashboardPage,
})
const phnCatchAllRoute = createRoute({
  getParentRoute: () => phnLayoutRoute,
  path: '/$',
  component: PlaceholderPage,
})

// ---------------------------------------------------------------------------
// PHIS routes
// ---------------------------------------------------------------------------
import { PHISDashboardPage } from '@/pages/phis/dashboard'

const phisLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/phis',
  beforeLoad: () => requireRole(['/phis']),
  component: AppShell,
})
const phisDashboardRoute = createRoute({
  getParentRoute: () => phisLayoutRoute,
  path: '/dashboard',
  component: PHISDashboardPage,
})
const phisCatchAllRoute = createRoute({
  getParentRoute: () => phisLayoutRoute,
  path: '/$',
  component: PlaceholderPage,
})

// ---------------------------------------------------------------------------
// DSO routes
// ---------------------------------------------------------------------------
import { DSODashboardPage } from '@/pages/dso/dashboard'

const dsoLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dso',
  beforeLoad: () => requireRole(['/dso']),
  component: AppShell,
})
const dsoDashboardRoute = createRoute({
  getParentRoute: () => dsoLayoutRoute,
  path: '/dashboard',
  component: DSODashboardPage,
})
const dsoCatchAllRoute = createRoute({
  getParentRoute: () => dsoLayoutRoute,
  path: '/$',
  component: PlaceholderPage,
})

// ---------------------------------------------------------------------------
// CHO routes
// ---------------------------------------------------------------------------
import { CHODashboardPage } from '@/pages/cho/dashboard'

const choLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cho',
  beforeLoad: () => requireRole(['/cho']),
  component: AppShell,
})
const choDashboardRoute = createRoute({
  getParentRoute: () => choLayoutRoute,
  path: '/dashboard',
  component: CHODashboardPage,
})
const choCatchAllRoute = createRoute({
  getParentRoute: () => choLayoutRoute,
  path: '/$',
  component: PlaceholderPage,
})

// ---------------------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------------------
import { AdminDashboardPage } from '@/pages/admin/dashboard'
import { UserListPage } from '@/pages/admin/users/index'
import { CreateUserPage } from '@/pages/admin/users/new'
import { EditUserPage } from '@/pages/admin/users/$id.edit'

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: () => requireRole(['/admin']),
  component: AppShell,
})
const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/dashboard',
  component: AdminDashboardPage,
})
const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/users',
  component: UserListPage,
})
const adminUsersNewRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/users/new',
  component: CreateUserPage,
})
const adminUsersEditRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/users/$id/edit',
  component: EditUserPage,
})
const adminCatchAllRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/$',
  component: PlaceholderPage,
})

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  bhwLayoutRoute.addChildren([
    bhwDashboardRoute,
    bhwPatientsSearchRoute,
    bhwPatientsNewRoute,
    bhwPatientDetailRoute,
    bhwEncounterNewRoute,
    bhwEncounterDetailRoute,
    bhwCatchAllRoute,
  ]),
  midwifeLayoutRoute.addChildren([midwifeDashboardRoute, midwifeCatchAllRoute]),
  phnLayoutRoute.addChildren([phnDashboardRoute, phnCatchAllRoute]),
  phisLayoutRoute.addChildren([phisDashboardRoute, phisCatchAllRoute]),
  dsoLayoutRoute.addChildren([dsoDashboardRoute, dsoCatchAllRoute]),
  choLayoutRoute.addChildren([choDashboardRoute, choCatchAllRoute]),
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminUsersRoute,
    adminUsersNewRoute,
    adminUsersEditRoute,
    adminCatchAllRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
