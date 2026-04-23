"use client"

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { DataTableColumnHeader } from '@/components/data-table'
import type { AdminUser } from '../data/schema'
import {
  formatLastLoginDateTime,
  formatPhoneNumber,
} from '../data/formatters'
import { roleOptions } from '../data/options'
import { UsersRowActions } from './users-row-actions'

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

type UsersColumnsConfig = {
  onResetPassword: (user: AdminUser) => void
  onToggleStatus: (user: AdminUser) => void
}

export function getUsersColumns({
  onResetPassword,
  onToggleStatus,
}: UsersColumnsConfig): ColumnDef<AdminUser>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label='Select all users'
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select ${row.original.userId}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: 'identity',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className='flex min-w-32 items-center gap-3'>
            <Avatar className='size-9 rounded-lg'>
              <AvatarImage alt={`${user.firstName} ${user.lastName}`} src={user.profilePhotoUrl} />
              <AvatarFallback>
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0'>
              <p className='truncate font-medium'>
                {user.firstName} {user.lastName}
              </p>
              <p className='text-xs text-muted-foreground'>{user.userId}</p>
            </div>
          </div>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Email' />
      ),
      cell: ({ row }) => (
        <span className='max-w-56 truncate text-sm'>{row.original.email}</span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'mobileNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Phone' />
      ),
      cell: ({ row }) => formatPhoneNumber(row.original.mobileNumber),
      enableHiding: false,
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        const className =
          status === 'active'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : status === 'inactive'
              ? 'border-slate-200 bg-slate-100 text-slate-700'
              : status === 'invited'
                ? 'border-sky-200 bg-sky-50 text-sky-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'

        return (
          <Badge className={className} variant='outline'>
            {status}
          </Badge>
        )
      },
      filterFn: (row, id, values) => {
        const list = values as string[]
        if (!list?.length) return true
        return list.includes(String(row.getValue(id)))
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Role' />
      ),
      cell: ({ row }) => {
        const role = row.original.role
        const option = roleOptions.find((item) => item.value === role)

        return (
          <Badge className='font-normal' variant='secondary'>
            {option?.label ?? role}
          </Badge>
        )
      },
      filterFn: (row, id, values) => {
        const list = values as string[]
        if (!list?.length) return true
        return list.includes(String(row.getValue(id)))
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'bhs',
      accessorFn: (row) => row.healthStationName ?? 'city_wide',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='BHS' />
      ),
      cell: ({ row }) => row.original.healthStationName ?? 'City-wide',
      filterFn: (row, id, values) => {
        const list = values as string[]
        if (!list?.length) return true
        return list.includes(String(row.getValue(id)))
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'mustChangePassword',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Password state' />
      ),
      cell: ({ row }) =>
        row.original.mustChangePassword ? 'Change pending' : 'Updated',
      filterFn: (row, id, values) => {
        const list = values as string[]
        if (!list?.length) return true
        return list.includes(String(row.getValue(id)))
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'lastLoginAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Last login' />
      ),
      cell: ({ row }) => formatLastLoginDateTime(row.original.lastLoginAt),
      enableHiding: false,
      sortingFn: (rowA, rowB, id) => {
        const valueA = rowA.getValue<string | null>(id)
        const valueB = rowB.getValue<string | null>(id)
        return new Date(valueA ?? 0).getTime() - new Date(valueB ?? 0).getTime()
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <UsersRowActions
          onResetPassword={onResetPassword}
          onToggleStatus={onToggleStatus}
          user={row.original}
        />
      ),
      enableHiding: false,
      enableSorting: false,
    },
  ]
}
