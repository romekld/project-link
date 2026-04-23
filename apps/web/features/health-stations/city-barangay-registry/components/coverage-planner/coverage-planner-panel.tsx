'use client'

import { useState } from 'react'
import { CheckCircle2Icon, ClipboardListIcon, RotateCcwIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type {
  CoveragePlannerRecord,
  CoveragePlannerStats,
  CoverageStagedAction,
} from '../../data/coverage-schema'
import { CoverageApplyDialog } from './coverage-apply-dialog'
import { CoverageReviewSheet } from './coverage-review-sheet'
import { CoverageTable } from './coverage-table'

type CoveragePlannerPanelProps = {
  records: CoveragePlannerRecord[]
  stats: CoveragePlannerStats
  selectedPcode: string | null
  batchReason: string
  onBatchReasonChange: (value: string) => void
  onApply: () => void
  onReset: () => void
  onSelect: (record: CoveragePlannerRecord) => void
  onStage: (record: CoveragePlannerRecord, action: CoverageStagedAction) => void
  onStageSelected: (
    records: CoveragePlannerRecord[],
    action: CoverageStagedAction
  ) => void
  onUndo: (record: CoveragePlannerRecord) => void
  onUndoSelected: (records: CoveragePlannerRecord[]) => void
  applyError?: string | null
}

export function CoveragePlannerPanel({
  records,
  stats,
  selectedPcode,
  batchReason,
  onBatchReasonChange,
  onApply,
  onReset,
  onSelect,
  onStage,
  onStageSelected,
  onUndo,
  onUndoSelected,
  applyError,
}: CoveragePlannerPanelProps) {
  const [applyOpen, setApplyOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const stagedCount = stats.stagedAdds + stats.stagedRemoves
  const canApply = stagedCount > 0 && batchReason.trim().length > 0

  return (
    <div className='flex flex-col gap-4'>
      {applyError && (
        <Alert variant='destructive'>
          <AlertTitle>Coverage change failed</AlertTitle>
          <AlertDescription>{applyError}</AlertDescription>
        </Alert>
      )}
      <div className='flex flex-wrap items-center justify-between gap-3 rounded-md border bg-card p-3'>
        <div className='min-w-0'>
          <p className='font-medium'>Coverage staging</p>
          <p className='text-sm text-muted-foreground'>
            {stagedCount
              ? `${stats.stagedAdds} add, ${stats.stagedRemoves} remove staged.`
              : 'No staged coverage changes yet.'}
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            disabled={!stagedCount}
            onClick={onReset}
            size='sm'
            variant='outline'
          >
            <RotateCcwIcon data-icon='inline-start' />
            Reset staged
          </Button>
          <Button
            disabled={!stagedCount}
            onClick={() => setReviewOpen(true)}
            size='sm'
            variant='outline'
          >
            <ClipboardListIcon data-icon='inline-start' />
            Review changes
          </Button>
          <Button
            disabled={!stagedCount}
            onClick={() => {
              if (canApply) {
                setApplyOpen(true)
              } else {
                setReviewOpen(true)
              }
            }}
            size='sm'
          >
            <CheckCircle2Icon data-icon='inline-start' />
            Apply changes
          </Button>
        </div>
      </div>

      {!canApply && stagedCount > 0 ? (
        <Alert>
          <AlertTitle>Batch reason required</AlertTitle>
          <AlertDescription>
            Open Review changes and add a batch reason before applying staged
            coverage changes.
          </AlertDescription>
        </Alert>
      ) : null}

      <CoverageTable
        data={records}
        onSelect={onSelect}
        onStage={onStage}
        onStageSelected={onStageSelected}
        onUndo={onUndo}
        onUndoSelected={onUndoSelected}
        selectedPcode={selectedPcode}
      />

      <CoverageApplyDialog
        batchReason={batchReason}
        onConfirm={() => {
          onApply()
          setApplyOpen(false)
        }}
        onOpenChange={setApplyOpen}
        open={applyOpen}
        stats={stats}
      />

      <CoverageReviewSheet
        batchReason={batchReason}
        onApply={() => {
          if (!canApply) return
          setReviewOpen(false)
          setApplyOpen(true)
        }}
        onBatchReasonChange={onBatchReasonChange}
        onClear={() => {
          onReset()
          onBatchReasonChange('')
        }}
        onOpenChange={setReviewOpen}
        onRemove={onUndo}
        open={reviewOpen}
        records={records}
        stats={stats}
      />
    </div>
  )
}
