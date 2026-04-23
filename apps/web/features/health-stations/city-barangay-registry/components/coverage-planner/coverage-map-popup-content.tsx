'use client'

import {
  MinusCircleIcon,
  PlusCircleIcon,
  RotateCcwIcon,
  XIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type {
  CoveragePlannerRecord,
  CoverageStagedAction,
} from '../../data/coverage-schema'
import { formatArea } from '../../data/formatters'

type CoverageMapPopupContentProps = {
  record: CoveragePlannerRecord
  onClose: () => void
  onStage: (record: CoveragePlannerRecord, action: CoverageStagedAction) => void
  onUndo: (record: CoveragePlannerRecord) => void
}

export function CoverageMapPopupContent({
  record,
  onClose,
  onStage,
  onUndo,
}: CoverageMapPopupContentProps) {
  const currentScope =
    record.currentScope === 'in_scope' ? 'In CHO2' : 'Outside'
  const stagedLabel =
    record.stagedAction === 'add'
      ? 'Will add'
      : record.stagedAction === 'remove'
        ? 'Will remove'
        : 'No change'

  return (
    <div className='flex flex-col gap-3'>
      <div className='min-w-0'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='truncate font-medium'>{record.name}</p>
            <p className='mt-1 font-mono text-xs text-muted-foreground'>
              {record.pcode}
            </p>
          </div>
          <Button
            aria-label='Close map popup'
            onClick={onClose}
            size='icon'
            variant='ghost'
          >
            <XIcon />
          </Button>
        </div>
        <div className='mt-2 flex flex-wrap gap-1.5'>
          <Badge variant={record.currentScope === 'in_scope' ? 'default' : 'outline'}>
            {currentScope}
          </Badge>
          {record.stagedAction ? (
            <Badge variant={record.stagedAction === 'remove' ? 'destructive' : 'default'}>
              {stagedLabel}
            </Badge>
          ) : null}
        </div>
      </div>

      <Separator />

      <dl className='grid grid-cols-3 gap-2 text-xs'>
        <div>
          <dt className='text-muted-foreground'>Current scope</dt>
          <dd className='font-medium'>{currentScope}</dd>
        </div>
        <div>
          <dt className='text-muted-foreground'>Staged change</dt>
          <dd className='font-medium'>{stagedLabel}</dd>
        </div>
        <div>
          <dt className='text-muted-foreground'>Area</dt>
          <dd className='font-medium'>{formatArea(record.sourceAreaSqKm)}</dd>
        </div>
      </dl>

      {record.stagedAction ? (
        <Button className='w-full' onClick={() => onUndo(record)} variant='outline'>
          <RotateCcwIcon data-icon='inline-start' />
          Undo staged change
        </Button>
      ) : record.currentScope === 'in_scope' ? (
        <Button className='w-full' onClick={() => onStage(record, 'remove')} variant='outline'>
          <MinusCircleIcon data-icon='inline-start' />
          Stage remove
        </Button>
      ) : (
        <Button className='w-full' onClick={() => onStage(record, 'add')}>
          <PlusCircleIcon data-icon='inline-start' />
          Stage add
        </Button>
      )}
    </div>
  )
}

