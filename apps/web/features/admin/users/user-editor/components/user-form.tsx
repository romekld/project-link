"use client"

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  getCityMunicipalityOptionsByProvinceName,
  getProvinceOptions,
  isDasmarinasSelection,
} from '@/lib/location'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { createRandomAvatarSeed, createUserAvatarDataUri } from '../../data/avatar'
import { roleOptions } from '../../data/options'
import {
  addUserSchema,
  buildDefaultFormValues,
  CITY_WIDE_ROLES,
  createUserId,
  editUserSchema,
  normalizePhoneInput,
  suggestUsername,
  type AddUserValues,
  type HealthStationOption,
} from '../../data/form-schema'
import { UserFormMainPanel } from './user-form-main-panel'
import { UserFormRightPanel } from './user-form-right-panel'

type UserFormMode = 'create' | 'edit'

type UserFormProps = {
  mode: UserFormMode
  roleCounts?: Record<string, number>
  stations: HealthStationOption[]
  defaultValues?: Partial<AddUserValues>
  activity?: {
    createdAt?: string
    updatedAt?: string
    lastLoginAt?: string | null
    passwordChangedAt?: string | null
  }
  onSubmit: (values: AddUserValues, photoFormData?: FormData) => void | Promise<void>
}

const roleAccessNotes: Record<string, string[]> = {
  bhw: [
    'Records community visits and household-level data.',
    'Keep the purok assignment up to date.',
  ],
  rhm: [
    'Reviews TCL records and oversees maternal workflows.',
    'A station assignment is required for this role.',
  ],
  phn: [
    'Coordinates reviews and escalations across stations.',
    'Usually set up as city-wide.',
  ],
  cho: [
    'Read-only access to city-wide dashboards and alerts.',
    'Used for oversight and decision-making.',
  ],
  system_admin: [
    'Manages account creation and platform settings.',
    'Should stay city-wide and tightly restricted.',
  ],
}

const SUFFIX_NONE_VALUE = '__none__'

function toDisplayDate(value?: string | null) {
  if (!value) return 'Not available'

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseIsoDate(value?: string) {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map((entry) => Number(entry))
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function toReadableDate(value?: string) {
  if (!value) return ''
  const parsed = parseIsoDate(value)
  if (!parsed) return ''

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(parsed)
}

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'NA'
}

export function UserForm({
  mode,
  roleCounts = {},
  stations,
  defaultValues,
  activity,
  onSubmit,
}: UserFormProps) {
  const initialPhotoPath = defaultValues?.profilePhotoPath ?? ''
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(initialPhotoPath)
  const [photoError, setPhotoError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isDobPickerOpen, setIsDobPickerOpen] = useState(false)
  const [isStationPickerOpen, setIsStationPickerOpen] = useState(false)
  const [showTempPassword, setShowTempPassword] = useState(false)
  const [usernameEdited, setUsernameEdited] = useState(false)
  const [randomAvatarSeed, setRandomAvatarSeed] = useState(() => createRandomAvatarSeed())
  const previousRoleRef = useRef<string | undefined>(undefined)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const photoObjectUrlRef = useRef<string | null>(null)

  const form = useForm<AddUserValues>({
    resolver: zodResolver(mode === 'create' ? addUserSchema : editUserSchema) as never,
    defaultValues: {
      ...buildDefaultFormValues({ roleCounts }),
      ...defaultValues,
    },
  })

  const {
    register,
    control,
    reset,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  const values = useWatch({
    control,
  })

  const firstName = values.firstName ?? ''
  const lastName = values.lastName ?? ''
  const role = values.role ?? 'bhw'
  const sex = values.sex ?? 'F'
  const isActive = values.isActive ?? true
  const mustChangePassword = values.mustChangePassword ?? true
  const selectedProvince = values.province ?? ''
  const selectedCityMunicipality = values.cityMunicipality ?? ''
  const selectedStationLabel = stations.find(
    (item) => item.id === values.healthStationId
  )?.name
  const provinceOptions = useMemo(() => getProvinceOptions(), [])
  const generatedAvatarUrl = useMemo(
    () =>
      createUserAvatarDataUri({
        userId: values.userId,
        firstName,
        lastName,
        role,
        sex,
      }, {
        seed: mode === 'create' ? randomAvatarSeed : undefined,
      }),
    [firstName, lastName, mode, randomAvatarSeed, role, sex, values.userId]
  )
  const hasCustomPhoto = Boolean(photoPreviewUrl)
  const displayPhotoPreviewUrl = photoPreviewUrl || generatedAvatarUrl
  const cityMunicipalityOptions = useMemo(
    () => getCityMunicipalityOptionsByProvinceName(selectedProvince),
    [selectedProvince]
  )
  const isDasmarinasMode = isDasmarinasSelection(selectedProvince, selectedCityMunicipality)
  const previousProvinceRef = useRef<string | undefined>(undefined)
  const previousDasmarinasModeRef = useRef<boolean | undefined>(undefined)

  function revokePhotoObjectUrl() {
    if (!photoObjectUrlRef.current) return
    URL.revokeObjectURL(photoObjectUrlRef.current)
    photoObjectUrlRef.current = null
  }

  function getCurrentDefaults() {
    return {
      ...buildDefaultFormValues({ roleCounts }),
      ...defaultValues,
    }
  }

  function handleResetForm() {
    const nextDefaults = getCurrentDefaults()
    setRandomAvatarSeed(createRandomAvatarSeed())
    revokePhotoObjectUrl()
    reset(nextDefaults)
    setPhotoPreviewUrl(nextDefaults.profilePhotoPath ?? '')
    setPhotoFile(null)
    setPhotoError('')

    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
  }

  useEffect(() => {
    return () => {
      if (photoObjectUrlRef.current) {
        URL.revokeObjectURL(photoObjectUrlRef.current)
        photoObjectUrlRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (usernameEdited) return

    const suggested = suggestUsername(firstName, lastName)
    if (!suggested) return

    setValue('username', suggested, {
      shouldDirty: false,
      shouldValidate: true,
    })
  }, [firstName, lastName, setValue, usernameEdited])

  useEffect(() => {
    if (mode !== 'create') return

    if (previousRoleRef.current === undefined) {
      previousRoleRef.current = role
      return
    }

    if (previousRoleRef.current !== role) {
      const nextCount = (roleCounts[role] ?? 0) + 1
      setValue('userId', createUserId(role, nextCount), {
        shouldDirty: false,
        shouldValidate: true,
      })
      previousRoleRef.current = role
    }
  }, [role, mode, roleCounts, setValue])

  useEffect(() => {
    if (!CITY_WIDE_ROLES.includes(role)) {
      return
    }

    setValue('healthStationId', '', { shouldValidate: true })
    setValue('purokAssignment', '', { shouldValidate: true })
  }, [role, setValue])

  useEffect(() => {
    if (previousProvinceRef.current === undefined) {
      previousProvinceRef.current = selectedProvince
      return
    }

    if (previousProvinceRef.current !== selectedProvince) {
      setValue('cityMunicipality', '', { shouldDirty: true, shouldValidate: true })
      setValue('addressLine2', '', { shouldDirty: true, shouldValidate: true })
    }

    previousProvinceRef.current = selectedProvince
  }, [selectedProvince, setValue])

  useEffect(() => {
    if (previousDasmarinasModeRef.current === undefined) {
      previousDasmarinasModeRef.current = isDasmarinasMode
      return
    }

    if (previousDasmarinasModeRef.current !== isDasmarinasMode) {
      setValue('addressLine2', '', { shouldDirty: true, shouldValidate: true })
    }

    previousDasmarinasModeRef.current = isDasmarinasMode
  }, [isDasmarinasMode, setValue])

  const roleOption = roleOptions.find((item) => item.value === role)
  const roleNotes = roleAccessNotes[role] ?? []

  function handlePhoneChange(fieldName: 'mobileNumber' | 'alternateMobileNumber', raw: string) {
    setValue(fieldName, normalizePhoneInput(raw), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  function handleSexChange() {
    if (mode !== 'create') return
    // Reroll a fresh avatar when sex is toggled.
    setRandomAvatarSeed(createRandomAvatarSeed())
  }

  function handleRerollAvatar() {
    if (hasCustomPhoto) return
    setRandomAvatarSeed(createRandomAvatarSeed())
  }

  function handleChoosePhoto() {
    photoInputRef.current?.click()
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxBytes = 2 * 1024 * 1024

    if (!validTypes.includes(file.type)) {
      setPhotoError('Only JPG, PNG, or WEBP files are allowed.')
      event.target.value = ''
      return
    }

    if (file.size > maxBytes) {
      setPhotoError('Image must be 2 MB or smaller.')
      event.target.value = ''
      return
    }

    revokePhotoObjectUrl()

    const localUrl = URL.createObjectURL(file)
    photoObjectUrlRef.current = localUrl
    setPhotoError('')
    setPhotoFile(file)
    setPhotoPreviewUrl(localUrl)
    setValue('profilePhotoPath', file.name, { shouldDirty: true })
  }

  function handleRemovePhoto() {
    revokePhotoObjectUrl()

    setPhotoError('')
    setPhotoFile(null)
    setPhotoPreviewUrl('')
    setValue('profilePhotoPath', '', { shouldDirty: true })

    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
  }

  function handleFormSubmit(nextValues: AddUserValues) {
    const photoFormData = new FormData()
    photoFormData.set('avatarSeed', randomAvatarSeed)

    if (photoFile) {
      photoFormData.set('profilePhoto', photoFile)
    }

    return onSubmit(nextValues, photoFormData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='flex min-h-0 flex-1 flex-col'>
      <section className='mx-auto flex h-full min-h-0 w-full max-w-[1000px] flex-1 flex-col overflow-hidden'>
        <div className='shrink-0 bg-background/95 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:pb-6'>
          <PageHeader
            title={mode === 'create' ? 'Add User' : 'Edit User'}
            description={
              mode === 'create'
                ? 'Set up a staff account with the right role and access.'
                : 'Update profile details, permissions, and account status.'
            }
            controls={
              <>
                <Button asChild className='' variant='outline'>
                  <Link href='/admin/users'>Cancel</Link>
                </Button>
                <Button
                  className=''
                  onClick={handleResetForm}
                  type='button'
                  variant='outline'
                >
                  Reset
                </Button>
                <Button className='' type='submit' disabled={isSubmitting}>
                  {isSubmitting
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : mode === 'create'
                    ? 'Create User'
                    : 'Update User'}
                </Button>
              </>
            }
          />
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto'>
          <div className='flex flex-col gap-4 px-1 py-2 sm:gap-5 sm:pr-2'>
            <section className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]'>
              <UserFormMainPanel
                mode={mode}
                control={control}
                errors={errors}
                register={register}
                values={values}
                role={role}
                stations={stations}
                isActive={isActive}
                showTempPassword={showTempPassword}
                setShowTempPassword={setShowTempPassword}
                isDobPickerOpen={isDobPickerOpen}
                setIsDobPickerOpen={setIsDobPickerOpen}
                isStationPickerOpen={isStationPickerOpen}
                setIsStationPickerOpen={setIsStationPickerOpen}
                selectedStationLabel={selectedStationLabel}
                onUsernameManualEdit={() => setUsernameEdited(true)}
                onSexChange={handleSexChange}
                onPhoneChange={handlePhoneChange}
                toIsoDate={toIsoDate}
                parseIsoDate={parseIsoDate}
                toReadableDate={toReadableDate}
                suffixNoneValue={SUFFIX_NONE_VALUE}
                provinceOptions={provinceOptions.map((option) => option.label)}
                cityMunicipalityOptions={cityMunicipalityOptions.map((option) => option.label)}
                isDasmarinasMode={isDasmarinasMode}
              />

              <UserFormRightPanel
                values={values}
                stations={stations}
                roleOptionLabel={roleOption?.label}
                roleNotes={roleNotes}
                mustChangePassword={mustChangePassword}
                isActive={isActive}
                activity={activity}
                photoPreviewUrl={displayPhotoPreviewUrl}
                hasCustomPhoto={hasCustomPhoto}
                photoError={photoError}
                photoInputRef={photoInputRef}
                onChoosePhoto={handleChoosePhoto}
                onRerollAvatar={handleRerollAvatar}
                onPhotoChange={handlePhotoChange}
                onRemovePhoto={handleRemovePhoto}
                toDisplayDate={toDisplayDate}
                getInitials={getInitials}
              />
            </section>
          </div>
        </div>
      </section>
    </form>
  )
}
