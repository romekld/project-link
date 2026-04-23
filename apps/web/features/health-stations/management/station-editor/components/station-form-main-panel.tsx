"use client"

import { useMemo, useState } from 'react'
import { CheckIcon, ChevronsUpDownIcon, TriangleAlertIcon } from 'lucide-react'
import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { facilityTypeOptions } from '../../data/options'
import {
  type CityBarangayOption,
  type OperationalBarangayOption,
  type AddStationValues,
} from '../../data/form-schema'

type StationFormMainPanelProps = {
  control: Control<AddStationValues>
  errors: FieldErrors<AddStationValues>
  register: UseFormRegister<AddStationValues>
  values: Partial<AddStationValues>
  isPhysicalBarangayOpen: boolean
  setIsPhysicalBarangayOpen: (open: boolean) => void
  physicalBarangayOptions: CityBarangayOption[]
  operationalBarangays: OperationalBarangayOption[]
  selectedPhysicalBarangayLabel: string
  hasPrimaryConflicts: boolean
  onCoverageActiveChange: (index: number, active: boolean) => void
  onCoveragePrimaryChange: (index: number, primary: boolean) => void
  submitError?: string | null
}

export function StationFormMainPanel({
  control,
  errors,
  register,
  values,
  isPhysicalBarangayOpen,
  setIsPhysicalBarangayOpen,
  physicalBarangayOptions,
  operationalBarangays,
  selectedPhysicalBarangayLabel,
  hasPrimaryConflicts,
  onCoverageActiveChange,
  onCoveragePrimaryChange,
  submitError,
}: StationFormMainPanelProps) {
  const [coverageSearchQuery, setCoverageSearchQuery] = useState('')
  const filteredCoverageRows = useMemo(() => {
    const query = coverageSearchQuery.trim().toLowerCase()

    if (!query) {
      return operationalBarangays.map((barangay, index) => ({ barangay, index }))
    }

    return operationalBarangays
      .map((barangay, index) => ({ barangay, index }))
      .filter(({ barangay }) => {
        const haystack = `${barangay.name} ${barangay.pcode}`.toLowerCase()
        return haystack.includes(query)
      })
  }, [coverageSearchQuery, operationalBarangays])

  return (
    <div className='flex flex-col gap-4'>
      {submitError && (
        <Alert variant='destructive'>
          <TriangleAlertIcon />
          <AlertTitle>Could not save station</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader className='border-b'>
          <CardTitle>Station identity</CardTitle>
          <CardDescription>
            Capture canonical facility details for registry and downstream assignment workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.stationCode}>
              <FieldLabel htmlFor='stationCode'>Station code</FieldLabel>
              <Input
                id='stationCode'
                readOnly
                className='bg-muted'
                aria-invalid={!!errors.stationCode}
                {...register('stationCode')}
              />
              <FieldDescription>Auto-generated format: BHS-YYYY-######.</FieldDescription>
              <FieldError errors={[errors.stationCode]} />
            </Field>

            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='name'>Station name</FieldLabel>
              <Input id='name' placeholder='Santa Cruz I Health Station' aria-invalid={!!errors.name} {...register('name')} />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.facilityType}>
              <FieldLabel htmlFor='facilityType'>Facility type</FieldLabel>
              <Controller
                name='facilityType'
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id='facilityType' className='w-full' aria-invalid={!!errors.facilityType}>
                      <SelectValue placeholder='Select facility type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {facilityTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.facilityType]} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='border-b'>
          <CardTitle>Physical location and status</CardTitle>
          <CardDescription>
            Physical city barangay is where the station is located, separate from service coverage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.physicalCityBarangayId}>
              <FieldLabel htmlFor='physicalCityBarangayId'>Physical Barangay Location</FieldLabel>
              <Controller
                name='physicalCityBarangayId'
                control={control}
                render={({ field }) => (
                  <Popover open={isPhysicalBarangayOpen} onOpenChange={setIsPhysicalBarangayOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id='physicalCityBarangayId'
                        type='button'
                        variant='outline'
                        role='combobox'
                        aria-invalid={!!errors.physicalCityBarangayId}
                        className='h-10 w-full justify-between font-normal'
                      >
                        <span className='truncate'>
                          {selectedPhysicalBarangayLabel || 'Select city barangay'}
                        </span>
                        <ChevronsUpDownIcon data-icon='inline-end' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
                      <Command>
                        <CommandInput placeholder='Search city barangay...' />
                        <CommandList>
                          <CommandEmpty>No matching city barangay found.</CommandEmpty>
                          <CommandGroup heading='City barangays'>
                            {physicalBarangayOptions.map((option) => {
                              const isSelected = option.id === field.value

                              return (
                                <CommandItem
                                  key={option.id}
                                  value={`${option.name} ${option.pcode}`}
                                  onSelect={() => {
                                    field.onChange(option.id)
                                    setIsPhysicalBarangayOpen(false)
                                  }}
                                  data-checked={isSelected}
                                  className='[&>svg:last-child]:hidden'
                                >
                                  <CheckIcon className={isSelected ? 'opacity-100' : 'opacity-0'} />
                                  <span className='truncate'>{option.name}</span>
                                  <span className='ml-auto text-xs text-muted-foreground'>{option.pcode}</span>
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
              <FieldError errors={[errors.physicalCityBarangayId]} />
            </Field>

            <Field>
              <FieldLabel htmlFor='address'>Address</FieldLabel>
              <Input id='address' placeholder='House no., street, landmark' {...register('address')} />
            </Field>

            <Field>
              <FieldLabel htmlFor='notes'>Operational notes</FieldLabel>
              <Textarea id='notes' rows={3} placeholder='Optional notes for routing or station context.' {...register('notes')} />
            </Field>

            <Field>
              <Controller
                name='isActive'
                control={control}
                render={({ field }) => (
                  <div className='flex min-h-11 items-center justify-between rounded-md border px-3'>
                    <div className='flex items-center gap-2'>
                      <FieldLabel className='m-0' htmlFor='isActive'>Station status</FieldLabel>
                      <Badge variant={field.value ? 'default' : 'outline'}>
                        {field.value ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Switch
                      id='isActive'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
              <FieldDescription>
                Inactive stations should not be used for active service workflows.
              </FieldDescription>
            </Field>

            {!values.isActive ? (
              <Field data-invalid={!!errors.deactivationReason}>
                <FieldLabel htmlFor='deactivationReason'>Deactivation reason</FieldLabel>
                <Textarea
                  id='deactivationReason'
                  rows={3}
                  placeholder='Required when station is inactive.'
                  aria-invalid={!!errors.deactivationReason}
                  {...register('deactivationReason')}
                />
                <FieldError errors={[errors.deactivationReason]} />
              </Field>
            ) : (
              <Field data-disabled>
                <FieldLabel htmlFor='deactivationReason'>Deactivation reason</FieldLabel>
                <Input id='deactivationReason' disabled value='Not required while station is active' />
              </Field>
            )}
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='border-b'>
          <CardTitle>Service coverage assignments</CardTitle>
          <CardDescription>
            Assign operational barangays and mark primary ownership where applicable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {hasPrimaryConflicts ? (
              <Alert>
                <TriangleAlertIcon />
                <AlertTitle>Primary reassignment review required</AlertTitle>
                <AlertDescription>
                  One or more rows will replace another station&apos;s primary ownership.
                </AlertDescription>
              </Alert>
            ) : null}

            <Field>
              <FieldLabel htmlFor='coverageSearchQuery'>Search operational barangays</FieldLabel>
              <Input
                id='coverageSearchQuery'
                placeholder='Search by barangay name or PSGC'
                value={coverageSearchQuery}
                onChange={(event) => setCoverageSearchQuery(event.target.value)}
              />
            </Field>

            <div className='overflow-auto rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-16'>Use</TableHead>
                    <TableHead>Barangay</TableHead>
                    <TableHead className='w-24'>Primary</TableHead>
                    <TableHead className='w-[40%]'>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoverageRows.length ? (
                    filteredCoverageRows.map(({ barangay, index }) => {
                      const currentRow = values.coverageRows?.[index]
                      const showConflict = Boolean(
                        currentRow?.isActive &&
                          currentRow?.isPrimary &&
                          currentRow?.currentPrimaryStationName
                      )

                      return (
                        <TableRow key={barangay.id}>
                          <TableCell>
                            <Controller
                              name={`coverageRows.${index}.isActive`}
                              control={control}
                              render={({ field }) => (
                                <Checkbox
                                  id={`coverageRows.${index}.isActive`}
                                  checked={field.value}
                                  onCheckedChange={(nextValue) => {
                                    const checked = Boolean(nextValue)
                                    field.onChange(checked)
                                    onCoverageActiveChange(index, checked)
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className='truncate font-medium'>{`${barangay.name} (${barangay.pcode})`}</p>
                              {showConflict ? (
                                <Badge className='mt-2' variant='outline'>
                                  Currently primary: {currentRow?.currentPrimaryStationName}
                                </Badge>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`coverageRows.${index}.isPrimary`}
                              control={control}
                              render={({ field }) => (
                                <Switch
                                  id={`coverageRows.${index}.isPrimary`}
                                  checked={field.value}
                                  disabled={!values.coverageRows?.[index]?.isActive}
                                  onCheckedChange={(nextValue) => {
                                    field.onChange(nextValue)
                                    onCoveragePrimaryChange(index, nextValue)
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              id={`coverageRows.${index}.notes`}
                              placeholder='Optional note'
                              {...register(`coverageRows.${index}.notes`)}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell className='text-center text-muted-foreground' colSpan={4}>
                        No matching operational barangays.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <FieldError errors={[errors.coverageRows as { message?: string } | undefined]} />
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
