import type {
  ChoAnalyticsGisData,
  ChoAnalyticsWindowData,
  ChoStationPoint,
  ChoTimeWindow,
} from '../data/schema'
import { RailAlertFeed } from './rail-alert-feed'
import { RailCharts } from './rail-charts'
import { RailDrilldown } from './rail-drilldown'
import { RailKpis } from './rail-kpis'

type ChoAnalyticsRailProps = {
  selectedBarangay: ChoAnalyticsGisData['barangays'][number] | null
  selectedStation: ChoStationPoint | null
  stationPoints: ChoStationPoint[]
  timeWindow: ChoTimeWindow
  windowData: ChoAnalyticsWindowData
}

export function ChoAnalyticsRail({
  selectedBarangay,
  selectedStation,
  stationPoints,
  timeWindow,
  windowData,
}: ChoAnalyticsRailProps) {
  return (
    <div className='flex h-full min-h-0 flex-col overflow-y-auto bg-muted/10'>
      <div className='space-y-4 p-4 md:p-5'>
        <RailKpis kpis={windowData.kpis} />
        <RailCharts windowData={windowData} />
        <RailDrilldown
          selectedBarangay={selectedBarangay}
          selectedStation={selectedStation}
          stationPoints={stationPoints}
          timeWindow={timeWindow}
        />
        <RailAlertFeed alerts={windowData.alerts} />
      </div>
    </div>
  )
}
