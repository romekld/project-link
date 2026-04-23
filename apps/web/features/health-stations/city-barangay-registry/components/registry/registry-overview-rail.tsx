import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type {
  CityBarangayRegistryRecord,
  CityBarangayRegistryStats,
} from '../../data/schema'
import { formatArea, formatCompactNumber, formatDate } from '../../data/formatters'
import { SelectedBarangayCard } from './selected-barangay-card'

type RegistryOverviewRailProps = {
  cityName: string
  hasMultipleCities: boolean
  stats: CityBarangayRegistryStats
  selectedRecord: CityBarangayRegistryRecord | null
}

export function RegistryOverviewRail({
  cityName,
  hasMultipleCities,
  stats,
  selectedRecord,
}: RegistryOverviewRailProps) {
  const scopePercent =
    stats.totalBarangays > 0
      ? Math.round((stats.inCho2Scope / stats.totalBarangays) * 100)
      : 0
  const averageArea =
    stats.totalBarangays > 0 ? stats.totalAreaSqKm / stats.totalBarangays : 0

  return (
    <aside className='flex min-h-0 flex-col gap-3 p-px pb-3 xl:sticky xl:top-0 xl:h-full xl:self-start xl:overflow-y-auto'>
      <Card className='shadow-none' size='sm'>
        <CardHeader>
          <CardTitle>Coverage Snapshot</CardTitle>
          <CardDescription>
            {hasMultipleCities
              ? 'Barangay coverage across selected city boundaries.'
              : `Barangay coverage for ${cityName}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          <dl className='grid gap-2 sm:grid-cols-2'>
            <InfoRailRow label='Total barangays' value={formatCompactNumber(stats.totalBarangays)} />
            <InfoRailRow label='In scope' value={formatCompactNumber(stats.inCho2Scope)} />
            <InfoRailRow label='Out of scope' value={formatCompactNumber(stats.outsideCho2Scope)} />
          </dl>
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between gap-3 text-xs'>
              <span className='text-muted-foreground'>In-scope coverage rate</span>
              <span className='font-mono font-medium tabular-nums'>
                {scopePercent}%
              </span>
            </div>
            <Progress value={scopePercent} />
          </div>
        </CardContent>
      </Card>

      <Card className='shadow-none' size='sm'>
        <CardHeader>
          <CardTitle>Boundary Metrics</CardTitle>
          <CardDescription>
            Area totals and validity metadata from source boundaries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className='grid gap-2 sm:grid-cols-2'>
            <InfoRailRow label='Total area' value={formatArea(stats.totalAreaSqKm)} />
            <InfoRailRow label='Average barangay area' value={formatArea(averageArea)} />
            <InfoRailRow label='Data source date' value={formatDate(stats.sourceDate)} />
            <InfoRailRow label='Validity start' value={formatDate(stats.validOn)} />
            <InfoRailRow label='Last registry update' value={formatDate(stats.latestUpdatedAt)} />
          </dl>
        </CardContent>
      </Card>

      <SelectedBarangayCard
        record={selectedRecord}
      />
    </aside>
  )
}

function InfoRailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='py-1'>
      <dt className='truncate text-xs text-muted-foreground'>{label}</dt>
      <dd className='mt-1 font-mono text-base font-medium tabular-nums leading-tight'>
        {value}
      </dd>
    </div>
  )
}
