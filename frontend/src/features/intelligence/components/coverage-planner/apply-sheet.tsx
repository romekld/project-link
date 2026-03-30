import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import type { CoveragePlannerRecord } from '@/features/intelligence/types'
import { getCoverageStatus } from './constants'

interface CoverageApplySheetProps {
  open: boolean
  stagedRecords: CoveragePlannerRecord[]
  batchReason: string
  isApplying: boolean
  onOpenChange: (open: boolean) => void
  onBatchReasonChange: (value: string) => void
  onRemoveItem: (code: string) => void
  onClearAll: () => void
  onApply: () => Promise<void> | void
}

export function CoverageApplySheet({
  open,
  stagedRecords,
  batchReason,
  isApplying,
  onOpenChange,
  onBatchReasonChange,
  onRemoveItem,
  onClearAll,
  onApply,
}: CoverageApplySheetProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const hasRemovals = stagedRecords.some((record) => record.pendingAction === 'remove')

  function handleApplyClick() {
    if (hasRemovals) {
      setConfirmOpen(true)
      return
    }

    void onApply()
  }

  function handleConfirmApply() {
    setConfirmOpen(false)
    void onApply()
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Review staged coverage changes</SheetTitle>
            <SheetDescription>
              Confirm the selected barangays, enter one shared reason, and then apply the batch to the backend.
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="coverage-batch-reason">Reason for this batch</FieldLabel>
                <Textarea
                  id="coverage-batch-reason"
                  placeholder="Example: operational coverage realignment after city validation."
                  value={batchReason}
                  onChange={(event) => onBatchReasonChange(event.target.value)}
                />
                <FieldDescription>
                  The same reason will be submitted for all staged changes in this batch.
                </FieldDescription>
              </Field>
            </FieldGroup>

            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barangay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagedRecords.length ? (
                    stagedRecords.map((record) => {
                      const status = getCoverageStatus(record)

                      return (
                        <TableRow key={record.barangayCode}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="font-medium">{record.barangayName}</div>
                              <div className="text-xs text-muted-foreground">{record.barangayCode}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveItem(record.barangayCode)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                        No staged changes to review.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isApplying}>
              Cancel
            </Button>
            <Button variant="outline" onClick={onClearAll} disabled={!stagedRecords.length || isApplying}>
              Clear all staged
            </Button>
            <Button onClick={handleApplyClick} disabled={!stagedRecords.length || !batchReason.trim() || isApplying}>
              {isApplying ? 'Applying...' : 'Apply changes'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply removals from CHO2 scope?</AlertDialogTitle>
            <AlertDialogDescription>
              This batch includes one or more removals from active CHO coverage. Confirm to continue with the staged changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApplying}>Review again</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmApply} disabled={isApplying}>
              {isApplying ? 'Applying...' : 'Confirm apply'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
