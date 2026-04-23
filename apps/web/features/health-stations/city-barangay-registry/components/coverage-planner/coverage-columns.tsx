'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { MinusCircleIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import type {
  CoveragePlannerRecord,
  CoverageStagedAction,
} from '../../data/coverage-schema'
import { formatArea, formatDate } from '../../data/formatters'
import { CoverageStatusBadge } from './coverage-status-badge'

type CoverageColumnsConfig = {
  onSelect: (record: CoveragePlannerRecord) => void
  onStage: (record: CoveragePlannerRecord, action: CoverageStagedAction) => void
  onUndo: (record: CoveragePlannerRecord) => void
}

export function getCoverageColumns({
  onSelect,
  onStage,
  onUndo,
}: CoverageColumnsConfig): ColumnDef<CoveragePlannerRecord>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label='Select all barangays'
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select ${row.original.name}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Barangay' />
      ),
      cell: ({ row }) => (
        <button
          className='min-w-40 text-left'
          onClick={() => onSelect(row.original)}
          type='button'
        >
          <span className='block font-medium'>{row.original.name}</span>
          <span className='text-xs text-muted-foreground'>
            {row.original.city}
          </span>
        </button>
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
      accessorKey: 'currentScope',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Current Scope' />
      ),
      cell: ({ row }) => (
        <BadgeText value={row.original.currentScope === 'in_scope' ? 'In CHO2' : 'Outside'} />
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
      id: 'staged',
      accessorFn: (row) => row.stagedAction ?? 'none',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => <CoverageStatusBadge record={row.original} />,
      filterFn: (row, id, values) => {
        const list = values as string[]
        if (!list?.length) return true
        return list.includes(String(row.getValue(id)))
      },
      enableSorting: false,
      enableHiding: false,
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
      accessorKey: 'sourceDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Source Date' />
      ),
      cell: ({ row }) => formatDate(row.original.sourceDate),
    },
    {
      accessorKey: 'sourceValidOn',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Valid On' />
      ),
      cell: ({ row }) => formatDate(row.original.sourceValidOn),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const record = row.original

        if (record.stagedAction) {
          return (
            <Button onClick={() => onUndo(record)} size='sm' variant='outline'>
              <Trash2Icon data-icon='inline-start' />
              Remove
            </Button>
          )
        }

        if (record.currentScope === 'in_scope') {
          return (
            <Button onClick={() => onStage(record, 'remove')} size='sm' variant='outline'>
              <MinusCircleIcon data-icon='inline-start' />
              Stage remove
            </Button>
          )
        }

        return (
          <Button onClick={() => onStage(record, 'add')} size='sm'>
            <PlusCircleIcon data-icon='inline-start' />
            Stage add
          </Button>
        )
      },
      enableHiding: false,
      enableSorting: false,
    },
  ]
}

function BadgeText({ value }: { value: string }) {
  return <span className='text-sm'>{value}</span>
}

