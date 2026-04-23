'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { EyeIcon, RotateCcwIcon, SkipForwardIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import type {
  CityBarangayImportAction,
  CityBarangayImportItem,
} from '../../data/schema'
import { ImportStatusBadge } from './import-status-badge'

type ImportReviewColumnsConfig = {
  onPreview: (item: CityBarangayImportItem) => void
  onSetAction: (
    item: CityBarangayImportItem,
    action: CityBarangayImportAction
  ) => void
}

export function getImportReviewColumns({
  onPreview,
  onSetAction,
}: ImportReviewColumnsConfig): ColumnDef<CityBarangayImportItem>[] {
  return [
    {
      accessorKey: 'featureIndex',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Row #' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs tabular-nums'>
          {row.original.featureIndex}
        </span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Barangay' />
      ),
      cell: ({ row }) => row.original.name ?? 'Unnamed feature',
      enableHiding: false,
    },
    {
      accessorKey: 'pcode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='PSGC' />
      ),
      cell: ({ row }) =>
        row.original.pcode ? (
          <span className='font-mono text-xs tabular-nums'>
            {row.original.pcode}
          </span>
        ) : (
          <span className='text-muted-foreground'>Missing code</span>
        ),
      enableHiding: false,
    },
    {
      accessorKey: 'action',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => <ImportStatusBadge action={row.original.action} />,
      filterFn: (row, id, values) => {
        const list = values as string[]
        if (!list?.length) return true
        return list.includes(String(row.getValue(id)))
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'errors',
      accessorFn: (row) => row.validationErrors.join(', '),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Validation Issues' />
      ),
      cell: ({ row }) =>
        row.original.validationErrors.length ? (
          <span className='text-sm text-destructive'>
            {row.original.validationErrors.join(', ')}
          </span>
        ) : (
          <span className='text-muted-foreground'>None</span>
        ),
      enableSorting: false,
    },
    {
      accessorKey: 'existingBarangayName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Matched Barangay' />
      ),
      cell: ({ row }) =>
        row.original.existingBarangayName ?? (
          <span className='text-muted-foreground'>No matched barangay</span>
        ),
      enableSorting: false,
    },
    {
      id: 'decision',
      header: 'Decision',
      cell: ({ row }) => {
        const item = row.original

        if (item.action === 'invalid' || item.action === 'create') {
          return <span className='text-sm text-muted-foreground'>System-set</span>
        }

        return (
          <div className='flex flex-wrap gap-1'>
            <Button
              onClick={() => onSetAction(item, 'skip')}
              size='sm'
              variant={item.action === 'skip' ? 'default' : 'outline'}
            >
              <SkipForwardIcon data-icon='inline-start' />
              Skip row
            </Button>
            <Button
              onClick={() => onSetAction(item, 'overwrite')}
              size='sm'
              variant={item.action === 'overwrite' ? 'default' : 'outline'}
            >
              <RotateCcwIcon data-icon='inline-start' />
              Replace boundary
            </Button>
          </div>
        )
      },
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: 'preview',
      cell: ({ row }) => (
        <Button
          aria-label={`Preview import feature ${row.original.featureIndex}`}
          disabled={!row.original.geometry}
          onClick={() => onPreview(row.original)}
          size='icon'
          variant='ghost'
        >
          <EyeIcon />
        </Button>
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ]
}

