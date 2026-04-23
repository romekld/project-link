"use client"

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import type { HealthStation } from '../data/schema'
import {
  formatCoordinates,
  formatPinStatus,
  formatStationStatus,
  formatUpdatedAt,
} from '../data/formatters'
import { getFacilityTypeLabel } from '../data/options'
import { HealthStationsRowActions } from './health-stations-row-actions'

type HealthStationsColumnsConfig = {
  onToggleStatus: (station: HealthStation) => void
}

export function getHealthStationsColumns({
  onToggleStatus,
}: HealthStationsColumnsConfig): ColumnDef<HealthStation>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label='Select all stations'
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select ${row.original.stationCode}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: 'identity',
      accessorFn: (row) => `${row.name} ${row.stationCode}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Station' />
      ),
      cell: ({ row }) => {
        const station = row.original

        return (
          <div className='min-w-0'>
            <p className='truncate font-medium'>{station.name}</p>
            <p className='text-xs text-muted-foreground'>
              {station.stationCode}
            </p>
          </div>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: 'facilityType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => (
        <Badge className='font-normal' variant='secondary'>
          {getFacilityTypeLabel(row.original.facilityType)}
        </Badge>
      ),
      filterFn: (row, id, values) => {
        const list = values as string[]
        if (!list?.length) return true
        return list.includes(String(row.getValue(id)))
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'physicalBarangay',
      accessorFn: (row) => row.physicalBarangayName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Physical barangay' />
      ),
      cell: ({ row }) => (
        <div className='min-w-36'>
          <p className='font-medium'>{row.original.physicalBarangayName}</p>
          <p className='text-xs text-muted-foreground'>
            {row.original.physicalBarangayPcode}
          </p>
        </div>
      ),
      filterFn: (row, id, values) => {
        const list = values as string[]
        if (!list?.length) return true
        return list.includes(String(row.getValue(id)))
      },
      enableHiding: false,
    },
    {
      id: 'coverage',
      accessorFn: (row) => row.coverageCount,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Service coverage' />
      ),
      cell: ({ row }) => (
        <div className='text-sm'>
          <p className='font-medium'>
            {row.original.coverageCount} barangay
            {row.original.coverageCount === 1 ? '' : 's'}
          </p>
          <p className='text-xs text-muted-foreground'>
            {row.original.primaryCoverageCount} primary
          </p>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'assignedStaffCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Staff' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm tabular-nums'>
          {row.original.assignedStaffCount}
        </span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'pinStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='GIS pin' />
      ),
      cell: ({ row }) => {
        const station = row.original
        const variant = station.pinStatus === 'pinned' ? 'default' : 'outline'

        return (
          <div className='min-w-32'>
            <Badge variant={variant}>{formatPinStatus(station.pinStatus)}</Badge>
            <p className='mt-1 text-xs text-muted-foreground'>
              {formatCoordinates(station.latitude, station.longitude)}
            </p>
          </div>
        )
      },
      filterFn: (row, id, values) => {
        const list = values as string[]
        if (!list?.length) return true
        return list.includes(String(row.getValue(id)))
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'outline'}>
          {formatStationStatus(row.original.status)}
        </Badge>
      ),
      filterFn: (row, id, values) => {
        const list = values as string[]
        if (!list?.length) return true
        return list.includes(String(row.getValue(id)))
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Updated' />
      ),
      cell: ({ row }) => formatUpdatedAt(row.original.updatedAt),
      sortingFn: (rowA, rowB, id) => {
        const valueA = rowA.getValue<string>(id)
        const valueB = rowB.getValue<string>(id)
        return new Date(valueA).getTime() - new Date(valueB).getTime()
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <HealthStationsRowActions
          onToggleStatus={onToggleStatus}
          station={row.original}
        />
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ]
}
