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
  CityBarangayImportAction,
  CityBarangayImportItem,
} from '../../data/schema'
import { importActionOptions } from '../../data/options'
import { getImportReviewColumns } from './import-review-columns'
import { ImportReviewMobileCards } from './import-review-mobile-cards'

type ImportReviewTableProps = {
  data: CityBarangayImportItem[]
  selectedItemId: string | null
  onPreview: (item: CityBarangayImportItem) => void
  onSetAction: (
    item: CityBarangayImportItem,
    action: CityBarangayImportAction
  ) => void
}

export function ImportReviewTable({
  data,
  selectedItemId,
  onPreview,
  onSetAction,
}: ImportReviewTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo(
    () => getImportReviewColumns({ onPreview, onSetAction }),
    [onPreview, onSetAction]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 8,
      },
    },
    globalFilterFn: (row, _columnId, value) => {
      const query = String(value ?? '').toLowerCase().trim()
      if (!query) return true

      const item = row.original
      const haystack = [
        item.name ?? '',
        item.pcode ?? '',
        item.existingBarangayName ?? '',
        item.validationErrors.join(' '),
      ]

      return haystack.some((entry) => entry.toLowerCase().includes(query))
    },
  })

  return (
    <section className='flex flex-col gap-4 pb-4'>
      <DataTableToolbar
        table={table}
        filters={[
          {
            columnId: 'action',
            title: 'Review Status',
            options: importActionOptions,
          },
        ]}
        searchPlaceholder='Search by row, PSGC code, matched barangay, or validation issue...'
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
                  data-state={selectedItemId === row.original.id ? 'selected' : undefined}
                  key={row.id}
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
                  No import rows match your current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='md:hidden'>
        <ImportReviewMobileCards
          onPreview={onPreview}
          onSetAction={onSetAction}
          rows={table.getRowModel().rows}
          selectedItemId={selectedItemId}
        />
      </div>

      <DataTablePagination table={table} />
    </section>
  )
}
