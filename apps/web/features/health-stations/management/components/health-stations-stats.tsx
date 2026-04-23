import {
  Building2Icon,
  InfoIcon,
  MapPinIcon,
  ShieldCheckIcon,
  WaypointsIcon,
} from 'lucide-react'
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
import type { HealthStation } from '../data/schema'

type HealthStationsStatsProps = {
  stations: HealthStation[]
}

export function HealthStationsStats({ stations }: HealthStationsStatsProps) {
  const totalStations = stations.length
  const activeStations = stations.filter(
    (station) => station.status === 'active'
  ).length
  const completeCoverage = stations.filter(
    (station) =>
      station.status === 'active' &&
      station.coverageCount > 0 &&
      station.primaryCoverageCount > 0
  ).length
  const missingPins = stations.filter(
    (station) => station.pinStatus === 'needs_pin'
  ).length

  const stats = [
    {
      label: 'Total stations',
      value: totalStations,
      kpi: '100% baseline',
      description: 'All health stations currently listed for management.',
      icon: Building2Icon,
    },
    {
      label: 'Active stations',
      value: activeStations,
      kpi: `${toPercent(activeStations, totalStations)} of all stations`,
      description: 'Stations currently available for staff and service coverage.',
      icon: ShieldCheckIcon,
    },
    {
      label: 'Complete coverage',
      value: completeCoverage,
      kpi: `${toPercent(completeCoverage, activeStations)} of active stations`,
      description:
        'Active stations with at least one service barangay and one primary assignment.',
      icon: WaypointsIcon,
    },
    {
      label: 'Missing GIS pin',
      value: missingPins,
      kpi: `${toPercent(missingPins, totalStations)} of all stations`,
      description: 'Stations without saved latitude and longitude coordinates.',
      icon: MapPinIcon,
    },
  ]

  return (
    <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {stats.map((stat) => (
        <Card key={stat.label} className='gap-1 rounded-lg shadow-none dark:border'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
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
                    <InfoIcon className='size-4' />
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
              <p className='font-heading text-2xl font-semibold tracking-tight'>
                {stat.value}
              </p>
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
