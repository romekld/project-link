import { KeyRound, UserRoundPlus, UserRoundCheck, UsersRound, Info } from 'lucide-react'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { AdminUser } from '../data/schema'

type UsersStatsProps = {
  users: AdminUser[]
}

export function UsersStats({ users }: UsersStatsProps) {
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.status === 'active').length
  const pendingInvite = users.filter((user) => user.status === 'invited').length
  const changePending = users.filter((user) => user.mustChangePassword).length

  const stats = [
    {
      label: 'Total users',
      value: totalUsers,
      kpi: '100% baseline',
      description: 'All accounts currently listed in the user directory.',
      icon: UsersRound,
    },
    {
      label: 'Active users',
      value: activeUsers,
      kpi: `${toPercent(activeUsers, totalUsers)} of all users`,
      description: 'Users with active status who can currently access the app.',
      icon: UserRoundCheck,
    },
    {
      label: 'Pending invite',
      value: pendingInvite,
      kpi: `${toPercent(pendingInvite, totalUsers)} of all users`,
      description:
        'Users with invited status who have not completed first access yet.',
      icon: UserRoundPlus,
    },
    {
      label: 'Need password change',
      value: changePending,
      kpi: `${toPercent(changePending, totalUsers)} of all users`,
      description:
        'Users flagged to change their password on the next successful login.',
      icon: KeyRound,
    },
  ]

  return (
    <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {stats.map((stat) => (
        <Card key={stat.label} className='shadow-none rounded-lg dark:border gap-1'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm font-medium '>
              <stat.icon className='size-4' />
              {stat.label}
            </CardTitle>
            <CardAction>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label={`About ${stat.label}`}
                    className='rounded-lg p-1 text-muted-foreground hover:bg-muted'
                    type='button'
                  >
                    <Info className='size-4' />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='max-w-64'>{stat.description}</p>
                </TooltipContent>
              </Tooltip>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div>
              <p className='text-2xl font-heading font-semibold tracking-tight'>{stat.value}</p>
              <p className='mt-1 text-xs text-muted-foreground'>{stat.kpi}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

function toPercent(value: number, total: number) {
  if (!total) return '0%'
  return `${Math.round((value / total) * 100)}%`
}
