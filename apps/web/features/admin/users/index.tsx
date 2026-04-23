"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserRoundPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import type { AdminUser } from './data/schema'
import { UsersStats } from './components/users-stats'
import { UsersTable } from './components/users-table'
import { resetPasswordsAction, setUserStatusAction } from './actions'

type AdminUsersPageProps = {
    users: AdminUser[]
}

export function AdminUsersPage({ users }: AdminUsersPageProps) {
    const router = useRouter()

    async function handleResetPasswords(userIds: string[]) {
        const result = await resetPasswordsAction(userIds)
        if ('error' in result) {
            toast.error(result.error)
            return
        }
        toast.success('Passwords flagged for reset.')
        router.refresh()
    }

    async function handleSetStatus(userIds: string[], nextStatus: 'active' | 'inactive') {
        const result = await setUserStatusAction(userIds, nextStatus)
        if ('error' in result) {
            toast.error(result.error)
            return
        }
        toast.success(`${userIds.length} user${userIds.length !== 1 ? 's' : ''} set to ${nextStatus}.`)
        router.refresh()
    }

    return (
        <section className='flex flex-col gap-4 sm:gap-6'>
            <PageHeader
                title='User List'
                description='Manage users and their roles and assignments here.'
                controls={
                    <Button asChild className='h-10 px-4'>
                        <Link href='/admin/users/new'>
                            Add User
                            <UserRoundPlus />
                        </Link>
                    </Button>
                }
            />

            <UsersStats users={users} />

            <UsersTable
                data={users}
                onResetPasswords={handleResetPasswords}
                onSetStatus={handleSetStatus}
            />
        </section>
    )
}
