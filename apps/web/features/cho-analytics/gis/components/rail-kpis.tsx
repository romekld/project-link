import type { ChoAnalyticsKpis } from '../data/schema'

type RailKpisProps = {
  kpis: ChoAnalyticsKpis
}

export function RailKpis({ kpis }: RailKpisProps) {
  const items = [
    {
      label: 'Total cases',
      value: kpis.totalCases.toLocaleString(),
    },
    {
      label: 'Active alerts',
      value: kpis.activeAlerts.toLocaleString(),
    },
    {
      label: 'Hotspots',
      value: kpis.hotspotBarangays.toLocaleString(),
    },
    {
      label: 'Stations',
      value: kpis.reportingStations.toLocaleString(),
    },
  ]

  return (
    <div className='grid grid-cols-2 gap-3'>
      {items.map((item) => (
        <div
          key={item.label}
          className='rounded-xl border bg-background px-4 py-3 shadow-sm'
        >
          <p className='text-xs uppercase tracking-[0.14em] text-muted-foreground'>
            {item.label}
          </p>
          <p className='mt-2 text-2xl font-semibold text-foreground'>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
