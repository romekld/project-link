import { getChoAnalyticsGisData } from '@/features/cho-analytics/gis/queries'

export default async function ChoAnalyticsGisPage() {
  const data = await getChoAnalyticsGisData()
  const defaultWindow = data.windows[data.defaultTimeWindow]

  return (
    <section className="flex min-h-full flex-1 flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b px-4 py-3 md:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            CHO Analytics GIS
          </p>
          <h1 className="text-lg font-semibold text-foreground">
            GIS dataset scaffold
          </h1>
        </div>

        <div className="flex min-h-0 flex-1 bg-muted/20 p-4 md:p-6">
          <div className="relative flex min-h-[24rem] flex-1 overflow-hidden rounded-xl border border-dashed border-border bg-gradient-to-br from-background via-background to-muted/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0,transparent_38%),linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[length:auto,2.5rem_2.5rem,2.5rem_2.5rem] opacity-50" />
            <div className="relative flex flex-1 items-center justify-center px-6 text-center">
              <div className="max-w-md space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Real geography + typed mock analytics
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  CHO GIS data contract is wired
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  The route now loads real city barangay geometry and active
                  health-station points, then layers deterministic mock
                  analytics on top for the future choropleth, heatmap, and
                  right-rail views.
                </p>
                <dl className="grid grid-cols-2 gap-3 rounded-xl border bg-background/80 p-4 text-left text-sm">
                  <div>
                    <dt className="text-muted-foreground">Barangays</dt>
                    <dd className="font-semibold text-foreground">
                      {data.barangays.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Stations</dt>
                    <dd className="font-semibold text-foreground">
                      {data.stationPoints.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">30-day cases</dt>
                    <dd className="font-semibold text-foreground">
                      {defaultWindow.kpis.totalCases}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Alerts</dt>
                    <dd className="font-semibold text-foreground">
                      {defaultWindow.alerts.length}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
