import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { PendingDraft } from './types'

interface DraftDialogProps {
  pendingDraft: PendingDraft | null
  draftReason: string
  onClose: () => void
  onReasonChange: (nextReason: string) => void
  onCommitDraft: () => void
}

export function DraftDialog({
  pendingDraft,
  draftReason,
  onClose,
  onReasonChange,
  onCommitDraft,
}: DraftDialogProps) {
  return (
    <Dialog open={Boolean(pendingDraft)} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {pendingDraft?.action === 'add' ? 'Stage add to CHO2 scope' : 'Stage removal from CHO2 scope'}
          </DialogTitle>
          <DialogDescription>
            Add a short reason so this frontend-only draft already follows the audit pattern we want for the real workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
            {pendingDraft?.codes.length} barangay{pendingDraft?.codes.length === 1 ? '' : 's'} selected for this staged change.
          </div>
          <Field>
            <FieldLabel htmlFor="coverage-reason">Reason for change</FieldLabel>
            <Textarea
              id="coverage-reason"
              placeholder="Example: realign operational responsibility after CHO2 field validation."
              value={draftReason}
              onChange={(event) => onReasonChange(event.target.value)}
            />
            <FieldDescription>
              This will stay in local mock state for now, but we're keeping the interaction audit-ready.
            </FieldDescription>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onCommitDraft} disabled={!draftReason.trim()}>
            Save draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
