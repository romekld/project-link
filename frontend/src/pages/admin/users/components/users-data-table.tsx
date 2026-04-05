import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  ArrowUpRight,
  AlertCircle,
  KeyRound,
  Search,
  ShieldAlert,
} from 'lucide-react'
import type { UserProfile, UserRole } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserAvatar } from '@/components/user-avatar'
import { formatDateTime, formatUserDisplayName, getRoleLabel } from '@/lib/user-profiles'
import type {
  AdminUsersPasswordStateFilter,
  AdminUsersSearch,
  AdminUsersStatusFilter,
} from '../search'

export interface UserDirectoryRecord extends UserProfile {
  health_station_name?: string | null
}

interface UsersDataTableProps {
  users: UserDirectoryRecord[]
  stations: Array<{ id: string; name: string }>
  loading: boolean
  onManage: (user: UserDirectoryRecord) => void
  onToggleStatus: (user: UserDirectoryRecord) => void
  onResetPassword: (user: UserDirectoryRecord) => void
}

const ROLE_OPTIONS: Array<{ value: 'all' | UserRole; label: string }> = [
  { value: 'all', label: 'All roles' },
  { value: 'system_admin', label: getRoleLabel('system_admin') },
  { value: 'city_health_officer', label: getRoleLabel('city_health_officer') },
  { value: 'phis_coordinator', label: getRoleLabel('phis_coordinator') },
  { value: 'dso', label: getRoleLabel('dso') },
  { value: 'nurse_phn', label: getRoleLabel('nurse_phn') },
  { value: 'midwife_rhm', label: getRoleLabel('midwife_rhm') },
  { value: 'bhw', label: getRoleLabel('bhw') },
]

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export function UsersDataTable({
  users,
  stations,
  loading,
  onManage,
  onToggleStatus,
  onResetPassword,
}: UsersDataTableProps) {
  const search = useSearch({ from: '/admin/users' })
  const navigate = useNavigate({ from: '/admin/users' })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])

  const updateSearch = useCallback((updater: (prev: AdminUsersSearch) => AdminUsersSearch) => {
    navigate({
      search: (prev) => updater(prev as AdminUsersSearch),
      replace: true,
    })
  }, [navigate])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.q.trim().toLowerCase()

    return users.filter((user) => {
      const displayName = formatUserDisplayName(user).toLowerCase()
      const matchesSearch = normalizedSearch === ''
        || displayName.includes(normalizedSearch)
        || user.username.toLowerCase().includes(normalizedSearch)
        || user.email.toLowerCase().includes(normalizedSearch)
        || user.user_id.toLowerCase().includes(normalizedSearch)

      const matchesStatus = search.status === 'all'
        || (search.status === 'active' && user.is_active)
        || (search.status === 'inactive' && !user.is_active)

      const matchesRole = search.role === 'all' || user.role === search.role
      const matchesBhs = search.bhs === 'all' || user.health_station_id === search.bhs
      const matchesPasswordState = search.passwordState === 'all'
        || (search.passwordState === 'pending' && user.must_change_password)
        || (search.passwordState === 'complete' && !user.must_change_password)

      return matchesSearch && matchesStatus && matchesRole && matchesBhs && matchesPasswordState
    })
  }, [search.bhs, search.passwordState, search.q, search.role, search.status, users])

  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: Math.max(search.page - 1, 0),
    pageSize: search.pageSize,
  }), [search.page, search.pageSize])

  const columns = useMemo<ColumnDef<UserDirectoryRecord>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          aria-label="Select all visible users"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label={`Select ${formatUserDisplayName(row.original)}`}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.username}</span>,
    },
    {
      id: 'name',
      accessorFn: (row) => formatUserDisplayName(row),
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            firstName={row.original.first_name}
            lastName={row.original.last_name}
            photoPath={row.original.profile_photo_path}
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{formatUserDisplayName(row.original)}</span>
            <span className="truncate text-xs text-muted-foreground">{row.original.user_id}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.email}</span>
      ),
    },
    {
      id: 'mobile_number',
      accessorFn: (row) => row.mobile_number ?? '',
      header: 'Phone Number',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.mobile_number ?? 'Not recorded'}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'health_station_name',
      header: 'BHS',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.health_station_name ?? 'City-wide'}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'status',
      accessorFn: (row) => (row.is_active ? 'Active' : 'Inactive'),
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge isActive={row.original.is_active} />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{getRoleLabel(row.original.role)}</span>
      ),
      enableSorting: false,
    },
    {
      id: 'last_login_at',
      accessorFn: (row) => row.last_login_at ?? '',
      header: 'Last Login',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.original.last_login_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="xs" onClick={() => onManage(row.original)}>
            <ArrowUpRight data-icon="inline-start" />
            Manage
          </Button>
          <Button variant="outline" size="xs" onClick={() => onResetPassword(row.original)}>
            <KeyRound data-icon="inline-start" />
            Reset
          </Button>
          <Button
            variant={row.original.is_active ? 'destructive' : 'secondary'}
            size="xs"
            onClick={() => onToggleStatus(row.original)}
          >
            <ShieldAlert data-icon="inline-start" />
            {row.original.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], [onManage, onResetPassword, onToggleStatus])

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      updateSearch((prev) => ({
        ...prev,
        page: next.pageIndex + 1,
        pageSize: next.pageSize,
      }))
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualFiltering: false,
  })

  const pageCount = table.getPageCount()

  useEffect(() => {
    if (pageCount === 0 && search.page !== 1) {
      updateSearch((prev) => ({ ...prev, page: 1 }))
      return
    }

    if (pageCount > 0 && search.page > pageCount) {
      updateSearch((prev) => ({ ...prev, page: pageCount }))
    }
  }, [pageCount, search.page, updateSearch])

  const currentRows = table.getRowModel().rows
  const totalPages = Math.max(pageCount, 1)
  const paginationItems = buildPaginationItems(search.page, totalPages)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Filter users..."
                value={search.q}
                onChange={(event) => {
                  const nextValue = event.target.value
                  updateSearch((prev) => ({
                    ...prev,
                    q: nextValue,
                    page: 1,
                  }))
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                value={search.status}
                placeholder="Status"
                options={[
                  { value: 'all', label: 'Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                onValueChange={(value) => updateSearch((prev) => ({
                  ...prev,
                  status: value as AdminUsersStatusFilter,
                  page: 1,
                }))}
              />
              <FilterSelect
                value={search.role}
                placeholder="Role"
                options={ROLE_OPTIONS}
                onValueChange={(value) => updateSearch((prev) => ({
                  ...prev,
                  role: value as 'all' | UserRole,
                  page: 1,
                }))}
              />
              <FilterSelect
                value={search.bhs}
                placeholder="BHS"
                options={[
                  { value: 'all', label: 'BHS' },
                  ...stations.map((station) => ({ value: station.id, label: station.name })),
                ]}
                onValueChange={(value) => updateSearch((prev) => ({
                  ...prev,
                  bhs: value,
                  page: 1,
                }))}
              />
              <FilterSelect
                value={search.passwordState}
                placeholder="Password state"
                options={[
                  { value: 'all', label: 'Password state' },
                  { value: 'pending', label: 'Change pending' },
                  { value: 'complete', label: 'Updated' },
                ]}
                onValueChange={(value) => updateSearch((prev) => ({
                  ...prev,
                  passwordState: value as AdminUsersPasswordStateFilter,
                  page: 1,
                }))}
              />
              <Button
                variant="outline"
                onClick={() => updateSearch((prev) => ({
                  ...prev,
                  q: '',
                  status: 'all',
                  role: 'all',
                  bhs: 'all',
                  passwordState: 'all',
                  page: 1,
                }))}
              >
                Clear filters
              </Button>
            </div>
          </div>

          <Button size="lg" nativeButton={false} render={<Link to="/admin/users/new" />}>
            Add User
          </Button>
        </div>
      </div>

      <div className="hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ArrowUpDown data-icon="inline-end" />
                        </Button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: search.pageSize }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {columns.map((column, cellIndex) => (
                    <TableCell key={`loading-${column.id ?? cellIndex}`}>
                      {cellIndex === 0 ? <Skeleton className="size-4 rounded-[4px]" /> : <Skeleton className="h-5 w-full" />}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : currentRows.length > 0 ? (
              currentRows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12">
                  <NoResults />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {loading ? (
          Array.from({ length: Math.min(search.pageSize, 4) }).map((_, index) => (
            <div key={`mobile-loading-${index}`} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
          ))
        ) : currentRows.length > 0 ? (
          currentRows.map((row) => (
            <article key={row.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
                  aria-label={`Select ${formatUserDisplayName(row.original)}`}
                  className="mt-2"
                />
                <UserAvatar
                  firstName={row.original.first_name}
                  lastName={row.original.last_name}
                  photoPath={row.original.profile_photo_path}
                  size="lg"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium">{formatUserDisplayName(row.original)}</span>
                  <span className="truncate text-sm text-muted-foreground">@{row.original.username}</span>
                  <span className="truncate text-sm text-muted-foreground">{row.original.email}</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <StatusBadge isActive={row.original.is_active} />
                    <Badge variant="secondary">{getRoleLabel(row.original.role)}</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <CardDatum label="Phone Number" value={row.original.mobile_number ?? 'Not recorded'} />
                <CardDatum label="BHS" value={row.original.health_station_name ?? 'City-wide'} />
                <CardDatum label="Last Login" value={formatDateTime(row.original.last_login_at)} />
                <CardDatum label="Password State" value={row.original.must_change_password ? 'Change pending' : 'Updated'} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => onManage(row.original)}>
                  Manage
                </Button>
                <Button variant="outline" size="sm" onClick={() => onResetPassword(row.original)}>
                  Reset password
                </Button>
                <Button
                  variant={row.original.is_active ? 'destructive' : 'secondary'}
                  size="sm"
                  onClick={() => onToggleStatus(row.original)}
                >
                  {row.original.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </article>
          ))
        ) : (
          <NoResults />
        )}
      </div>

      {!loading && filteredUsers.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <Select
              value={String(search.pageSize)}
              onValueChange={(value: string | null) => {
                const nextPageSize = Number(value ?? search.pageSize)
                updateSearch((prev) => ({
                  ...prev,
                  pageSize: nextPageSize,
                  page: 1,
                }))
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PAGE_SIZE_OPTIONS.map((pageSize) => (
                    <SelectItem key={pageSize} value={String(pageSize)}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Page {search.page} of {totalPages}
          </div>

          <Pagination className="mx-0 w-auto justify-start md:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => updateSearch((prev) => ({
                    ...prev,
                    page: Math.max(prev.page - 1, 1),
                  }))}
                  disabled={search.page <= 1}
                />
              </PaginationItem>

              {paginationItems.map((item, index) => (
                <PaginationItem key={`${item}-${index}`}>
                  {item === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={item === search.page}
                      onClick={() => updateSearch((prev) => ({
                        ...prev,
                        page: item,
                      }))}
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => updateSearch((prev) => ({
                    ...prev,
                    page: Math.min(prev.page + 1, totalPages),
                  }))}
                  disabled={search.page >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  )
}

function FilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: Array<{ value: string; label: string }>
}) {
  return (
    <Select value={value} onValueChange={(nextValue: string | null) => onValueChange(nextValue ?? '')}>
      <SelectTrigger className="w-full min-w-36 lg:w-44">
        <SelectValue placeholder={placeholder}>
          {(selectedValue: string | null) => options.find((option) => option.value === selectedValue)?.label ?? placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-rose-200 bg-rose-50 text-rose-700'}
    >
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  )
}

function CardDatum({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

function NoResults() {
  return (
    <Empty className="border-0 rounded-none">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle />
        </EmptyMedia>
        <EmptyTitle>No users match these filters</EmptyTitle>
        <EmptyDescription>
          Try a different username, role, status, BHS, or password state.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent />
    </Empty>
  )
}

function buildPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages] as const
  }

  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages] as const
}
