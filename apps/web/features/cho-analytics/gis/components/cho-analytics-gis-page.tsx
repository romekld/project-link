'use client'

import { useState } from 'react'

import { ChoAnalyticsMap } from './cho-analytics-map'
import { ChoAnalyticsToolbar } from './cho-analytics-toolbar'
import type {
  ChoAnalyticsGisData,
  ChoOverlayKey,
  ChoTimeWindow,
} from '../data/schema'

type OverlayState = Record<ChoOverlayKey, boolean>

const DEFAULT_OVERLAYS: OverlayState = {
  choropleth: true,
  heatmap: true,
  stations: true,
}

type ChoAnalyticsGisPageProps = {
  data: ChoAnalyticsGisData
}

export function ChoAnalyticsGisPage({ data }: ChoAnalyticsGisPageProps) {
  const [timeWindow, setTimeWindow] = useState<ChoTimeWindow>(data.defaultTimeWindow)
  const [fitKey, setFitKey] = useState(0)
  const [overlays, setOverlays] = useState<OverlayState>(DEFAULT_OVERLAYS)
  const [selectedBarangayId, setSelectedBarangayId] = useState<string | null>(
    data.windows[data.defaultTimeWindow].topBarangays[0]?.cityBarangayId ?? null
  )
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)

  const activeWindow = data.windows[timeWindow]

  return (
    <section className='flex min-h-full flex-1 flex-col bg-background'>
      <ChoAnalyticsToolbar
        kpis={activeWindow.kpis}
        onResetView={() => setFitKey((current) => current + 1)}
        onTimeWindowChange={(nextWindow) => {
          setTimeWindow(nextWindow)
          setSelectedBarangayId(
            data.windows[nextWindow].topBarangays[0]?.cityBarangayId ?? null
          )
          setSelectedStationId(null)
        }}
        onToggleOverlay={(overlay) =>
          setOverlays((current) => ({
            ...current,
            [overlay]: !current[overlay],
          }))
        }
        overlays={overlays}
        timeWindow={timeWindow}
      />

      <ChoAnalyticsMap
        data={data}
        fitKey={fitKey}
        onSelectBarangay={(barangayId) => {
          setSelectedBarangayId(barangayId)
          setSelectedStationId(null)
        }}
        onSelectStation={(stationId) => {
          setSelectedStationId(stationId)
          setSelectedBarangayId(null)
        }}
        overlays={overlays}
        selectedBarangayId={selectedBarangayId}
        selectedStationId={selectedStationId}
        timeWindow={timeWindow}
      />
    </section>
  )
}
