"use client"

import { KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react'
import { DataTableBulkActions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import type { Table } from '@tanstack/react-table'
import type { AdminUser } from '../data/schema'

type UsersBulkActionsProps = {
  table: Table<AdminUser>
  onResetSelected: () => void
  onActivateSelected: () => void
  onDeactivateSelected: () => void
}

export function UsersBulkActions({
  table,
  onResetSelected,
  onActivateSelected,
  onDeactivateSelected,
}: UsersBulkActionsProps) {
  return (
    <DataTableBulkActions entityName='user' table={table}>
      <Button onClick={onResetSelected} size='sm' variant='outline'>
        <KeyRound data-icon='inline-start' />
        Reset passwords
      </Button>
      <Button onClick={onActivateSelected} size='sm' variant='outline'>
        <ShieldCheck data-icon='inline-start' />
        Activate
      </Button>
      <Button onClick={onDeactivateSelected} size='sm' variant='destructive'>
        <ShieldAlert data-icon='inline-start' />
        Deactivate
      </Button>
    </DataTableBulkActions>
  )
}
