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
import type { CityBarangayRegistryRecord } from '../../data/schema'
import { scopeOptions, validityOptions } from '../../data/options'
import { getRegistryColumns } from './registry-columns'
import { RegistryMobileCards } from './registry-mobile-cards'

type RegistryTableProps = {
  data: CityBarangayRegistryRecord[]
  selectedPcode: string | null
  onSelect: (record: CityBarangayRegistryRecord) => void
  onOpenHistory: (record: CityBarangayRegistryRecord) => void
}

export function RegistryTable({
  data,
  selectedPcode,
  onSelect,
  onOpenHistory,
}: RegistryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo(
    () => getRegistryColumns({ onSelect, onOpenHistory }),
    [onOpenHistory, onSelect]
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
    getRowId: (row) => row.pcode,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 8,
      },
      columnVisibility: {
        city: false,
        sourceFid: false,
        sourceValidOn: false,
        validity: false,
      },
    },
    globalFilterFn: (row, _columnId, value) => {
      const query = String(value ?? '').toLowerCase().trim()
      if (!query) return true

      const record = row.original
      const haystack = [
        record.name,
        record.pcode,
        record.city,
        record.sourceFid.toString(),
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
            columnId: 'scope',
            title: 'CHO II Coverage',
            options: scopeOptions,
          },
          {
            columnId: 'validity',
            title: 'Validity Window',
            options: validityOptions,
          },
        ]}
        searchPlaceholder='Search by barangay, PSGC code, city, or source record ID...'
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
                  No barangay records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='md:hidden'>
        <RegistryMobileCards
          onOpenHistory={onOpenHistory}
          onSelect={onSelect}
          rows={table.getRowModel().rows}
          selectedPcode={selectedPcode}
        />
      </div>

      <DataTablePagination table={table} />
    </section>
  )
}
