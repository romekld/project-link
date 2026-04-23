"use client"

import Link from 'next/link'
import {
  MoreHorizontal,
  UserRoundCog,
  KeyRound,
  UserRoundX,
  UserRoundCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AdminUser } from '../data/schema'

type UsersRowActionsProps = {
  user: AdminUser
  onResetPassword: (user: AdminUser) => void
  onToggleStatus: (user: AdminUser) => void
}

export function UsersRowActions({
  user,
  onResetPassword,
  onToggleStatus,
}: UsersRowActionsProps) {
  const canActivate = user.status === 'inactive'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label='Open row actions'
          className='size-8'
          size='icon'
          variant='ghost'
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${user.id}/edit`}>
            <UserRoundCog  data-icon='inline-start' />
            Manage user
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onResetPassword(user)}>
          <KeyRound  data-icon='inline-start' />
          Reset password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onToggleStatus(user)}
          variant={canActivate ? 'default' : 'destructive'}
        >
          {canActivate ? (
            <UserRoundCheck  data-icon='inline-start' />
          ) : (
            <UserRoundX  data-icon='inline-start' />
          )}
          {canActivate ? 'Activate user' : 'Deactivate user'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
