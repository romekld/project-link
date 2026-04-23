import { z } from 'zod'
import {
  DEFAULT_CITY_MUNICIPALITY_NAME,
  DEFAULT_PROVINCE_NAME,
  getCityMunicipalityOptionsByProvinceName,
  getProvinceCodeByName,
} from '@/lib/location'
import type { AdminUser, UserRole } from './schema'

export const DEFAULT_CITY_MUNICIPALITY = DEFAULT_CITY_MUNICIPALITY_NAME
export const DEFAULT_PROVINCE = DEFAULT_PROVINCE_NAME
export const DEFAULT_TEMP_PASSWORD = 'projectlink@cho2'

export const ROLE_REQUIRES_STATION: UserRole[] = ['bhw', 'rhm']

export const CITY_WIDE_ROLES: UserRole[] = [
  'phn',
  'cho',
  'system_admin',
]

// Station options are now fetched from the DB and passed as props — no hardcoded list.
export type HealthStationOption = {
  id: string
  name: string
  stationCode: string
}

export const sexOptions = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
] as const

export const suffixOptions = [
  { label: 'None', value: '' },
  { label: 'Jr.', value: 'Jr.' },
  { label: 'Sr.', value: 'Sr.' },
  { label: 'II', value: 'II' },
  { label: 'III', value: 'III' },
  { label: 'IV', value: 'IV' },
] as const

const phoneRegex = /^(?:\+639\d{9}|09\d{9})$/

function isValidPhone(value?: string) {
  if (!value) return true
  return phoneRegex.test(value)
}

function validateLocationDependency(
  value: { province: string; cityMunicipality: string },
  ctx: z.RefinementCtx
) {
  if (!getProvinceCodeByName(value.province)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['province'],
      message: 'Select a valid Province from the list',
    })
    return
  }

  const cityOptions = getCityMunicipalityOptionsByProvinceName(value.province)
  const cityMatch = cityOptions.some((option) => option.value === value.cityMunicipality)

  if (!cityMatch) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cityMunicipality'],
      message: 'Select a City/Municipality that belongs to the selected Province',
    })
  }
}

const baseSchema = z.object({
  userId: z.string().regex(/^[A-Z]{2,4}-\d{4}-\d{6}$/, 'User ID must follow PREFIX-YYYY-###### format'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  nameSuffix: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  sex: z.enum(['M', 'F'], { message: 'Sex is required' }),
  email: z.string().email('Use a valid email address'),
  mobileNumber: z.string().optional(),
  alternateMobileNumber: z.string().optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  cityMunicipality: z.string().min(1, 'City/Municipality is required'),
  province: z.string().min(1, 'Province is required'),
  username: z.string().min(1, 'Username is required'),
  role: z.enum([
    'bhw',
    'rhm',
    'phn',
    'cho',
    'system_admin',
  ]),
  healthStationId: z.string().optional(),
  purokAssignment: z.string().optional(),
  coverageNotes: z.string().optional(),
  adminNotes: z.string().optional(),
  mustChangePassword: z.boolean(),
  isActive: z.boolean(),
  deactivationReason: z.string().optional(),
  profilePhotoPath: z.string().optional(),
})

export const addUserSchema = baseSchema
  .extend({
    initialPassword: z.string().min(12, 'Temporary password must be at least 12 characters'),
  })
  .superRefine((value, ctx) => {
    if (ROLE_REQUIRES_STATION.includes(value.role) && !value.healthStationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['healthStationId'],
        message: 'Health station is required for BHW and Midwife/RHM roles',
      })
    }

    if (value.mobileNumber && !isValidPhone(value.mobileNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mobileNumber'],
        message: 'Use +639XXXXXXXXX or 09XXXXXXXXX format',
      })
    }

    if (value.alternateMobileNumber && !isValidPhone(value.alternateMobileNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alternateMobileNumber'],
        message: 'Use +639XXXXXXXXX or 09XXXXXXXXX format',
      })
    }

    if (!value.isActive && !value.deactivationReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deactivationReason'],
        message: 'Deactivation reason is required when account is inactive',
      })
    }

    validateLocationDependency(value, ctx)
  })

export const editUserSchema = baseSchema.superRefine((value, ctx) => {
  if (ROLE_REQUIRES_STATION.includes(value.role) && !value.healthStationId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['healthStationId'],
      message: 'Health station is required for BHW and Midwife/RHM roles',
    })
  }

  if (value.mobileNumber && !isValidPhone(value.mobileNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['mobileNumber'],
      message: 'Use +639XXXXXXXXX or 09XXXXXXXXX format',
    })
  }

  if (value.alternateMobileNumber && !isValidPhone(value.alternateMobileNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['alternateMobileNumber'],
      message: 'Use +639XXXXXXXXX or 09XXXXXXXXX format',
    })
  }

  if (!value.isActive && !value.deactivationReason?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['deactivationReason'],
      message: 'Deactivation reason is required when account is inactive',
    })
  }

  validateLocationDependency(value, ctx)
})

export type AddUserValues = z.infer<typeof addUserSchema>
export type EditUserValues = z.infer<typeof editUserSchema>
export type UserFormValues = AddUserValues | EditUserValues

export function normalizePhoneInput(raw: string) {
  const digits = raw.replace(/\D/g, '')

  if (digits.startsWith('63') && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`
  }

  if (digits.startsWith('09') && digits.length >= 11) {
    return digits.slice(0, 11)
  }

  if (digits.startsWith('9')) {
    return `+63${digits.slice(0, 10)}`
  }

  return raw.trim()
}

export function formatPhoneForInput(value?: string) {
  if (!value) return ''
  const normalized = normalizePhoneInput(value)

  if (normalized.startsWith('+63') && normalized.length === 13) {
    return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7, 10)} ${normalized.slice(10, 13)}`
  }

  if (normalized.startsWith('09') && normalized.length === 11) {
    return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7, 11)}`
  }

  return normalized
}

export function suggestUsername(firstName: string, lastName: string) {
  const normalize = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '.')

  const first = normalize(firstName)
  const last = normalize(lastName)

  if (!first || !last) return ''
  return `${first}.${last}`
}

export const ROLE_PREFIXES: Record<string, string> = {
  bhw:          'BHW',
  rhm:          'RHM',
  phn:          'PHN',
  cho:          'CHO',
  system_admin: 'ADM',
}

export function createUserId(role: string, count: number): string {
  const year = new Date().getFullYear()
  const prefix = ROLE_PREFIXES[role] ?? 'USR'
  return `${prefix}-${year}-${String(count).padStart(6, '0')}`
}

export function deriveSoftWarnings(values: Partial<UserFormValues>) {
  const warnings: string[] = []

  if (values.role === 'bhw' && !values.purokAssignment?.trim()) {
    warnings.push('BHW accounts should include a purok assignment for clearer field ownership.')
  }

  if (values.role === 'rhm' && !values.healthStationId) {
    warnings.push('Midwife/RHM accounts normally require a health station assignment.')
  }

  if (values.role === 'phn' && values.healthStationId) {
    warnings.push('PHN is typically city-wide. Confirm this station assignment is intentional.')
  }

  if (values.role === 'system_admin' && values.healthStationId) {
    warnings.push('System Admin should be city-wide and usually should not be scoped to one station.')
  }

  if (values.isActive === false && values.mustChangePassword) {
    warnings.push('Inactive users flagged for password change will still be blocked until reactivated.')
  }

  if ((values.role === 'bhw' || values.role === 'rhm') && !values.mobileNumber?.trim()) {
    warnings.push('This role is field-heavy; adding a mobile number improves operational reachability.')
  }

  return warnings
}

type BuildDefaultsArgs = {
  roleCounts?: Record<string, number>
  user?: AdminUser
}

export function buildDefaultFormValues({ roleCounts = {}, user }: BuildDefaultsArgs): AddUserValues {
  const defaultRole = user?.role ?? 'bhw'
  const nextCount = (roleCounts[defaultRole] ?? 0) + 1

  return {
    userId: user?.userId ?? createUserId(defaultRole, nextCount),
    firstName: user?.firstName ?? '',
    middleName: user?.middleName ?? '',
    lastName: user?.lastName ?? '',
    nameSuffix: user?.nameSuffix ?? '',
    dateOfBirth: user?.dateOfBirth ?? '',
    sex: user?.sex ?? 'F',
    email: user?.email ?? '',
    mobileNumber: user?.mobileNumber ?? '',
    alternateMobileNumber: user?.alternateMobileNumber ?? '',
    addressLine1: user?.addressLine1 ?? '',
    addressLine2: user?.addressLine2 ?? '',
    cityMunicipality: user?.cityMunicipality ?? DEFAULT_CITY_MUNICIPALITY,
    province: user?.province ?? DEFAULT_PROVINCE,
    username: user?.username ?? '',
    role: user?.role ?? 'bhw',
    healthStationId: user?.healthStationId ?? '',
    purokAssignment: user?.purokAssignment ?? '',
    coverageNotes: user?.coverageNotes ?? '',
    adminNotes: user?.adminNotes ?? '',
    mustChangePassword: user ? user.mustChangePassword : true,
    isActive: user ? user.status === 'active' : true,
    deactivationReason: user?.deactivationReason ?? '',
    initialPassword: user ? '' : DEFAULT_TEMP_PASSWORD,
    profilePhotoPath: user?.profilePhotoUrl ?? '',
  }
}
