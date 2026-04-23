'use client'

import { CheckCircle2Icon, RotateCcwIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  SheetClose,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import type {
  CoveragePlannerRecord,
  CoveragePlannerStats,
} from '../../data/coverage-schema'
import { formatArea } from '../../data/formatters'
import { CoverageStatusBadge } from './coverage-status-badge'

type CoverageReviewSheetProps = {
  open: boolean
  records: CoveragePlannerRecord[]
  stats: CoveragePlannerStats
  batchReason: string
  onBatchReasonChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onClear: () => void
  onRemove: (record: CoveragePlannerRecord) => void
  onApply: () => void
}

export function CoverageReviewSheet({
  open,
  records,
  stats,
  batchReason,
  onBatchReasonChange,
  onOpenChange,
  onClear,
  onRemove,
  onApply,
}: CoverageReviewSheetProps) {
  const stagedRecords = records.filter((record) => record.stagedAction)
  const canApply = stagedRecords.length > 0 && batchReason.trim().length > 0
  const canClear = stagedRecords.length > 0 || batchReason.trim().length > 0

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className='flex w-full flex-col overflow-hidden sm:max-w-xl'>
        <SheetHeader className='border-b'>
          <SheetTitle>Review coverage changes</SheetTitle>
          <SheetDescription>
            Confirm staged CHO2 operational scope changes before applying.
          </SheetDescription>
        </SheetHeader>

        <div className='flex min-h-0 flex-1 flex-col gap-4 px-4 py-4'>
          <div className='grid grid-cols-3 gap-2'>
            <SummaryTile label='Adds' tone='add' value={stats.stagedAdds} />
            <SummaryTile
              label='Removes'
              tone='remove'
              value={stats.stagedRemoves}
            />
            <SummaryTile label='Net' tone='net' value={stats.stagedAdds - stats.stagedRemoves} />
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium' htmlFor='coverage-batch-reason'>
              Batch reason
            </label>
            <Textarea
              aria-describedby='coverage-batch-reason-help'
              id='coverage-batch-reason'
              className='min-h-28 resize-none'
              onChange={(event) => onBatchReasonChange(event.target.value)}
              placeholder='Example: Align operational scope with CHO2 coverage for 2026 rollout.'
              value={batchReason}
            />
            <p className='text-xs text-muted-foreground' id='coverage-batch-reason-help'>
              Required for the future audit trail before changes can be applied.
            </p>
          </div>

          <Separator />

          <div className='flex min-h-0 flex-1 flex-col gap-2'>
            <div className='flex items-center justify-between gap-3'>
              <p className='text-sm font-medium'>Staged Barangays</p>
              <p className='font-mono text-xs text-muted-foreground tabular-nums'>
                {stagedRecords.length} total
              </p>
            </div>

            <div className='min-h-0 flex-1 overflow-y-auto pr-1'>
              <div className='flex flex-col gap-2'>
                {stagedRecords.length ? (
                  stagedRecords.map((record) => (
                    <article className='rounded-md border bg-card p-3' key={record.pcode}>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <p className='font-medium'>{record.name}</p>
                          <p className='font-mono text-xs text-muted-foreground'>
                            {record.pcode}
                          </p>
                        </div>
                        <CoverageStatusBadge record={record} />
                      </div>
                      <dl className='mt-3 grid grid-cols-2 gap-2 text-xs'>
                        <div>
                          <dt className='text-muted-foreground'>Current</dt>
                          <dd>
                            {record.currentScope === 'in_scope'
                              ? 'In CHO2'
                              : 'Outside'}
                          </dd>
                        </div>
                        <div>
                          <dt className='text-muted-foreground'>Area</dt>
                          <dd>{formatArea(record.sourceAreaSqKm)}</dd>
                        </div>
                      </dl>
                      <div className='mt-3 flex justify-end border-t pt-3'>
                        <Button
                          onClick={() => onRemove(record)}
                          size='sm'
                          variant='outline'
                        >
                          <Trash2Icon data-icon='inline-start' />
                          Remove
                        </Button>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className='rounded-md border p-4 text-sm text-muted-foreground'>
                    No coverage changes are staged.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className='border-t sm:flex-row sm:justify-between'>
          <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row'>
            <Button
              disabled={!canClear}
              onClick={onClear}
              variant='outline'
            >
              <RotateCcwIcon data-icon='inline-start' />
              Clear
            </Button>
            <SheetClose asChild>
              <Button variant='ghost'>
                Cancel
              </Button>
            </SheetClose>
          </div>

          <Button disabled={!canApply} onClick={onApply}>
            <CheckCircle2Icon data-icon='inline-start' />
            Apply changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'add' | 'remove' | 'net'
}) {
  const toneClassName =
    tone === 'add'
      ? 'border-primary/20 bg-primary/5'
      : tone === 'remove'
        ? 'border-destructive/30 bg-destructive/5'
        : 'bg-muted/40'

  return (
    <div className={`rounded-md border p-3 ${toneClassName}`}>
      <p className='font-mono text-xl font-semibold tabular-nums'>{value}</p>
      <p className='text-xs text-muted-foreground'>{label}</p>
    </div>
  )
}

