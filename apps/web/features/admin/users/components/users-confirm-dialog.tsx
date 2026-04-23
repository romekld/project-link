"use client"

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

export type ConfirmAction =
  | {
      type: 'reset'
      userIds: string[]
      title: string
      description: string
      confirmLabel: string
    }
  | {
      type: 'status'
      userIds: string[]
      nextStatus: 'active' | 'inactive'
      title: string
      description: string
      confirmLabel: string
    }

type UsersConfirmDialogProps = {
  action: ConfirmAction | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function UsersConfirmDialog({
  action,
  onOpenChange,
  onConfirm,
}: UsersConfirmDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={Boolean(action)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{action?.title}</AlertDialogTitle>
          <AlertDialogDescription>{action?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            variant={
              action?.type === 'status' && action.nextStatus === 'inactive'
                ? 'destructive'
                : 'outline'
            }
          >
            {action?.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
