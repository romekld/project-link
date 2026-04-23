'use client'

import type { Row } from '@tanstack/react-table'
import { MinusCircleIcon, PlusCircleIcon, RotateCcwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import type {
  CoveragePlannerRecord,
  CoverageStagedAction,
} from '../../data/coverage-schema'
import { formatArea } from '../../data/formatters'
import { CoverageStatusBadge } from './coverage-status-badge'

type CoverageMobileCardsProps = {
  rows: Row<CoveragePlannerRecord>[]
  selectedPcode: string | null
  onSelect: (record: CoveragePlannerRecord) => void
  onStage: (record: CoveragePlannerRecord, action: CoverageStagedAction) => void
  onUndo: (record: CoveragePlannerRecord) => void
}

export function CoverageMobileCards({
  rows,
  selectedPcode,
  onSelect,
  onStage,
  onUndo,
}: CoverageMobileCardsProps) {
  if (!rows.length) {
    return (
      <Empty className='rounded-md border'>
        <EmptyHeader>
          <EmptyTitle>No barangays found</EmptyTitle>
          <EmptyDescription>
            Adjust the scope or staged filter to review coverage.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className='grid gap-3'>
      {rows.map((row) => {
        const record = row.original

        return (
          <article
            className='rounded-md border bg-card p-3 shadow-none'
            data-state={selectedPcode === record.pcode ? 'selected' : undefined}
            key={record.pcode}
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='flex min-w-0 items-start gap-3'>
                <Checkbox
                  aria-label={`Select ${record.name}`}
                  checked={row.getIsSelected()}
                  onCheckedChange={(checked) => row.toggleSelected(!!checked)}
                />
                <button
                  className='min-w-0 text-left'
                  onClick={() => onSelect(record)}
                  type='button'
                >
                  <p className='font-medium'>{record.name}</p>
                  <p className='font-mono text-xs text-muted-foreground'>
                    {record.pcode}
                  </p>
                </button>
              </div>
              <CoverageStatusBadge record={record} />
            </div>

            <dl className='mt-3 grid gap-2 text-sm'>
              <div className='grid grid-cols-[104px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Current</dt>
                <dd>{record.currentScope === 'in_scope' ? 'In CHO2' : 'Outside'}</dd>
              </div>
              <div className='grid grid-cols-[104px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Area</dt>
                <dd>{formatArea(record.sourceAreaSqKm)}</dd>
              </div>
            </dl>

            <div className='mt-3'>
              {record.stagedAction ? (
                <Button
                  className='h-11 w-full'
                  onClick={() => onUndo(record)}
                  size='sm'
                  variant='outline'
                >
                  <RotateCcwIcon data-icon='inline-start' />
                  Undo staged change
                </Button>
              ) : record.currentScope === 'in_scope' ? (
                <Button
                  className='h-11 w-full'
                  onClick={() => onStage(record, 'remove')}
                  size='sm'
                  variant='outline'
                >
                  <MinusCircleIcon data-icon='inline-start' />
                  Stage remove
                </Button>
              ) : (
                <Button
                  className='h-11 w-full'
                  onClick={() => onStage(record, 'add')}
                  size='sm'
                >
                  <PlusCircleIcon data-icon='inline-start' />
                  Stage add
                </Button>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

