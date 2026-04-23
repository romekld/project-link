"use client"

import Link from 'next/link'
import {
  Building2Icon,
  MapPinnedIcon,
  MoreHorizontalIcon,
  ShieldCheckIcon,
  ShieldXIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { HealthStation } from '../data/schema'

type HealthStationsRowActionsProps = {
  station: HealthStation
  onToggleStatus: (station: HealthStation) => void
}

export function HealthStationsRowActions({
  station,
  onToggleStatus,
}: HealthStationsRowActionsProps) {
  const canActivate = station.status === 'inactive'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label='Open row actions'
          className='size-8'
          size='icon'
          variant='ghost'
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem asChild>
          <Link href={`/admin/health-stations/manage/${station.id}/edit`}>
            <Building2Icon data-icon='inline-start' />
            Manage station
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/admin/health-stations/pins'>
            Pin on map
            <MapPinnedIcon data-icon='inline-end' />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onToggleStatus(station)}
          variant={canActivate ? 'default' : 'destructive'}
        >
          {canActivate ? (
            <ShieldCheckIcon data-icon='inline-start' />
          ) : (
            <ShieldXIcon data-icon='inline-start' />
          )}
          {canActivate ? 'Activate station' : 'Deactivate station'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
