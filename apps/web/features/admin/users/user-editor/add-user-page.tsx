"use client"

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { buildDefaultFormValues, type HealthStationOption } from '../data/form-schema'
import type { AddUserValues } from '../data/form-schema'
import { createUserAction } from '../actions'
import { UserForm } from './components/user-form'

type AddUserPageProps = {
  roleCounts: Record<string, number>
  stations: HealthStationOption[]
}

export function AddUserPage({ roleCounts, stations }: AddUserPageProps) {
  const router = useRouter()

  async function handleSubmit(values: AddUserValues, photoFormData?: FormData) {
    const result = await createUserAction(values, photoFormData)
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    toast.success('User created successfully.')
    router.push('/admin/users')
  }

  return (
    <section className='flex min-h-0 flex-1 flex-col'>
      <UserForm
        mode='create'
        roleCounts={roleCounts}
        stations={stations}
        defaultValues={buildDefaultFormValues({ roleCounts })}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
