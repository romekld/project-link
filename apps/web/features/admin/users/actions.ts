'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createRandomAvatarSeed, createUserAvatarDataUri } from './data/avatar'
import type { AddUserValues, EditUserValues } from './data/form-schema'
import type { UserStatus } from './data/schema'

type ActionResult = { success: true } | { error: string }

const PROFILE_PHOTO_BUCKET = 'profile-photos'
const PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024
const PROFILE_PHOTO_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const


function getProfilePhotoFile(photoFormData?: FormData): File | null {
  const file = photoFormData?.get('profilePhoto')
  if (!(file instanceof File) || file.size === 0) return null
  return file
}

async function uploadProfilePhoto(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  photoFormData?: FormData
) {
  const file = getProfilePhotoFile(photoFormData)
  if (!file) return null

  if (!(file.type in PROFILE_PHOTO_EXTENSIONS)) {
    throw new Error('Only JPG, PNG, or WEBP profile photos are allowed.')
  }

  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    throw new Error('Profile photo must be 2 MB or smaller.')
  }

  const extension = PROFILE_PHOTO_EXTENSIONS[file.type as keyof typeof PROFILE_PHOTO_EXTENSIONS]
  const path = `${userId}/${randomUUID()}.${extension}`
  const { error } = await admin.storage
    .from(PROFILE_PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(error.message)

  const { data } = admin.storage.from(PROFILE_PHOTO_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function createUserAction(
  values: AddUserValues,
  photoFormData?: FormData
): Promise<ActionResult> {
  const admin = createAdminClient()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: values.email,
    password: values.initialPassword,
    email_confirm: true,
    user_metadata: { role: values.role },
  })

  if (authError) return { error: authError.message }

  const authUserId = authData.user.id
  const healthStationId = values.healthStationId || null
  const avatarSeedInput = photoFormData?.get('avatarSeed')
  const avatarSeed = typeof avatarSeedInput === 'string' && avatarSeedInput.trim()
    ? avatarSeedInput
    : createRandomAvatarSeed()
  let profilePhotoUrl: string | null = null

  try {
    profilePhotoUrl = await uploadProfilePhoto(admin, authUserId, photoFormData)
  } catch (error) {
    await admin.auth.admin.deleteUser(authUserId)
    return {
      error: error instanceof Error ? error.message : 'Profile photo upload failed.',
    }
  }

  if (!profilePhotoUrl) {
    profilePhotoUrl = createUserAvatarDataUri({
      userId: values.userId,
      firstName: values.firstName,
      lastName: values.lastName,
      role: values.role,
      sex: values.sex,
    }, {
      seed: avatarSeed,
    })
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: authUserId,
    user_id: values.userId,
    email: values.email,
    first_name: values.firstName,
    middle_name: values.middleName || null,
    last_name: values.lastName,
    name_suffix: values.nameSuffix || null,
    date_of_birth: values.dateOfBirth || null,
    sex: values.sex,
    username: values.username,
    mobile_number: values.mobileNumber || null,
    alternate_mobile_number: values.alternateMobileNumber || null,
    address_line_1: values.addressLine1,
    address_line_2: values.addressLine2 || null,
    city_municipality: values.cityMunicipality,
    province: values.province,
    role: values.role,
    health_station_id: healthStationId,
    purok_assignment: values.purokAssignment || null,
    coverage_notes: values.coverageNotes || null,
    admin_notes: values.adminNotes || null,
    profile_photo_url: profilePhotoUrl,
    must_change_password: values.mustChangePassword,
    status: values.isActive ? 'active' : 'inactive',
    deactivation_reason: values.deactivationReason || null,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(authUserId)
    return { error: profileError.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUserAction(
  id: string,
  values: EditUserValues,
  photoFormData?: FormData
): Promise<ActionResult> {
  const admin = createAdminClient()
  const healthStationId = values.healthStationId || null
  const avatarSeedInput = photoFormData?.get('avatarSeed')
  const avatarSeed = typeof avatarSeedInput === 'string' && avatarSeedInput.trim()
    ? avatarSeedInput
    : createRandomAvatarSeed()
  let uploadedProfilePhotoUrl: string | null | undefined

  try {
    uploadedProfilePhotoUrl = await uploadProfilePhoto(admin, id, photoFormData) ?? undefined
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Profile photo upload failed.',
    }
  }

  const generatedAvatarUrl = createUserAvatarDataUri(
    {
      userId: values.userId,
      firstName: values.firstName,
      lastName: values.lastName,
      role: values.role,
      sex: values.sex,
    },
    {
      seed: avatarSeed,
    }
  )

  const profilePhotoPatch =
    uploadedProfilePhotoUrl !== undefined
      ? { profile_photo_url: uploadedProfilePhotoUrl }
      : values.profilePhotoPath
        ? {}
        : { profile_photo_url: generatedAvatarUrl }

  const { error } = await admin
    .from('profiles')
    .update({
      user_id: values.userId,
      email: values.email,
      first_name: values.firstName,
      middle_name: values.middleName || null,
      last_name: values.lastName,
      name_suffix: values.nameSuffix || null,
      date_of_birth: values.dateOfBirth || null,
      sex: values.sex,
      username: values.username,
      mobile_number: values.mobileNumber || null,
      alternate_mobile_number: values.alternateMobileNumber || null,
      address_line_1: values.addressLine1,
      address_line_2: values.addressLine2 || null,
      city_municipality: values.cityMunicipality,
      province: values.province,
      role: values.role,
      health_station_id: healthStationId,
      purok_assignment: values.purokAssignment || null,
      coverage_notes: values.coverageNotes || null,
      admin_notes: values.adminNotes || null,
      ...profilePhotoPatch,
      must_change_password: values.mustChangePassword,
      status: values.isActive ? 'active' : 'inactive',
      deactivation_reason: values.deactivationReason || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${id}/edit`)
  return { success: true }
}

export async function setUserStatusAction(
  ids: string[],
  status: UserStatus
): Promise<ActionResult> {
  const admin = createAdminClient()

  const { error } = await admin
    .from('profiles')
    .update({ status })
    .in('id', ids)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function resetPasswordsAction(
  ids: string[]
): Promise<ActionResult> {
  const admin = createAdminClient()

  const { error } = await admin
    .from('profiles')
    .update({ must_change_password: true })
    .in('id', ids)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}
