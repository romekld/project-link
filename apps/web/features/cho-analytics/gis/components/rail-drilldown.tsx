import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type {
  ChoAnalyticsGisData,
  ChoStationPoint,
  ChoTimeWindow,
} from '../data/schema'

type RailDrilldownProps = {
  selectedBarangay: ChoAnalyticsGisData['barangays'][number] | null
  selectedStation: ChoStationPoint | null
  stationPoints: ChoStationPoint[]
  timeWindow: ChoTimeWindow
}

export function RailDrilldown({
  selectedBarangay,
  selectedStation,
  stationPoints,
  timeWindow,
}: RailDrilldownProps) {
  if (!selectedBarangay) {
    return (
      <section className='rounded-xl border bg-background p-4 shadow-sm'>
        <h3 className='text-sm font-semibold text-foreground'>Barangay drilldown</h3>
        <p className='mt-2 text-sm text-muted-foreground'>
          Select a barangay on the map to inspect burden details.
        </p>
      </section>
    )
  }

  const analytics = selectedBarangay.analyticsByWindow[timeWindow]
  const relatedStations = stationPoints.filter((station) =>
    selectedBarangay.stationIds.includes(station.id)
  )

  return (
    <section className='rounded-xl border bg-background p-4 shadow-sm'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='truncate text-sm font-semibold text-foreground'>
            {selectedBarangay.name}
          </h3>
          <p className='mt-1 font-mono text-xs text-muted-foreground'>
            {selectedBarangay.pcode}
          </p>
        </div>
        <Badge>Rank #{analytics.rank}</Badge>
      </div>

      <div className='mt-3 grid grid-cols-2 gap-3 text-sm'>
        <Metric label='Cases' value={analytics.caseCount.toLocaleString()} />
        <Metric label='Alerts' value={analytics.alertCount.toLocaleString()} />
        <Metric label='Burden score' value={analytics.burdenScore.toFixed(1)} />
        <Metric
          label='Trend delta'
          value={`${analytics.trendDeltaPct > 0 ? '+' : ''}${analytics.trendDeltaPct}%`}
        />
      </div>

      <Separator className='my-4' />

      <div className='space-y-2'>
        <p className='text-xs uppercase tracking-[0.14em] text-muted-foreground'>
          Station context
        </p>
        {relatedStations.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No mapped health station in this barangay yet.
          </p>
        ) : (
          relatedStations.map((station) => (
            <div
              key={station.id}
              className='rounded-lg border px-3 py-2 text-sm'
            >
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <p className='font-medium text-foreground'>{station.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {station.stationCode}
                  </p>
                </div>
                <Badge
                  variant={
                    selectedStation?.id === station.id ? 'default' : 'outline'
                  }
                >
                  {selectedStation?.id === station.id ? 'Focused' : station.source}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border bg-muted/20 px-3 py-2'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='mt-1 font-semibold text-foreground'>{value}</p>
    </div>
  )
}
