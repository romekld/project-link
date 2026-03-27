import type { UserRole } from '@/types'

// Role-to-home-path map. Used by the login page post-auth redirect (Wave 2)
// and imported by TG4 (Wave 3) route guards for role-based navigation.
export const ROLE_HOME: Record<UserRole, string> = {
  bhw: '/bhw',
  midwife_rhm: '/midwife',
  nurse_phn: '/phn',
  phis_coordinator: '/phis',
  dso: '/dso',
  city_health_officer: '/cho',
  system_admin: '/admin',
}
