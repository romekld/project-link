import { useDeferredValue, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { AlertCircle, ArrowUpDown, Columns3, MoreHorizontal, Search, ShieldAlert, UserCog, KeyRound } from 'lucide-react'
import type { UserProfile, UserRole } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
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

type StatusFilter = 'all' | 'active' | 'inactive'
type PasswordFilter = 'all' | 'pending' | 'complete'
type LoginFilter = 'all' | 'never' | 'signed-in'

export function UsersDataTable({
  users,
  stations,
  loading,
  onManage,
  onToggleStatus,
  onResetPassword,
}: UsersDataTableProps) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [stationFilter, setStationFilter] = useState<string>('all')
  const [passwordFilter, setPasswordFilter] = useState<PasswordFilter>('all')
  const [loginFilter, setLoginFilter] = useState<LoginFilter>('all')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const deferredSearch = useDeferredValue(search)

  const filteredUsers = users.filter((user) => {
    const matchesSearch = deferredSearch.trim() === ''
      || formatUserDisplayName(user).toLowerCase().includes(deferredSearch.trim().toLowerCase())
      || user.user_id.toLowerCase().includes(deferredSearch.trim().toLowerCase())
      || user.username.toLowerCase().includes(deferredSearch.trim().toLowerCase())
      || user.email.toLowerCase().includes(deferredSearch.trim().toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'active' && user.is_active)
      || (statusFilter === 'inactive' && !user.is_active)
    const matchesStation = stationFilter === 'all' || user.health_station_id === stationFilter
    const matchesPassword = passwordFilter === 'all'
      || (passwordFilter === 'pending' && user.must_change_password)
      || (passwordFilter === 'complete' && !user.must_change_password)
    const matchesLogin = loginFilter === 'all'
      || (loginFilter === 'never' && !user.last_login_at)
      || (loginFilter === 'signed-in' && Boolean(user.last_login_at))

    return matchesSearch && matchesRole && matchesStatus && matchesStation && matchesPassword && matchesLogin
  })

  const columns: ColumnDef<UserDirectoryRecord>[] = [
    {
      id: 'name',
      accessorFn: (row) => formatUserDisplayName(row),
      header: 'User',
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <UserAvatar
            firstName={row.original.first_name}
            lastName={row.original.last_name}
            photoPath={row.original.profile_photo_path}
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{formatUserDisplayName(row.original)}</span>
            <span className="truncate text-sm text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'user_id',
      header: 'User ID',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.user_id}</span>,
    },
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.username}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <Badge variant="secondary">{getRoleLabel(row.original.role)}</Badge>,
    },
    {
      accessorKey: 'health_station_name',
      header: 'BHS',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.health_station_name ?? 'City-wide'}</span>
      ),
    },
    {
      id: 'status',
      accessorFn: (row) => (row.is_active ? 'Active' : 'Inactive'),
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'destructive'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'password_state',
      accessorFn: (row) => (row.must_change_password ? 'Pending' : 'Cleared'),
      header: 'Password',
      cell: ({ row }) => (
        <Badge variant={row.original.must_change_password ? 'outline' : 'secondary'}>
          {row.original.must_change_password ? 'Change pending' : 'Updated'}
        </Badge>
      ),
    },
    {
      id: 'last_login_at',
      accessorFn: (row) => row.last_login_at ?? '',
      header: 'Last login',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDateTime(row.original.last_login_at)}</span>
      ),
    },
    {
      id: 'updated_at',
      accessorFn: (row) => row.updated_at ?? row.created_at,
      header: 'Updated',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.original.updated_at ?? row.original.created_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Open actions for ${formatUserDisplayName(row.original)}`} />}>
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onManage(row.original)}>
                <UserCog data-icon="inline-start" />
                Manage user
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetPassword(row.original)}>
                <KeyRound data-icon="inline-start" />
                Reset password
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onToggleStatus(row.original)}>
                <ShieldAlert data-icon="inline-start" />
                {row.original.is_active ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({
    data: filteredUsers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 8,
      },
    },
  })

  const currentRows = table.getRowModel().rows

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, user ID, username, or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-2 lg:justify-end">
            <FilterSelect
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}
              placeholder="All roles"
              options={[
                { value: 'all', label: 'All roles' },
                ...(['system_admin', 'city_health_officer', 'phis_coordinator', 'dso', 'nurse_phn', 'midwife_rhm', 'bhw'] as UserRole[]).map((role) => ({
                  value: role,
                  label: getRoleLabel(role),
                })),
              ]}
            />
            <FilterSelect
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              placeholder="All statuses"
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'active', label: 'Active only' },
                { value: 'inactive', label: 'Inactive only' },
              ]}
            />
            <FilterSelect
              value={stationFilter}
              onValueChange={setStationFilter}
              placeholder="All BHS"
              options={[
                { value: 'all', label: 'All BHS' },
                ...stations.map((station) => ({ value: station.id, label: station.name })),
              ]}
            />
            <FilterSelect
              value={passwordFilter}
              onValueChange={(value) => setPasswordFilter(value as PasswordFilter)}
              placeholder="Password state"
              options={[
                { value: 'all', label: 'Password state' },
                { value: 'pending', label: 'Change pending' },
                { value: 'complete', label: 'Already updated' },
              ]}
            />
            <FilterSelect
              value={loginFilter}
              onValueChange={(value) => setLoginFilter(value as LoginFilter)}
              placeholder="Login state"
              options={[
                { value: 'all', label: 'Login state' },
                { value: 'never', label: 'Never signed in' },
                { value: 'signed-in', label: 'Has signed in' },
              ]}
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setRoleFilter('all')
                setStatusFilter('all')
                setStationFilter('all')
                setPasswordFilter('all')
                setLoginFilter('all')
              }}
            >
              Clear filters
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                <Columns3 data-icon="inline-start" />
                Columns
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  {table.getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                      >
                        {column.id.replaceAll('_', ' ')}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
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
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={`loading-cell-${index}-${cellIndex}`}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : currentRows.length ? (
              currentRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <NoResults />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`mobile-loading-${index}`} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
          ))
        ) : currentRows.length ? (
          currentRows.map((row) => (
            <article key={row.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <UserAvatar
                  firstName={row.original.first_name}
                  lastName={row.original.last_name}
                  photoPath={row.original.profile_photo_path}
                  size="lg"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium">{formatUserDisplayName(row.original)}</span>
                  <span className="truncate text-sm text-muted-foreground">{row.original.email}</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary">{getRoleLabel(row.original.role)}</Badge>
                    <Badge variant={row.original.is_active ? 'default' : 'destructive'}>
                      {row.original.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant={row.original.must_change_password ? 'outline' : 'secondary'}>
                      {row.original.must_change_password ? 'Change pending' : 'Updated'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <CardDatum label="User ID" value={row.original.user_id} />
                <CardDatum label="Username" value={row.original.username} />
                <CardDatum label="BHS" value={row.original.health_station_name ?? 'City-wide'} />
                <CardDatum label="Last login" value={formatDateTime(row.original.last_login_at)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => onManage(row.original)}>
                  Manage
                </Button>
                <Button variant="outline" onClick={() => onResetPassword(row.original)}>
                  Reset password
                </Button>
                <Button
                  variant={row.original.is_active ? 'destructive' : 'secondary'}
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
        <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>
            Showing {currentRows.length} of {filteredUsers.length} matching users
          </span>
          <Pagination className="mx-0 w-auto justify-start md:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-3">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
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
    <Select value={value} onValueChange={(nextValue) => onValueChange(nextValue ?? '')}>
      <SelectTrigger className="w-full min-w-40 lg:w-44">
        <SelectValue placeholder={placeholder} />
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
          Try a different role, status, or search term to find the account you need.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent />
    </Empty>
  )
}
