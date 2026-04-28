'use client'

import { useMemo, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { ChoAnalyticsMap } from './cho-analytics-map'
import { ChoAnalyticsRail } from './cho-analytics-rail'
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
  const [isRailOpen, setIsRailOpen] = useState(false)
  const [overlays, setOverlays] = useState<OverlayState>(DEFAULT_OVERLAYS)
  const [selectedBarangayId, setSelectedBarangayId] = useState<string | null>(
    data.windows[data.defaultTimeWindow].topBarangays[0]?.cityBarangayId ?? null
  )
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)

  const activeWindow = data.windows[timeWindow]
  const selectedBarangay = useMemo(
    () => data.barangays.find((barangay) => barangay.id === selectedBarangayId) ?? null,
    [data.barangays, selectedBarangayId]
  )
  const selectedStation = useMemo(
    () => data.stationPoints.find((station) => station.id === selectedStationId) ?? null,
    [data.stationPoints, selectedStationId]
  )

  return (
    <section className='flex min-h-full flex-1 flex-col bg-background'>
      <ChoAnalyticsToolbar
        kpis={activeWindow.kpis}
        onOpenRail={() => setIsRailOpen(true)}
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

      <div className='min-h-0 flex-1 xl:grid xl:grid-cols-[minmax(0,1fr)_24rem]'>
        <div className='min-h-0 min-w-0'>
          <ChoAnalyticsMap
            data={data}
            fitKey={fitKey}
            onSelectBarangay={(barangayId) => {
              setSelectedBarangayId(barangayId)
              setSelectedStationId(null)
            }}
            onSelectStation={(stationId) => {
              const station =
                data.stationPoints.find((entry) => entry.id === stationId) ?? null
              const relatedBarangay =
                data.barangays.find(
                  (barangay) =>
                    barangay.pcode === station?.physicalBarangayPcode
                ) ?? null

              setSelectedStationId(stationId)
              setSelectedBarangayId(relatedBarangay?.id ?? null)
            }}
            overlays={overlays}
            selectedBarangayId={selectedBarangayId}
            selectedStationId={selectedStationId}
            timeWindow={timeWindow}
          />
        </div>

        <aside className='hidden min-h-0 border-l xl:flex xl:flex-col'>
          <ChoAnalyticsRail
            selectedBarangay={selectedBarangay}
            selectedStation={selectedStation}
            stationPoints={data.stationPoints}
            timeWindow={timeWindow}
            windowData={activeWindow}
          />
        </aside>
      </div>

      <Sheet onOpenChange={setIsRailOpen} open={isRailOpen}>
        <SheetContent className='w-full max-w-md p-0' side='right'>
          <SheetHeader className='border-b'>
            <SheetTitle>Analytics panel</SheetTitle>
          </SheetHeader>
          <ChoAnalyticsRail
            selectedBarangay={selectedBarangay}
            selectedStation={selectedStation}
            stationPoints={data.stationPoints}
            timeWindow={timeWindow}
            windowData={activeWindow}
          />
        </SheetContent>
      </Sheet>
    </section>
  )
}
