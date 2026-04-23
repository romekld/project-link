import type { AdminUser, UserRole, UserStatus } from './schema'
import { ROLE_PREFIXES } from './form-schema'

const firstNames = [
  'Aira',
  'Liam',
  'Mika',
  'Noel',
  'Rica',
  'Paolo',
  'Jessa',
  'Mark',
  'Ivy',
  'Carlo',
]

const lastNames = [
  'Santos',
  'Reyes',
  'Dela Cruz',
  'Garcia',
  'Torres',
  'Mendoza',
  'Navarro',
  'Flores',
  'Castillo',
  'Ramos',
]

const stations = [
  'BHS Paliparan III',
  'BHS Salawag',
  'BHS Sampaloc I',
  'BHS San Dionisio',
  'BHS Burol Main',
  null,
]

const roles: UserRole[] = [
  'bhw',
  'rhm',
  'phn',
  'cho',
  'system_admin',
]

const statuses: UserStatus[] = ['active', 'inactive', 'invited', 'suspended']

function toSlug(value: string) {
  return value.toLowerCase().replace(/\s+/g, '.')
}

function shouldUseCityWide(role: UserRole) {
  return [
    'phn',
    'cho',
    'system_admin',
  ].includes(role)
}

export function createMockUsers(count = 30): AdminUser[] {
  const now = Date.now()

  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[index % firstNames.length]
    const lastName = lastNames[(index * 3) % lastNames.length]
    const role = roles[index % roles.length]
    const status = statuses[index % statuses.length]
    const station = shouldUseCityWide(role)
      ? null
      : stations[index % (stations.length - 1)]

    return {
      id: `u-${index + 1}`,
      userId: `${ROLE_PREFIXES[role] ?? 'USR'}-2026-${String(index + 1).padStart(6, '0')}`,
      firstName,
      lastName,
      username: `${toSlug(firstName)}.${toSlug(lastName)}${index + 1}`,
      email: `${toSlug(firstName)}.${toSlug(lastName)}${index + 1}@cho2.gov.ph`,
      mobileNumber: `091${String(20000000 + index).slice(-8)}`,
      status,
      role,
      healthStationName: station,
      healthStationId: station ? `station-${toSlug(station)}` : null,
      healthStationCode: station ? `BHS-${String(index % 5 + 1).padStart(3, '0')}` : null,
      healthStationSlug: station ? station.toLowerCase().replace(/\s+/g, '-') : null,
      mustChangePassword: index % 3 === 0,
      lastLoginAt:
        status === 'invited'
          ? null
          : new Date(now - (index + 2) * 86400000).toISOString(),
      passwordChangedAt:
        index % 3 === 0
          ? null
          : new Date(now - (index + 5) * 86400000).toISOString(),
      createdAt: new Date(now - (index + 10) * 86400000).toISOString(),
      updatedAt: new Date(now - (index + 2) * 86400000).toISOString(),
    }
  })
}
