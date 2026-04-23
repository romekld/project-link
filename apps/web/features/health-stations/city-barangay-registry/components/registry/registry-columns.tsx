'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { EyeIcon, HistoryIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import type { CityBarangayRegistryRecord } from '../../data/schema'
import { formatArea, formatDate } from '../../data/formatters'
import { ScopeBadge } from '../shared/scope-badge'

type RegistryColumnsConfig = {
  onSelect: (record: CityBarangayRegistryRecord) => void
  onOpenHistory: (record: CityBarangayRegistryRecord) => void
}

export function getRegistryColumns({
  onSelect,
  onOpenHistory,
}: RegistryColumnsConfig): ColumnDef<CityBarangayRegistryRecord>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Barangay' />
      ),
      cell: ({ row }) => (
        <div className='min-w-40'>
          <p className='font-medium'>{row.original.name}</p>
          <p className='text-xs text-muted-foreground'>{row.original.city}</p>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'pcode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='PSGC' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs tabular-nums'>
          {row.original.pcode}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'scope',
      accessorFn: (row) => (row.inCho2Scope ? 'in_scope' : 'outside_scope'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='CHO II Coverage' />
      ),
      cell: ({ row }) => <ScopeBadge inCho2Scope={row.original.inCho2Scope} />,
      filterFn: (row, id, values) => {
        const list = values as string[]
        if (!list?.length) return true
        return list.includes(String(row.getValue(id)))
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'city',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='City' />
      ),
      cell: ({ row }) => row.original.city,
    },
    {
      accessorKey: 'sourceFid',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Source Record ID' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs tabular-nums'>
          {row.original.sourceFid}
        </span>
      ),
    },
    {
      accessorKey: 'sourceDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Data Source Date' />
      ),
      cell: ({ row }) => formatDate(row.original.sourceDate),
      sortingFn: (rowA, rowB, id) =>
        new Date(rowA.getValue<string>(id)).getTime() -
        new Date(rowB.getValue<string>(id)).getTime(),
    },
    {
      accessorKey: 'sourceValidOn',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Validity Start' />
      ),
      cell: ({ row }) => formatDate(row.original.sourceValidOn),
    },
    {
      id: 'validity',
      accessorFn: (row) => (row.sourceValidTo ? 'has_valid_to' : 'current'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Validity End' />
      ),
      cell: ({ row }) => formatDate(row.original.sourceValidTo),
      filterFn: (row, id, values) => {
        const list = values as string[]
        if (!list?.length) return true
        return list.includes(String(row.getValue(id)))
      },
    },
    {
      accessorKey: 'sourceAreaSqKm',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Area' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs tabular-nums'>
          {formatArea(row.original.sourceAreaSqKm)}
        </span>
      ),
    },
    {
      accessorKey: 'versionCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Versions' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs tabular-nums'>
          {row.original.versionCount}
        </span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Last Updated' />
      ),
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1'>
          <Button
            aria-label={`View ${row.original.name} on map`}
            onClick={() => onSelect(row.original)}
            size='icon'
            variant='ghost'
          >
            <EyeIcon />
          </Button>
          <Button
            aria-label={`Open geometry history for ${row.original.name}`}
            onClick={() => onOpenHistory(row.original)}
            size='icon'
            variant='ghost'
          >
            <HistoryIcon />
          </Button>
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ]
}

