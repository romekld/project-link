"use client"

import type { Dispatch, SetStateAction } from 'react'
import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import {
  CalendarIcon,
  CheckIcon,
  ChevronsUpDown,
  EyeIcon,
  EyeOffIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Input } from '@/components/ui/input'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { barangayData } from '../../data/barangays'
import { roleOptions } from '../../data/options'
import {
  CITY_WIDE_ROLES,
  formatPhoneForInput,
  sexOptions,
  suffixOptions,
  type AddUserValues,
  type HealthStationOption,
} from '../../data/form-schema'

type UserFormMainPanelProps = {
  mode: 'create' | 'edit'
  control: Control<AddUserValues>
  errors: FieldErrors<AddUserValues>
  register: UseFormRegister<AddUserValues>
  values: Partial<AddUserValues>
  role: AddUserValues['role']
  stations: HealthStationOption[]
  isActive: boolean
  showTempPassword: boolean
  setShowTempPassword: Dispatch<SetStateAction<boolean>>
  isDobPickerOpen: boolean
  setIsDobPickerOpen: Dispatch<SetStateAction<boolean>>
  isStationPickerOpen: boolean
  setIsStationPickerOpen: Dispatch<SetStateAction<boolean>>
  selectedStationLabel?: string
  onUsernameManualEdit: () => void
  onSexChange: () => void
  onPhoneChange: (fieldName: 'mobileNumber' | 'alternateMobileNumber', raw: string) => void
  toIsoDate: (date: Date) => string
  parseIsoDate: (value?: string) => Date | undefined
  toReadableDate: (value?: string) => string
  suffixNoneValue: string
  provinceOptions: string[]
  cityMunicipalityOptions: string[]
  isDasmarinasMode: boolean
}

const barangaySuggestions = [...barangayData].sort((left, right) => left.name.localeCompare(right.name))

export function UserFormMainPanel({
  mode,
  control,
  errors,
  register,
  values,
  role,
  stations,
  isActive,
  showTempPassword,
  setShowTempPassword,
  isDobPickerOpen,
  setIsDobPickerOpen,
  isStationPickerOpen,
  setIsStationPickerOpen,
  selectedStationLabel,
  onUsernameManualEdit,
  onSexChange,
  onPhoneChange,
  toIsoDate,
  parseIsoDate,
  toReadableDate,
  suffixNoneValue,
  provinceOptions,
  cityMunicipalityOptions,
  isDasmarinasMode,
}: UserFormMainPanelProps) {
  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader className='border-b'>
          <CardTitle>Basic details</CardTitle>
          <CardDescription>Add the user&apos;s name and core identity details.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className='grid gap-4 md:grid-cols-2'>
              <Field data-invalid={!!errors.firstName}>
                <FieldLabel htmlFor='firstName'>First name</FieldLabel>
                <Input id='firstName' placeholder='Maria' aria-invalid={!!errors.firstName} {...register('firstName')} />
                <FieldError errors={[errors.firstName]} />
              </Field>
              <Field data-invalid={!!errors.lastName}>
                <FieldLabel htmlFor='lastName'>Last name</FieldLabel>
                <Input id='lastName' placeholder='Santos' aria-invalid={!!errors.lastName} {...register('lastName')} />
                <FieldError errors={[errors.lastName]} />
              </Field>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <Field>
                <FieldLabel htmlFor='middleName'>Middle name</FieldLabel>
                <Input id='middleName' placeholder='Leave blank if none' {...register('middleName')} />
              </Field>
              <Field>
                <FieldLabel htmlFor='nameSuffix'>Suffix</FieldLabel>
                <Controller
                  name='nameSuffix'
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(nextValue) =>
                        field.onChange(nextValue === suffixNoneValue ? '' : nextValue)
                      }
                      value={field.value?.trim() ? field.value : suffixNoneValue}
                    >
                      <SelectTrigger id='nameSuffix' className='w-full'>
                        <SelectValue placeholder='Choose a suffix' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={suffixNoneValue}>None</SelectItem>
                          {suffixOptions.filter((item) => item.value).map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <Field data-invalid={!!errors.dateOfBirth}>
                <FieldLabel htmlFor='dateOfBirth'>Date of birth</FieldLabel>
                <Controller
                  name='dateOfBirth'
                  control={control}
                  render={({ field }) => (
                    <Popover open={isDobPickerOpen} onOpenChange={setIsDobPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          className='w-full justify-between font-normal'
                          aria-invalid={!!errors.dateOfBirth}
                        >
                          {field.value ? toReadableDate(field.value) : 'Choose a date'}
                          <CalendarIcon data-icon='inline-end' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          captionLayout='dropdown'
                          startMonth={new Date(1940, 0, 1)}
                          endMonth={new Date()}
                          selected={parseIsoDate(field.value)}
                          onSelect={(nextDate) => {
                            if (!nextDate) return
                            field.onChange(toIsoDate(nextDate))
                            setIsDobPickerOpen(false)
                          }}
                          disabled={{ after: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <FieldError errors={[errors.dateOfBirth]} />
              </Field>
              <Field data-invalid={!!errors.sex}>
                <FieldLabel htmlFor='sex'>Sex</FieldLabel>
                <Controller
                  name='sex'
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(nextValue) => {
                        field.onChange(nextValue)
                        onSexChange()
                      }}
                      value={field.value}
                    >
                      <SelectTrigger id='sex' aria-invalid={!!errors.sex} className='w-full'>
                        <SelectValue placeholder='Choose sex' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {sexOptions.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.sex]} />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='border-b'>
          <CardTitle>Contact details</CardTitle>
          <CardDescription>Add the best email and phone number for this person.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor='email'>Email</FieldLabel>
              <Input id='email' type='email' placeholder='name@cho2.gov.ph' aria-invalid={!!errors.email} {...register('email')} />
              <FieldError errors={[errors.email]} />
            </Field>

            <div className='grid gap-4 md:grid-cols-2'>
              <Field data-invalid={!!errors.mobileNumber}>
                <FieldLabel htmlFor='mobileNumber'>Mobile number</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>+63 / 09</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id='mobileNumber'
                    aria-invalid={!!errors.mobileNumber}
                    placeholder='0917 123 4567 or +63 917 123 4567'
                    value={formatPhoneForInput(values.mobileNumber)}
                    onChange={(event) => onPhoneChange('mobileNumber', event.target.value)}
                  />
                </InputGroup>
                <FieldDescription>Use a Philippine mobile number, with or without +63.</FieldDescription>
                <FieldError errors={[errors.mobileNumber]} />
              </Field>

              <Field data-invalid={!!errors.alternateMobileNumber}>
                <FieldLabel htmlFor='alternateMobileNumber'>Alternate mobile</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>+63 / 09</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id='alternateMobileNumber'
                    aria-invalid={!!errors.alternateMobileNumber}
                    placeholder='Leave blank if none'
                    value={formatPhoneForInput(values.alternateMobileNumber)}
                    onChange={(event) => onPhoneChange('alternateMobileNumber', event.target.value)}
                  />
                </InputGroup>
                <FieldError errors={[errors.alternateMobileNumber]} />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='border-b'>
          <CardTitle>Home address</CardTitle>
          <CardDescription>Add the user&apos;s home or mailing address.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.addressLine1}>
              <FieldLabel htmlFor='addressLine1'>Address line 1</FieldLabel>
              <Input
                id='addressLine1'
                placeholder='House number, building, street, and unit if needed'
                aria-invalid={!!errors.addressLine1}
                {...register('addressLine1')}
              />
              <FieldDescription>Include the house number, building, street, and unit or floor if needed.</FieldDescription>
              <FieldError errors={[errors.addressLine1]} />
            </Field>

            <div className='grid gap-4 md:grid-cols-2'>
              <Field data-invalid={!!errors.province}>
                <FieldLabel htmlFor='province'>Province</FieldLabel>
                <Controller
                  name='province'
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      items={provinceOptions}
                      value={field.value ?? ''}
                      onValueChange={(nextValue) => field.onChange(nextValue ?? '')}
                    >
                      <ComboboxInput
                        id='province'
                        placeholder='Choose a province'
                        aria-invalid={!!errors.province}
                        showClear
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>No matching province found.</ComboboxEmpty>
                        <ComboboxList>
                          {(option) => (
                            <ComboboxItem key={option} value={option}>
                              {option}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )}
                />
                <FieldDescription>Required. Changing this clears City/Municipality and Address line 2.</FieldDescription>
                <FieldError errors={[errors.province]} />
              </Field>

              <Field data-invalid={!!errors.cityMunicipality}>
                <FieldLabel htmlFor='cityMunicipality'>City/Municipality</FieldLabel>
                <Controller
                  name='cityMunicipality'
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      items={cityMunicipalityOptions}
                      value={field.value ?? ''}
                      onValueChange={(nextValue) => field.onChange(nextValue ?? '')}
                    >
                      <ComboboxInput
                        id='cityMunicipality'
                        placeholder={values.province ? 'Choose a city or municipality' : 'Choose a province first'}
                        aria-invalid={!!errors.cityMunicipality}
                        showClear
                        disabled={!values.province}
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>No matching city or municipality found.</ComboboxEmpty>
                        <ComboboxList>
                          {(option) => (
                            <ComboboxItem key={option} value={option}>
                              {option}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )}
                />
                <FieldDescription>Required. The list updates based on the selected province.</FieldDescription>
                <FieldError errors={[errors.cityMunicipality]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.addressLine2}>
              <FieldLabel htmlFor='addressLine2'>Address line 2</FieldLabel>
              {isDasmarinasMode ? (
                <Controller
                  name='addressLine2'
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      items={barangaySuggestions.map((barangay) => barangay.name)}
                      value={field.value ?? ''}
                      onValueChange={(nextValue) => field.onChange(nextValue ?? '')}
                    >
                      <ComboboxInput
                        id='addressLine2'
                        placeholder='Search for a Dasmariñas barangay'
                        aria-invalid={!!errors.addressLine2}
                        showClear
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>No matching barangay found.</ComboboxEmpty>
                        <ComboboxList>
                          {(option) => (
                            <ComboboxItem key={option} value={option}>
                              {option}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )}
                />
              ) : (
                <Input
                  id='addressLine2'
                  placeholder='Subdivision, village, barangay, or locality'
                  aria-invalid={!!errors.addressLine2}
                  {...register('addressLine2')}
                />
              )}
              <FieldDescription>
                {isDasmarinasMode
                  ? 'Optional. Barangay suggestions appear automatically for Dasmariñas.'
                  : 'Optional. Use this for subdivisions, villages, barangays, or other local details.'}
              </FieldDescription>
              <FieldError errors={[errors.addressLine2]} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='border-b'>
          <CardTitle>Role and access</CardTitle>
          <CardDescription>Choose the user role, access scope, and account status.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className='grid gap-4 md:grid-cols-2'>
              <Field>
                <FieldLabel htmlFor='userId'>User ID</FieldLabel>
                <Input id='userId' readOnly value={values.userId} className='bg-muted/50' />
                <FieldDescription>Generated automatically.</FieldDescription>
              </Field>

              <Field data-invalid={!!errors.username}>
                <FieldLabel htmlFor='username'>Username</FieldLabel>
                <Input
                  id='username'
                  placeholder='Suggested from the name fields'
                  aria-invalid={!!errors.username}
                  {...register('username', {
                    onChange: onUsernameManualEdit,
                  })}
                />
                <FieldError errors={[errors.username]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.role}>
              <FieldLabel htmlFor='role'>Role</FieldLabel>
              <Controller
                name='role'
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id='role' className='w-full' aria-invalid={!!errors.role}>
                      <SelectValue placeholder='Choose a role' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.role]} />
            </Field>

            {mode === 'create' ? (
              <Field data-invalid={!!errors.initialPassword}>
                <FieldLabel htmlFor='initialPassword'>Temporary password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id='initialPassword'
                    type={showTempPassword ? 'text' : 'password'}
                    aria-invalid={!!errors.initialPassword}
                    placeholder='Set a temporary password'
                    {...register('initialPassword')}
                  />
                  <InputGroupAddon align='inline-end'>
                    <InputGroupButton
                      type='button'
                      variant='ghost'
                      size='icon-xs'
                      onClick={() => setShowTempPassword((current) => !current)}
                      aria-label={showTempPassword ? 'Hide password' : 'Show password'}
                    >
                      {showTempPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>Minimum 12 characters. The user must change it on first login.</FieldDescription>
                <FieldError errors={[errors.initialPassword]} />
              </Field>
            ) : null}

            <div className='grid gap-4 md:grid-cols-2'>
              <Field>
                <FieldLabel htmlFor='mustChangePassword'>Require password change on login</FieldLabel>
                <Controller
                  name='mustChangePassword'
                  control={control}
                  render={({ field }) => (
                    <div className='flex h-10 items-center rounded-lg px-3'>
                      <Switch
                        id='mustChangePassword'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className='ml-3 text-sm text-muted-foreground'>
                        Show a password change prompt when the user signs in
                      </span>
                    </div>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='isActive'>Active account</FieldLabel>
                <Controller
                  name='isActive'
                  control={control}
                  render={({ field }) => (
                    <div className='flex h-10 items-center rounded-lg px-3'>
                      <Switch
                        id='isActive'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className='ml-3 text-sm text-muted-foreground'>
                        Allow this account to sign in
                      </span>
                    </div>
                  )}
                />
              </Field>
            </div>

            {!isActive ? (
              <Field data-invalid={!!errors.deactivationReason}>
                <FieldLabel htmlFor='deactivationReason'>Deactivation reason</FieldLabel>
                <Textarea id='deactivationReason' placeholder='Briefly explain why access is being removed.' aria-invalid={!!errors.deactivationReason} {...register('deactivationReason')} />
                <FieldError errors={[errors.deactivationReason]} />
              </Field>
            ) : null}
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='border-b'>
          <CardTitle>Station assignment</CardTitle>
          <CardDescription>Assign the user&apos;s station, purok, and coverage notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.healthStationId}>
              <FieldLabel htmlFor='healthStationId'>Health station</FieldLabel>
              <Controller
                name='healthStationId'
                control={control}
                render={({ field }) => (
                  <Popover
                    open={CITY_WIDE_ROLES.includes(role) ? false : isStationPickerOpen}
                    onOpenChange={setIsStationPickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        id='healthStationId'
                        type='button'
                        variant='outline'
                        role='combobox'
                        disabled={CITY_WIDE_ROLES.includes(role)}
                        aria-invalid={!!errors.healthStationId}
                        className='h-10 w-full justify-between font-normal'
                      >
                        <span className='truncate'>
                          {CITY_WIDE_ROLES.includes(role)
                            ? "This role doesn't need a health station"
                            : selectedStationLabel || 'Choose a health station'}
                        </span>
                        <ChevronsUpDown data-icon='inline-end' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
                      <Command>
                        <CommandInput placeholder='Search for a health station...' />
                        <CommandList>
                          <CommandEmpty>No matching health station found.</CommandEmpty>
                          <CommandGroup heading='Barangay Health Stations'>
                            {stations.map((station) => {
                              const isSelected = station.id === field.value

                              return (
                                <CommandItem
                                  key={station.id}
                                  value={station.name}
                                  onSelect={() => {
                                    field.onChange(station.id)
                                    setIsStationPickerOpen(false)
                                  }}
                                  data-checked={isSelected}
                                  className='[&>svg:last-child]:hidden'
                                >
                                  <CheckIcon
                                    className={isSelected ? 'opacity-100' : 'opacity-0'}
                                  />
                                  {station.name}
                                  <span className='ml-auto text-xs text-muted-foreground'>{station.stationCode}</span>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              <FieldError errors={[errors.healthStationId]} />
            </Field>

            {role === 'bhw' ? (
              <Field>
                <FieldLabel htmlFor='purokAssignment'>Purok assignment</FieldLabel>
                <Input id='purokAssignment' placeholder='e.g. Purok 4B' {...register('purokAssignment')} />
              </Field>
            ) : null}

            <Field>
              <FieldLabel htmlFor='coverageNotes'>Coverage notes</FieldLabel>
              <Textarea id='coverageNotes' placeholder='Add coverage area, schedule limits, or station-specific notes.' {...register('coverageNotes')} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='border-b'>
          <CardTitle>Internal notes</CardTitle>
          <CardDescription>Private notes for admin use only.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor='adminNotes'>Internal note</FieldLabel>
            <Textarea id='adminNotes' placeholder='Private note for admins only.' {...register('adminNotes')} />
          </Field>
        </CardContent>
      </Card>
    </div>
  )
}
