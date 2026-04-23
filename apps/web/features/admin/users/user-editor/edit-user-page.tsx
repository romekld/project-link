"use client"

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserForm } from './components/user-form'
import { buildDefaultFormValues, type AddUserValues, type HealthStationOption } from '../data/form-schema'
import { updateUserAction } from '../actions'
import type { AdminUser } from '../data/schema'

type EditUserPageProps = {
  user: AdminUser
  stations: HealthStationOption[]
}

export function EditUserPage({ user, stations }: EditUserPageProps) {
  const router = useRouter()

  async function handleSubmit(values: AddUserValues, photoFormData?: FormData) {
    const result = await updateUserAction(user.id, values, photoFormData)
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    toast.success('User updated successfully.')
    router.push('/admin/users')
  }

  return (
    <section className='flex min-h-0 flex-1 flex-col'>
      <UserForm
        mode='edit'
        stations={stations}
        defaultValues={buildDefaultFormValues({ user })}
        activity={{
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt,
          passwordChangedAt: user.mustChangePassword ? null : user.passwordChangedAt,
        }}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
