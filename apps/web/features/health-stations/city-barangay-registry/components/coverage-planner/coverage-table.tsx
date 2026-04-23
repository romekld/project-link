'use client'

import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnFiltersState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type {
  CoveragePlannerRecord,
  CoverageStagedAction,
} from '../../data/coverage-schema'
import { coverageScopeOptions, stagedActionOptions } from '../../data/coverage-options'
import { getCoverageColumns } from './coverage-columns'
import { CoverageMobileCards } from './coverage-mobile-cards'
import { CoverageBulkActions } from './coverage-bulk-actions'

type CoverageTableProps = {
  data: CoveragePlannerRecord[]
  selectedPcode: string | null
  onSelect: (record: CoveragePlannerRecord) => void
  onStage: (record: CoveragePlannerRecord, action: CoverageStagedAction) => void
  onStageSelected: (
    records: CoveragePlannerRecord[],
    action: CoverageStagedAction
  ) => void
  onUndo: (record: CoveragePlannerRecord) => void
  onUndoSelected: (records: CoveragePlannerRecord[]) => void
}

export function CoverageTable({
  data,
  selectedPcode,
  onSelect,
  onStage,
  onStageSelected,
  onUndo,
  onUndoSelected,
}: CoverageTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo(
    () => getCoverageColumns({ onSelect, onStage, onUndo }),
    [onSelect, onStage, onUndo]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.pcode,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 8,
      },
      columnVisibility: {
        sourceDate: false,
        sourceValidOn: false,
      },
    },
    globalFilterFn: (row, _columnId, value) => {
      const query = String(value ?? '').toLowerCase().trim()
      if (!query) return true

      const record = row.original
      const haystack = [record.name, record.pcode, record.city]

      return haystack.some((entry) => entry.toLowerCase().includes(query))
    },
  })

  return (
    <section className='flex flex-col gap-4 pb-4'>
      <DataTableToolbar
        table={table}
        filters={[
          {
            columnId: 'currentScope',
            title: 'Current Scope',
            options: coverageScopeOptions,
          },
          {
            columnId: 'staged',
            title: 'Status',
            options: stagedActionOptions,
          },
        ]}
        searchPlaceholder='Search barangay, PSGC, or city...'
      />

      <div className='hidden overflow-hidden rounded-md border md:block'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className='cursor-pointer'
                  data-state={
                    selectedPcode === row.original.pcode ? 'selected' : undefined
                  }
                  key={row.id}
                  onClick={() => onSelect(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className='h-24 text-center' colSpan={columns.length}>
                  No barangays found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='md:hidden'>
        <CoverageMobileCards
          onSelect={onSelect}
          onStage={onStage}
          onUndo={onUndo}
          rows={table.getRowModel().rows}
          selectedPcode={selectedPcode}
        />
      </div>

      <DataTablePagination table={table} />

      <CoverageBulkActions
        onStageSelected={onStageSelected}
        onUndoSelected={onUndoSelected}
        table={table}
      />
    </section>
  )
}

