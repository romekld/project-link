'use client'

import type { Row } from '@tanstack/react-table'
import { EyeIcon, RotateCcwIcon, SkipForwardIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import type {
  CityBarangayImportAction,
  CityBarangayImportItem,
} from '../../data/schema'
import { ImportStatusBadge } from './import-status-badge'

type ImportReviewMobileCardsProps = {
  rows: Row<CityBarangayImportItem>[]
  selectedItemId: string | null
  onPreview: (item: CityBarangayImportItem) => void
  onSetAction: (
    item: CityBarangayImportItem,
    action: CityBarangayImportAction
  ) => void
}

export function ImportReviewMobileCards({
  rows,
  selectedItemId,
  onPreview,
  onSetAction,
}: ImportReviewMobileCardsProps) {
  if (!rows.length) {
    return (
      <Empty className='rounded-md border'>
        <EmptyHeader>
          <EmptyTitle>No import rows match your filters</EmptyTitle>
          <EmptyDescription>
            Adjust the review status filter to inspect staged features.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className='grid gap-3'>
      {rows.map((row) => {
        const item = row.original
        const canDecide = item.action !== 'invalid' && item.action !== 'create'

        return (
          <article
            className='rounded-md border bg-card p-3 shadow-none'
            data-state={selectedItemId === item.id ? 'selected' : undefined}
            key={item.id}
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <p className='font-medium'>
                  {item.name ?? 'Unnamed feature'}
                </p>
                <p className='font-mono text-xs text-muted-foreground'>
                  Row #{item.featureIndex}
                </p>
              </div>
              <ImportStatusBadge action={item.action} />
            </div>

            <dl className='mt-3 grid gap-2 text-sm'>
              <div className='grid grid-cols-[104px_1fr] gap-2'>
                <dt className='text-muted-foreground'>PSGC</dt>
                <dd className='font-mono text-xs'>
                  {item.pcode ?? 'Missing code'}
                </dd>
              </div>
              <div className='grid grid-cols-[104px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Matched barangay</dt>
                <dd>{item.existingBarangayName ?? 'No matched barangay'}</dd>
              </div>
              <div className='grid grid-cols-[104px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Errors</dt>
                <dd>
                  {item.validationErrors.length
                    ? item.validationErrors.join(', ')
                    : 'None'}
                </dd>
              </div>
            </dl>

            <div className='mt-3 grid grid-cols-3 gap-2'>
              <Button
                className='h-11'
                disabled={!item.geometry}
                onClick={() => onPreview(item)}
                size='sm'
                variant='outline'
              >
                <EyeIcon data-icon='inline-start' />
                Preview
              </Button>
              <Button
                className='h-11'
                disabled={!canDecide}
                onClick={() => onSetAction(item, 'skip')}
                size='sm'
                variant={item.action === 'skip' ? 'default' : 'outline'}
              >
                <SkipForwardIcon data-icon='inline-start' />
                Skip
              </Button>
              <Button
                className='h-11'
                disabled={!canDecide}
                onClick={() => onSetAction(item, 'overwrite')}
                size='sm'
                variant={item.action === 'overwrite' ? 'default' : 'outline'}
              >
                <RotateCcwIcon data-icon='inline-start' />
                Replace
              </Button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

