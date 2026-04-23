"use client"

import type { Row } from '@tanstack/react-table'
import {
  MapPinnedIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SquarePenIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { HealthStation } from '../data/schema'
import {
  formatCoordinates,
  formatPinStatus,
  formatStationStatus,
  formatUpdatedAt,
} from '../data/formatters'
import { getFacilityTypeLabel } from '../data/options'

type HealthStationsMobileCardsProps = {
  rows: Row<HealthStation>[]
  onToggleStatus: (station: HealthStation) => void
}

export function HealthStationsMobileCards({
  rows,
  onToggleStatus,
}: HealthStationsMobileCardsProps) {
  if (!rows.length) {
    return (
      <div className='rounded-md border p-6 text-center text-sm text-muted-foreground'>
        No health stations found for this filter set.
      </div>
    )
  }

  return (
    <div className='grid gap-3'>
      {rows.map((row) => {
        const station = row.original
        const canActivate = station.status === 'inactive'

        return (
          <article
            className='rounded-md border bg-card p-3 shadow-none'
            data-state={row.getIsSelected() ? 'selected' : undefined}
            key={station.id}
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-start gap-3'>
                <Checkbox
                  aria-label={`Select ${station.stationCode}`}
                  checked={row.getIsSelected()}
                  onCheckedChange={(checked) => row.toggleSelected(!!checked)}
                />
                <div className='min-w-0'>
                  <p className='font-medium'>{station.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {station.stationCode}
                  </p>
                </div>
              </div>
              <Badge variant={station.status === 'active' ? 'default' : 'outline'}>
                {formatStationStatus(station.status)}
              </Badge>
            </div>

            <dl className='mt-3 grid gap-2 text-sm'>
              <div className='grid grid-cols-[112px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Type</dt>
                <dd>{getFacilityTypeLabel(station.facilityType)}</dd>
              </div>
              <div className='grid grid-cols-[112px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Barangay</dt>
                <dd className='min-w-0'>
                  <p>{station.physicalBarangayName}</p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {station.physicalBarangayPcode}
                  </p>
                </dd>
              </div>
              <div className='grid grid-cols-[112px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Coverage</dt>
                <dd>
                  {station.coverageCount} service - {station.primaryCoverageCount}{' '}
                  primary
                </dd>
              </div>
              <div className='grid grid-cols-[112px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Staff</dt>
                <dd>{station.assignedStaffCount}</dd>
              </div>
              <div className='grid grid-cols-[112px_1fr] gap-2'>
                <dt className='text-muted-foreground'>GIS pin</dt>
                <dd>
                  {formatPinStatus(station.pinStatus)}
                  <span className='block truncate text-xs text-muted-foreground'>
                    {formatCoordinates(station.latitude, station.longitude)}
                  </span>
                </dd>
              </div>
              <div className='grid grid-cols-[112px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Updated</dt>
                <dd>{formatUpdatedAt(station.updatedAt)}</dd>
              </div>
            </dl>

            <div className='mt-3 grid grid-cols-3 gap-2'>
              <Button className='h-11' disabled size='sm' variant='outline'>
                <SquarePenIcon data-icon='inline-start' />
                Manage
              </Button>
              <Button className='h-11' disabled size='sm' variant='outline'>
                <MapPinnedIcon data-icon='inline-start' />
                Pin
              </Button>
              <Button
                className='h-11'
                onClick={() => onToggleStatus(station)}
                size='sm'
                variant={canActivate ? 'outline' : 'destructive'}
              >
                {canActivate ? (
                  <ShieldCheckIcon data-icon='inline-start' />
                ) : (
                  <ShieldAlertIcon data-icon='inline-start' />
                )}
                {canActivate ? 'Activate' : 'Deactivate'}
              </Button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
