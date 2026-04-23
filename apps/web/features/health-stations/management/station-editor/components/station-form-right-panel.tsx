"use client"

import { ActivityIcon, MapPinIcon, ShieldAlertIcon, ShieldCheckIcon, WaypointsIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type {
  AddStationValues,
  CityBarangayOption,
  StationFormValues,
} from '../../data/form-schema'
import {
  deriveCoverageWarnings,
  getCityBarangayLabel,
  getCoverageBarangayLabel,
} from '../../data/form-schema'
import { getFacilityTypeLabel, getPinStatusLabel } from '../../data/options'

type StationFormRightPanelProps = {
  values: Partial<AddStationValues>
  mode: 'create' | 'edit'
  coordinatesLabel: string
  physicalBarangayOptions: CityBarangayOption[]
  pinSourceLabel: string
  onOpenPinEditor: () => void
  activity?: {
    createdAt?: string
    updatedAt?: string
    deactivatedAt?: string | null
  }
}

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

export function StationFormRightPanel({
  values,
  mode,
  coordinatesLabel,
  physicalBarangayOptions,
  pinSourceLabel,
  onOpenPinEditor,
  activity,
}: StationFormRightPanelProps) {
  const warnings = deriveCoverageWarnings(values as Partial<StationFormValues>)
  const activeCoverage = (values.coverageRows ?? []).filter((row) => row.isActive)
  const primaryCoverage = activeCoverage.filter((row) => row.isPrimary)
  const physicalBarangay = getCityBarangayLabel(
    values.physicalCityBarangayId,
    physicalBarangayOptions
  )

  return (
    <aside className='h-fit self-start rounded-2xl border border-dashed bg-card p-3 sm:p-4'>
      <div className='flex flex-col gap-4'>
        <Card className='rounded-xl bg-background shadow-none'>
          <CardHeader className='border-b'>
            <CardTitle>Station snapshot</CardTitle>
            <CardDescription>Check core identity and assignment status before saving.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Station code</span>
              <span className='font-medium'>{values.stationCode || 'Not set'}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Facility type</span>
              <Badge variant='secondary'>
                {values.facilityType ? getFacilityTypeLabel(values.facilityType) : 'Not set'}
              </Badge>
            </div>
            <div className='flex items-start justify-between gap-3'>
              <span className='text-muted-foreground'>Physical barangay</span>
              <p className='max-w-[60%] text-right font-medium'>{physicalBarangay}</p>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Service assignments</span>
              <span className='font-medium'>{activeCoverage.length}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Primary assignments</span>
              <span className='font-medium'>{primaryCoverage.length}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Pin status</span>
              <Badge variant='outline'>
                {values.pinStatus ? getPinStatusLabel(values.pinStatus) : 'Needs pin'}
              </Badge>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-muted-foreground'>Pin source</span>
              <span className='max-w-[60%] text-right text-sm font-medium'>{pinSourceLabel}</span>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-muted-foreground'>Coordinates</span>
              <span className='max-w-[60%] text-right font-mono text-xs tabular-nums'>{coordinatesLabel}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Record status</span>
              <Badge variant={values.isActive ? 'default' : 'outline'}>
                {values.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <Button className='w-full' onClick={onOpenPinEditor} type='button' variant='outline'>
              <MapPinIcon data-icon='inline-start' />
              Open pin editor
            </Button>
          </CardContent>
        </Card>

        <Card className='rounded-xl bg-background shadow-none'>
          <CardHeader className='border-b'>
            <CardTitle>Coverage health</CardTitle>
            <CardDescription>Quick check for assignment quality and risks.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            <div className='flex items-start gap-2 text-sm'>
              <WaypointsIcon className='mt-0.5 size-4 text-muted-foreground' />
              <p className='text-muted-foreground'>
                Active operational barangays should stay explicit and reviewable before save.
              </p>
            </div>

            {primaryCoverage.length > 0 ? (
              <div className='rounded-md border p-3 text-sm'>
                <p className='mb-2 font-medium'>Primary barangays</p>
                <ul className='flex list-disc flex-col gap-1 pl-4 text-muted-foreground'>
                  {primaryCoverage.map((row) => (
                    <li key={row.barangayId}>{getCoverageBarangayLabel(row.barangayId)}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {warnings.length > 0 ? (
              <div className='rounded-md border border-dashed p-3 text-sm'>
                <div className='mb-2 flex items-center gap-2'>
                  <ShieldAlertIcon className='size-4 text-muted-foreground' />
                  <p className='font-medium'>Review warnings</p>
                </div>
                <ul className='flex list-disc flex-col gap-1 pl-4 text-muted-foreground'>
                  {warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className='rounded-md border border-dashed p-3 text-sm'>
                <div className='flex items-center gap-2'>
                  <ShieldCheckIcon className='size-4 text-muted-foreground' />
                  <p className='font-medium'>No high-risk conflicts detected</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='rounded-xl bg-background shadow-none'>
          <CardHeader className='border-b'>
            <CardTitle>Activity</CardTitle>
            <CardDescription>
              {mode === 'create' ? 'Timestamps will be populated after first save.' : 'Recent timeline for this station record.'}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-2 text-sm'>
            <div className='flex items-start gap-2'>
              <ActivityIcon className='mt-0.5 size-4 text-muted-foreground' />
              <div>
                <p className='text-muted-foreground'>Created</p>
                <p className='font-medium'>{toDisplayDate(activity?.createdAt)}</p>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <MapPinIcon className='mt-0.5 size-4 text-muted-foreground' />
              <div>
                <p className='text-muted-foreground'>Updated</p>
                <p className='font-medium'>{toDisplayDate(activity?.updatedAt)}</p>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <ShieldAlertIcon className='mt-0.5 size-4 text-muted-foreground' />
              <div>
                <p className='text-muted-foreground'>Last deactivated</p>
                <p className='font-medium'>{toDisplayDate(activity?.deactivatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
