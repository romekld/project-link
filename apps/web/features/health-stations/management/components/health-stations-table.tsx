"use client"

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
import type { HealthStation, HealthStationStatus } from '../data/schema'
import {
  facilityTypeOptions,
  pinStatusOptions,
  stationStatusOptions,
} from '../data/options'
import { formatCoordinates } from '../data/formatters'
import { getHealthStationsColumns } from './health-stations-columns'
import { HealthStationsBulkActions } from './health-stations-bulk-actions'
import {
  HealthStationsConfirmDialog,
  type ConfirmAction,
} from './health-stations-confirm-dialog'
import { HealthStationsMobileCards } from './health-stations-mobile-cards'

type HealthStationsTableProps = {
  data: HealthStation[]
  onSetStatus: (stationIds: string[], nextStatus: HealthStationStatus) => void
}

function getBarangayFilterOptions(data: HealthStation[]) {
  const values = new Set<string>()

  for (const station of data) {
    values.add(station.physicalBarangayName)
  }

  return Array.from(values)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }))
}

export function HealthStationsTable({
  data,
  onSetStatus,
}: HealthStationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  const columns = useMemo(
    () =>
      getHealthStationsColumns({
        onToggleStatus: (station) => {
          const nextStatus = station.status === 'inactive' ? 'active' : 'inactive'

          setConfirmAction({
            stationIds: [station.id],
            nextStatus,
            title: `${nextStatus === 'active' ? 'Activate' : 'Deactivate'} ${station.name}?`,
            description:
              nextStatus === 'active'
                ? 'The station will return to active management lists and assignment workflows.'
                : 'The station will remain in history, but staff and coverage workflows should not use it until reactivated.',
            confirmLabel:
              nextStatus === 'active' ? 'Activate station' : 'Deactivate station',
          })
        },
      }),
    []
  )

  const barangayFilterOptions = useMemo(
    () => getBarangayFilterOptions(data),
    [data]
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

      const station = row.original
      const haystack = [
        station.name,
        station.stationCode,
        station.physicalBarangayName,
        station.physicalBarangayPcode,
        formatCoordinates(station.latitude, station.longitude),
      ]

      return haystack.some((entry) => entry.toLowerCase().includes(query))
    },
  })

  const selectedStationIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)

  function openBulkStatus(nextStatus: HealthStationStatus) {
    if (!selectedStationIds.length) return

    setConfirmAction({
      stationIds: selectedStationIds,
      nextStatus,
      title: `${nextStatus === 'active' ? 'Activate' : 'Deactivate'} ${selectedStationIds.length} selected stations?`,
      description:
        nextStatus === 'active'
          ? 'Selected stations will return to active management lists and assignment workflows.'
          : 'Selected stations will remain in history, but staff and coverage workflows should not use them until reactivated.',
      confirmLabel: nextStatus === 'active' ? 'Activate selected' : 'Deactivate selected',
    })
  }

  function executeConfirmAction() {
    if (!confirmAction) return

    onSetStatus(confirmAction.stationIds, confirmAction.nextStatus)
    table.resetRowSelection()
    setConfirmAction(null)
  }

  return (
    <section className='flex flex-col gap-4'>
      <DataTableToolbar
        table={table}
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: stationStatusOptions,
          },
          {
            columnId: 'facilityType',
            title: 'Type',
            options: facilityTypeOptions,
          },
          {
            columnId: 'pinStatus',
            title: 'GIS Pin',
            options: pinStatusOptions,
          },
          {
            columnId: 'physicalBarangay',
            title: 'Barangay',
            options: barangayFilterOptions,
          },
        ]}
        searchPlaceholder='Search Health Station'
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
                  data-state={row.getIsSelected() ? 'selected' : undefined}
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
                  No health stations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='md:hidden'>
        <HealthStationsMobileCards
          onToggleStatus={(station) => {
            const nextStatus =
              station.status === 'inactive' ? 'active' : 'inactive'

            setConfirmAction({
              stationIds: [station.id],
              nextStatus,
              title: `${nextStatus === 'active' ? 'Activate' : 'Deactivate'} ${station.name}?`,
              description:
                nextStatus === 'active'
                  ? 'The station will return to active management lists and assignment workflows.'
                  : 'The station will remain in history, but staff and coverage workflows should not use it until reactivated.',
              confirmLabel:
                nextStatus === 'active'
                  ? 'Activate station'
                  : 'Deactivate station',
            })
          }}
          rows={table.getRowModel().rows}
        />
      </div>

      <DataTablePagination table={table} />

      <HealthStationsBulkActions
        table={table}
        onActivateSelected={() => openBulkStatus('active')}
        onDeactivateSelected={() => openBulkStatus('inactive')}
      />

      <HealthStationsConfirmDialog
        action={confirmAction}
        onConfirm={executeConfirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null)
        }}
      />
    </section>
  )
}
