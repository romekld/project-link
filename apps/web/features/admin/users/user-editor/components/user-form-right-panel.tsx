"use client"

import type { RefObject } from 'react'
import {
  CalendarDays,
  Clock3,
  ImagePlus,
  Lock,
  RefreshCw,
  Shield,
  Trash2,
  User,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { type AddUserValues, type HealthStationOption } from '../../data/form-schema'

type UserFormRightPanelProps = {
  values: Partial<AddUserValues>
  stations: HealthStationOption[]
  roleOptionLabel?: string
  roleNotes: string[]
  mustChangePassword: boolean
  isActive: boolean
  activity?: {
    createdAt?: string
    updatedAt?: string
    lastLoginAt?: string | null
    passwordChangedAt?: string | null
  }
  photoPreviewUrl: string
  hasCustomPhoto: boolean
  photoError: string
  photoInputRef: RefObject<HTMLInputElement | null>
  onChoosePhoto: () => void
  onRerollAvatar: () => void
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePhoto: () => void
  toDisplayDate: (value?: string | null) => string
  getInitials: (firstName?: string, lastName?: string) => string
}

export function UserFormRightPanel({
  values,
  stations,
  roleOptionLabel,
  roleNotes,
  mustChangePassword,
  isActive,
  activity,
  photoPreviewUrl,
  hasCustomPhoto,
  photoError,
  photoInputRef,
  onChoosePhoto,
  onRerollAvatar,
  onPhotoChange,
  onRemovePhoto,
  toDisplayDate,
  getInitials,
}: UserFormRightPanelProps) {
  return (
    <aside className='h-fit self-start rounded-2xl border border-dashed bg-card p-3 sm:p-4'>
      <div className='flex flex-col gap-4'>
        <Card className='rounded-xl bg-background shadow-none'>
          <CardHeader className='border-b'>
            <CardTitle>Profile photo</CardTitle>
            <CardDescription>Upload a profile photo for internal use.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            <div className='rounded-xl border border-dashed p-4'>
              <div className='flex items-center gap-3'>
                <div className='group relative'>
                  <Avatar className='size-16 rounded-xl'>
                    <AvatarImage src={photoPreviewUrl || undefined} alt='Profile preview' />
                    <AvatarFallback className='text-base'>
                      {getInitials(values.firstName, values.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  {!hasCustomPhoto ? (
                    <Button
                      type='button'
                      size='icon'
                      variant='secondary'
                      onClick={onRerollAvatar}
                      className='absolute -right-2 -top-2 size-7 rounded-full border bg-background/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100'
                      aria-label='Reroll generated avatar'
                      title='Reroll avatar'
                    >
                      <RefreshCw className='size-3.5' />
                    </Button>
                  ) : null}
                </div>
                <div>
                  <p className='font-medium'>
                    {values.firstName || values.lastName
                      ? `${values.firstName} ${values.lastName}`.trim()
                      : 'New account'}
                  </p>
                  <p className='text-xs text-muted-foreground'>Max size: 2 MB. JPG, PNG, or WEBP.</p>
                </div>
              </div>
              <input
                ref={photoInputRef}
                type='file'
                accept='image/jpeg,image/png,image/webp'
                className='hidden'
                onChange={onPhotoChange}
              />
              <div className='mt-3 flex gap-2'>
                <Button type='button' variant='outline' className='h-10 px-4 flex-1' onClick={onChoosePhoto}>
                  Upload image
                  <ImagePlus data-icon='inline-end' />
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='h-10 px-4 '
                  onClick={onRemovePhoto}
                  disabled={!hasCustomPhoto}
                >
                  Remove
                  <Trash2 data-icon='inline-end' />
                </Button>
              </div>
            </div>
            {photoError ? <p className='text-xs text-destructive'>{photoError}</p> : null}
          </CardContent>
        </Card>

        <Card className='rounded-xl bg-background shadow-none'>
          <CardHeader className='border-b'>
            <CardTitle>Account snapshot</CardTitle>
            <CardDescription>Review role, coverage, address, and status at a glance.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Role</span>
              <Badge variant='secondary'>{roleOptionLabel ?? 'Not set'}</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>User ID</span>
              <span className='font-medium'>{values.userId}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Username</span>
              <span className='font-medium'>{values.username || 'Not set'}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Scope</span>
              <span className='font-medium'>
                {values.healthStationId
                  ? stations.find((item) => item.id === values.healthStationId)?.name
                  : 'City-wide'}
              </span>
            </div>
            <div className='flex items-start justify-between gap-4'>
              <span className='text-muted-foreground'>Address</span>
              <div className='max-w-[60%] text-right'>
                <p className='font-medium'>{values.addressLine1 || 'Not set'}</p>
                {values.addressLine2 ? (
                  <p className='text-xs text-muted-foreground'>{values.addressLine2}</p>
                ) : null}
                <p className='text-xs text-muted-foreground'>
                  {[values.cityMunicipality, values.province].filter(Boolean).join(', ') || 'City / province not set'}
                </p>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Password state</span>
              <Badge variant='outline'>{mustChangePassword ? 'Change pending' : 'Updated'}</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Account status</span>
              <Badge variant={isActive ? 'default' : 'outline'}>{isActive ? 'Active' : 'Inactive'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className='rounded-xl bg-background shadow-none'>
          <CardHeader className='border-b'>
            <CardTitle>Role permissions</CardTitle>
            <CardDescription>What this role can access and do.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='mb-2 flex items-center gap-2'>
              <Shield className='size-4 text-muted-foreground' />
              <p className='font-medium'>{roleOptionLabel ?? 'Role not selected'}</p>
            </div>
            <ul className='flex list-disc flex-col gap-1 pl-4 text-sm text-muted-foreground'>
              {roleNotes.length > 0 ? roleNotes.map((note) => <li key={note}>{note}</li>) : <li>Select a role to view access guidance.</li>}
            </ul>
          </CardContent>
        </Card>

        <Card className='rounded-xl bg-background shadow-none'>
          <CardHeader className='border-b'>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Recent account timestamps.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-2 text-sm'>
            <div className='flex items-start gap-2'>
              <CalendarDays className='mt-0.5 size-4 text-muted-foreground' />
              <div>
                <p className='text-muted-foreground'>Created</p>
                <p className='font-medium'>{toDisplayDate(activity?.createdAt)}</p>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <Clock3 className='mt-0.5 size-4 text-muted-foreground' />
              <div>
                <p className='text-muted-foreground'>Updated</p>
                <p className='font-medium'>{toDisplayDate(activity?.updatedAt)}</p>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <User className='mt-0.5 size-4 text-muted-foreground' />
              <div>
                <p className='text-muted-foreground'>Last login</p>
                <p className='font-medium'>{toDisplayDate(activity?.lastLoginAt)}</p>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <Lock className='mt-0.5 size-4 text-muted-foreground' />
              <div>
                <p className='text-muted-foreground'>Password changed</p>
                <p className='font-medium'>{toDisplayDate(activity?.passwordChangedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
