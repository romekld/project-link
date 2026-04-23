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

type ImportCommitDialogProps = {
  open: boolean
  overwriteCount: number
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ImportCommitDialog({
  open,
  overwriteCount,
  onOpenChange,
  onConfirm,
}: ImportCommitDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Commit validated changes?</AlertDialogTitle>
          <AlertDialogDescription>
            This is a UI scaffold for the preserved import workflow. In the
            backend-backed version, this commit writes new and replaced
            boundaries to the city barangay registry and records geometry
            history.
            {overwriteCount > 0
              ? ` ${overwriteCount} row${overwriteCount === 1 ? '' : 's'} will replace existing boundaries.`
              : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Commit changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

