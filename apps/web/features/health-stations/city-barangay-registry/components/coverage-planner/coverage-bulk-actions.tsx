'use client'

import { MinusCircleIcon, PlusCircleIcon, RotateCcwIcon } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTableBulkActions } from '@/components/data-table'
import type {
  CoveragePlannerRecord,
  CoverageStagedAction,
} from '../../data/coverage-schema'

type CoverageBulkActionsProps = {
  table: Table<CoveragePlannerRecord>
  onStageSelected: (
    records: CoveragePlannerRecord[],
    action: CoverageStagedAction
  ) => void
  onUndoSelected: (records: CoveragePlannerRecord[]) => void
}

export function CoverageBulkActions({
  table,
  onStageSelected,
  onUndoSelected,
}: CoverageBulkActionsProps) {
  const selectedRecords = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original)

  return (
    <DataTableBulkActions entityName='barangay' table={table}>
      <Button
        onClick={() => onStageSelected(selectedRecords, 'add')}
        size='sm'
        variant='outline'
      >
        <PlusCircleIcon data-icon='inline-start' />
        Stage add
      </Button>
      <Button
        onClick={() => onStageSelected(selectedRecords, 'remove')}
        size='sm'
        variant='outline'
      >
        <MinusCircleIcon data-icon='inline-start' />
        Stage remove
      </Button>
      <Button
        onClick={() => onUndoSelected(selectedRecords)}
        size='sm'
        variant='outline'
      >
        <RotateCcwIcon data-icon='inline-start' />
        Undo
      </Button>
    </DataTableBulkActions>
  )
}

