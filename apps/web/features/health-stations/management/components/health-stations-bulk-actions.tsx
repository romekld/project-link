"use client"

import { ShieldAlertIcon, ShieldCheckIcon } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import { DataTableBulkActions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import type { HealthStation } from '../data/schema'

type HealthStationsBulkActionsProps = {
  table: Table<HealthStation>
  onActivateSelected: () => void
  onDeactivateSelected: () => void
}

export function HealthStationsBulkActions({
  table,
  onActivateSelected,
  onDeactivateSelected,
}: HealthStationsBulkActionsProps) {
  return (
    <DataTableBulkActions entityName='station' table={table}>
      <Button onClick={onActivateSelected} size='sm' variant='outline'>
        <ShieldCheckIcon data-icon='inline-start' />
        Activate
      </Button>
      <Button onClick={onDeactivateSelected} size='sm' variant='destructive'>
        <ShieldAlertIcon data-icon='inline-start' />
        Deactivate
      </Button>
    </DataTableBulkActions>
  )
}
