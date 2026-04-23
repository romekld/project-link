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
import type { HealthStationStatus } from '../data/schema'

export type ConfirmAction = {
  stationIds: string[]
  nextStatus: HealthStationStatus
  title: string
  description: string
  confirmLabel: string
}

type HealthStationsConfirmDialogProps = {
  action: ConfirmAction | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function HealthStationsConfirmDialog({
  action,
  onOpenChange,
  onConfirm,
}: HealthStationsConfirmDialogProps) {
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
            variant={action?.nextStatus === 'inactive' ? 'destructive' : 'outline'}
          >
            {action?.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
