"use client"

import Link from 'next/link'
import type { Row } from '@tanstack/react-table'
import { ShieldAlert, ShieldCheck, RotateCcw, SquarePen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import type { AdminUser } from '../data/schema'
import {
  formatLastLoginDateTime,
  formatPhoneNumber,
} from '../data/formatters'
import { roleOptions } from '../data/options'

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

type UsersMobileCardsProps = {
  rows: Row<AdminUser>[]
  onResetPassword: (user: AdminUser) => void
  onToggleStatus: (user: AdminUser) => void
}

export function UsersMobileCards({
  rows,
  onResetPassword,
  onToggleStatus,
}: UsersMobileCardsProps) {
  if (!rows.length) {
    return (
      <div className='rounded-md border p-6 text-center text-sm text-muted-foreground'>
        No users found for this filter set.
      </div>
    )
  }

  return (
    <div className='grid gap-3'>
      {rows.map((row) => {
        const user = row.original
        const role = roleOptions.find((option) => option.value === user.role)

        return (
          <article
            className='rounded-md border bg-card p-3 shadow-none'
            data-state={row.getIsSelected() ? 'selected' : undefined}
            key={user.id}
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-start gap-3'>
                <Checkbox
                  aria-label={`Select ${user.userId}`}
                  checked={row.getIsSelected()}
                  onCheckedChange={(checked) => row.toggleSelected(!!checked)}
                />
                <Avatar className='size-10 rounded-lg'>
                  <AvatarImage alt={`${user.firstName} ${user.lastName}`} src={user.profilePhotoUrl} />
                  <AvatarFallback className='rounded-lg'>
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium'>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className='text-xs text-muted-foreground'>{user.userId}</p>
                </div>
              </div>
              <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                {user.status}
              </Badge>
            </div>

            <dl className='mt-3 grid gap-2 text-sm'>
              <div className='grid grid-cols-[88px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Email</dt>
                <dd className='truncate'>{user.email}</dd>
              </div>
              <div className='grid grid-cols-[88px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Phone</dt>
                <dd>{formatPhoneNumber(user.mobileNumber)}</dd>
              </div>
              <div className='grid grid-cols-[88px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Role</dt>
                <dd>{role?.label ?? user.role}</dd>
              </div>
              <div className='grid grid-cols-[88px_1fr] gap-2'>
                <dt className='text-muted-foreground'>BHS</dt>
                <dd>{user.healthStationName ?? 'City-wide'}</dd>
              </div>
              <div className='grid grid-cols-[88px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Password</dt>
                <dd>
                  {user.mustChangePassword ? 'Change pending' : 'Updated'}
                </dd>
              </div>
              <div className='grid grid-cols-[88px_1fr] gap-2'>
                <dt className='text-muted-foreground'>Last login</dt>
                <dd>{formatLastLoginDateTime(user.lastLoginAt)}</dd>
              </div>
            </dl>

            <div className='mt-3 grid grid-cols-3 gap-2'>
              <Button asChild className='h-11' size='sm' variant='outline'>
                <Link href={`/admin/users/${user.id}/edit`}>
                  <SquarePen data-icon='inline-start' />
                  Edit
                </Link>
              </Button>
              <Button
                className='h-11'
                onClick={() => onResetPassword(user)}
                size='sm'
                variant='outline'
              >
                <RotateCcw data-icon='inline-start' />
                Reset
              </Button>
              <Button
                className='h-11'
                onClick={() => onToggleStatus(user)}
                size='sm'
                variant={user.status === 'inactive' ? 'outline' : 'destructive'}
              >
                {user.status === 'inactive' ? (
                  <ShieldCheck data-icon='inline-start' />
                ) : (
                  <ShieldAlert data-icon='inline-start' />
                )}
                {user.status === 'inactive' ? 'Activate' : 'Deactivate'}
              </Button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
