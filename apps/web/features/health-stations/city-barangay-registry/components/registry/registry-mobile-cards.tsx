'use client'

import type { Row } from '@tanstack/react-table'
import { EyeIcon, HistoryIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import type { CityBarangayRegistryRecord } from '../../data/schema'
import { formatArea, formatDate } from '../../data/formatters'
import { ScopeBadge } from '../shared/scope-badge'

type RegistryMobileCardsProps = {
  rows: Row<CityBarangayRegistryRecord>[]
  selectedPcode: string | null
  onSelect: (record: CityBarangayRegistryRecord) => void
  onOpenHistory: (record: CityBarangayRegistryRecord) => void
}

export function RegistryMobileCards({
  rows,
  selectedPcode,
  onSelect,
  onOpenHistory,
}: RegistryMobileCardsProps) {
  if (!rows.length) {
    return (
      <Empty className='rounded-md border'>
        <EmptyHeader>
          <EmptyTitle>No barangay records found</EmptyTitle>
          <EmptyDescription>
            Adjust the search or filters to review boundary records.
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
              <div className='min-w-0'>
                <p className='font-medium'>{record.name}</p>
                <p className='font-mono text-xs text-muted-foreground'>
                  {record.pcode}
                </p>
              </div>
              <ScopeBadge inCho2Scope={record.inCho2Scope} />
            </div>

            <dl className='mt-3 grid gap-2 text-sm'>
              <div className='grid grid-cols-[92px_1fr] gap-2'>
                <dt className='text-muted-foreground'>City</dt>
                <dd>{record.city}</dd>
              </div>
              <div className='grid grid-cols-[92px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Data source date</dt>
                <dd>{formatDate(record.sourceDate)}</dd>
              </div>
              <div className='grid grid-cols-[92px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Validity start</dt>
                <dd>{formatDate(record.sourceValidOn)}</dd>
              </div>
              <div className='grid grid-cols-[92px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Area</dt>
                <dd>{formatArea(record.sourceAreaSqKm)}</dd>
              </div>
            </dl>

            <div className='mt-3 grid grid-cols-2 gap-2'>
              <Button
                className='h-11'
                onClick={() => onSelect(record)}
                size='sm'
                variant='outline'
              >
                <EyeIcon data-icon='inline-start' />
                View on map
              </Button>
              <Button
                className='h-11'
                onClick={() => onOpenHistory(record)}
                size='sm'
                variant='outline'
              >
                <HistoryIcon data-icon='inline-start' />
                Geometry history
              </Button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

