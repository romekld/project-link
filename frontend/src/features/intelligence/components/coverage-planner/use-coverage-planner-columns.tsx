import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { CoveragePlannerRecord } from '@/features/intelligence/types'
import { selectionColumn } from '../intelligence-data-table'
import { getCoverageStatus } from './constants'

export function useCoveragePlannerColumns() {
  return useMemo<ColumnDef<CoveragePlannerRecord>[]>(
    () => [
      selectionColumn<CoveragePlannerRecord>(),
      {
        accessorKey: 'barangayName',
        header: 'Barangay',
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">{row.original.barangayName}</div>
            <div className="text-xs text-muted-foreground">{row.original.barangayCode}</div>
          </div>
        ),
      },
      {
        accessorKey: 'bhsName',
        header: 'Health station',
      },
      {
        id: 'status',
        header: 'Coverage status',
        cell: ({ row }) => {
          const status = getCoverageStatus(row.original)
          return <Badge variant={status.variant}>{status.label}</Badge>
        },
      },
      {
        accessorKey: 'activeAlerts',
        header: 'Alerts',
      },
      {
        accessorKey: 'totalCases',
        header: 'Cases',
      },
      {
        accessorKey: 'validationRate',
        header: 'Validation',
        cell: ({ row }) => `${row.original.validationRate}%`,
      },
    ],
    [],
  )
}
