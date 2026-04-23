export type UserStatus = 'active' | 'inactive' | 'invited' | 'suspended'

export type UserRole =
  | 'bhw'
  | 'rhm'
  | 'phn'
  | 'cho'
  | 'system_admin'

export type AdminUser = {
  id: string
  userId: string
  firstName: string
  middleName?: string
  lastName: string
  nameSuffix?: string
  dateOfBirth?: string
  sex?: 'M' | 'F'
  username: string
  email: string
  mobileNumber: string
  alternateMobileNumber?: string
  addressLine1?: string
  addressLine2?: string
  cityMunicipality?: string
  province?: string
  status: UserStatus
  role: UserRole
  healthStationName: string | null
  healthStationId: string | null
  healthStationCode: string | null
  purokAssignment?: string
  coverageNotes?: string
  adminNotes?: string
  profilePhotoUrl?: string
  deactivationReason?: string
  mustChangePassword: boolean
  lastLoginAt: string | null
  passwordChangedAt: string | null
  createdAt: string
  updatedAt: string
}
