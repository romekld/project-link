"use client"

import { useMemo, useState } from 'react'
import {
  flexRender,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import type { AdminUser } from '../data/schema'
import { formatPhoneNumber } from '../data/formatters'
import { UsersBulkActions } from './users-bulk-actions'
import { UsersConfirmDialog, type ConfirmAction } from './users-confirm-dialog'
import { getUsersColumns } from './users-columns'
import { roleOptions, statusOptions } from '../data/options'
import { UsersMobileCards } from './users-mobile-cards'

type UsersTableProps = {
  data: AdminUser[]
  onResetPasswords: (userIds: string[]) => void
  onSetStatus: (userIds: string[], nextStatus: 'active' | 'inactive') => void
}

function toBhsFilterValue(user: AdminUser) {
  return user.healthStationName ?? 'city_wide'
}

function getBhsFilterOptions(data: AdminUser[]) {
  const values = new Set<string>()

  for (const user of data) {
    values.add(toBhsFilterValue(user))
  }

  return Array.from(values)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({
      label: value === 'city_wide' ? 'City-wide' : value,
      value,
    }))
}

export function UsersTable({ data, onResetPasswords, onSetStatus }: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  const columns = useMemo(
    () =>
      getUsersColumns({
        onResetPassword: (user) => {
          setConfirmAction({
            type: 'reset',
            userIds: [user.id],
            title: `Reset password for ${user.firstName} ${user.lastName}?`,
            description:
              'This sets the account back to password-change pending at next login.',
            confirmLabel: 'Reset password',
          })
        },
        onToggleStatus: (user) => {
          const nextStatus = user.status === 'inactive' ? 'active' : 'inactive'
          setConfirmAction({
            type: 'status',
            userIds: [user.id],
            nextStatus,
            title: `${nextStatus === 'active' ? 'Activate' : 'Deactivate'} ${user.firstName} ${user.lastName}?`,
            description:
              nextStatus === 'active'
                ? 'The user will be able to access the system again.'
                : 'The user will be blocked from accessing the system until reactivated.',
            confirmLabel: nextStatus === 'active' ? 'Activate user' : 'Deactivate user',
          })
        },
      }),
    []
  )

  const bhsFilterOptions = useMemo(() => getBhsFilterOptions(data), [data])

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
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 8,
      },
    },
    globalFilterFn: (row, _columnId, value) => {
      const query = String(value ?? '').toLowerCase().trim()
      if (!query) return true

      const user = row.original
      const haystack = [
        `${user.firstName} ${user.lastName}`,
        user.userId,
        user.username,
        user.email,
        user.mobileNumber,
        formatPhoneNumber(user.mobileNumber),
        user.healthStationName ?? 'City-wide',
      ]

      return haystack.some((entry) => entry.toLowerCase().includes(query))
    },
  })

  const selectedUserIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)

  function openBulkReset() {
    if (!selectedUserIds.length) return

    setConfirmAction({
      type: 'reset',
      userIds: selectedUserIds,
      title: `Reset password for ${selectedUserIds.length} selected users?`,
      description:
        'Selected accounts will be prompted to change password on next login.',
      confirmLabel: 'Reset selected',
    })
  }

  function openBulkStatus(nextStatus: 'active' | 'inactive') {
    if (!selectedUserIds.length) return

    setConfirmAction({
      type: 'status',
      userIds: selectedUserIds,
      nextStatus,
      title: `${nextStatus === 'active' ? 'Activate' : 'Deactivate'} ${selectedUserIds.length} selected users?`,
      description:
        nextStatus === 'active'
          ? 'Selected users will be able to access the system.'
          : 'Selected users will be blocked from accessing the system.',
      confirmLabel: nextStatus === 'active' ? 'Activate selected' : 'Deactivate selected',
    })
  }

  function executeConfirmAction() {
    if (!confirmAction) return

    if (confirmAction.type === 'reset') {
      onResetPasswords(confirmAction.userIds)
    } else {
      onSetStatus(confirmAction.userIds, confirmAction.nextStatus)
    }

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
            options: statusOptions,
          },
          {
            columnId: 'role',
            title: 'Role',
            options: roleOptions,
          },
          {
            columnId: 'bhs',
            title: 'BHS',
            options: bhsFilterOptions,
          },
          {
            columnId: 'mustChangePassword',
            title: 'Password state',
            options: [
              { label: 'Change pending', value: 'true' },
              { label: 'Updated', value: 'false' },
            ],
          },
        ]}
        searchPlaceholder='Search User'
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
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='md:hidden'>
        <UsersMobileCards
          onResetPassword={(user) => {
            setConfirmAction({
              type: 'reset',
              userIds: [user.id],
              title: `Reset password for ${user.firstName} ${user.lastName}?`,
              description:
                'This sets the account back to password-change pending at next login.',
              confirmLabel: 'Reset password',
            })
          }}
          onToggleStatus={(user) => {
            const nextStatus = user.status === 'inactive' ? 'active' : 'inactive'
            setConfirmAction({
              type: 'status',
              userIds: [user.id],
              nextStatus,
              title: `${nextStatus === 'active' ? 'Activate' : 'Deactivate'} ${user.firstName} ${user.lastName}?`,
              description:
                nextStatus === 'active'
                  ? 'The user will be able to access the system again.'
                  : 'The user will be blocked from accessing the system until reactivated.',
              confirmLabel: nextStatus === 'active' ? 'Activate user' : 'Deactivate user',
            })
          }}
          rows={table.getRowModel().rows}
        />
      </div>

      <DataTablePagination table={table} />

      <UsersBulkActions
        table={table}
        onActivateSelected={() => openBulkStatus('active')}
        onDeactivateSelected={() => openBulkStatus('inactive')}
        onResetSelected={openBulkReset}
      />

      <UsersConfirmDialog
        action={confirmAction}
        onConfirm={executeConfirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null)
        }}
      />
    </section>
  )
}
