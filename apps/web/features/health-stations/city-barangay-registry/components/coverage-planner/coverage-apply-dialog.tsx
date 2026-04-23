'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { CoveragePlannerStats } from '../../data/coverage-schema'

type CoverageApplyDialogProps = {
  open: boolean
  stats: CoveragePlannerStats
  batchReason: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function CoverageApplyDialog({
  open,
  stats,
  batchReason,
  onOpenChange,
  onConfirm,
}: CoverageApplyDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apply coverage changes?</AlertDialogTitle>
          <AlertDialogDescription>
            This frontend scaffold will clear staged changes after confirmation.
            Later, this will call the coverage apply workflow with the batch
            reason: &ldquo;{batchReason}&rdquo;.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='rounded-md border bg-muted/40 p-3 text-sm'>
          {stats.stagedAdds} add{stats.stagedAdds === 1 ? '' : 's'} and{' '}
          {stats.stagedRemoves} remove
          {stats.stagedRemoves === 1 ? '' : 's'} are staged.
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Apply changes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
