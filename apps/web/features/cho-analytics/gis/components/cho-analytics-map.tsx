'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import { MapboxOverlay } from '@deck.gl/mapbox'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { GisMapPopup } from '@/features/gis-map/components/gis-map-popup'
import { GisMapShell } from '@/features/gis-map/components/gis-map-shell'
import type { GisMapPopupState } from '@/features/gis-map/data/types'
import { MapPinIcon, XIcon } from 'lucide-react'

import {
  toChoAnalyticsPolygonFeatureCollection,
  toChoAnalyticsStationPointFeatureCollection,
} from '../data/geojson'
import type {
  ChoAnalyticsGisData,
  ChoOverlayKey,
  ChoStationPoint,
  ChoTimeWindow,
} from '../data/schema'

type OverlayState = Record<ChoOverlayKey, boolean>

type ChoAnalyticsMapProps = {
  data: ChoAnalyticsGisData
  timeWindow: ChoTimeWindow
  overlays: OverlayState
  fitKey: number
  selectedBarangayId: string | null
  selectedStationId: string | null
  onSelectBarangay: (barangayId: string) => void
  onSelectStation: (stationId: string) => void
}

type PopupState =
  | {
      kind: 'barangay'
      popup: GisMapPopupState
      targetId: string
    }
  | {
      kind: 'station'
      popup: GisMapPopupState
      targetId: string
    }

export function ChoAnalyticsMap({
  data,
  timeWindow,
  overlays,
  fitKey,
  selectedBarangayId,
  selectedStationId,
  onSelectBarangay,
  onSelectStation,
}: ChoAnalyticsMapProps) {
  const [popupState, setPopupState] = useState<PopupState | null>(null)
  const [map, setMap] = useState<MapLibreMap | null>(null)
  const overlayRef = useRef<MapboxOverlay | null>(null)

  const activeWindow = data.windows[timeWindow]
  const selectedBarangay = useMemo(
    () => data.barangays.find((barangay) => barangay.id === selectedBarangayId) ?? null,
    [data.barangays, selectedBarangayId]
  )
  const selectedStation = useMemo(
    () => data.stationPoints.find((station) => station.id === selectedStationId) ?? null,
    [data.stationPoints, selectedStationId]
  )
  const popupBarangay =
    popupState?.kind === 'barangay'
      ? data.barangays.find((barangay) => barangay.id === popupState.targetId) ?? null
      : null
  const popupStation =
    popupState?.kind === 'station'
      ? data.stationPoints.find((station) => station.id === popupState.targetId) ?? null
      : null

  const polygonFeatures = useMemo(
    () =>
      toChoAnalyticsPolygonFeatureCollection(
        data.barangays,
        timeWindow,
        overlays.choropleth
      ),
    [data.barangays, overlays.choropleth, timeWindow]
  )

  const pointFeatures = useMemo(
    () =>
      overlays.stations
        ? toChoAnalyticsStationPointFeatureCollection(data.stationPoints)
        : null,
    [data.stationPoints, overlays.stations]
  )

  useEffect(() => {
    if (!map || overlayRef.current) return

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: [],
    })

    map.addControl(overlay)
    overlayRef.current = overlay

    return () => {
      if (map && overlayRef.current) {
        map.removeControl(overlayRef.current)
      }
      overlayRef.current = null
    }
  }, [map])

  useEffect(() => {
    if (!overlayRef.current) return

    overlayRef.current.setProps({
      layers: overlays.heatmap
        ? [
            new HeatmapLayer({
              id: `cho-analytics-heatmap-${timeWindow}`,
              data: activeWindow.heatPoints,
              getPosition: (point) => [point.lng, point.lat],
              getWeight: (point) => point.weight,
              radiusPixels: 55,
              intensity: 1,
              threshold: 0.03,
              opacity: 0.58,
            }),
          ]
        : [],
    })
  }, [activeWindow.heatPoints, overlays.heatmap, timeWindow])

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden bg-background'>
      <div className='flex min-h-0 flex-1'>
        <GisMapShell
          className='flex-1 rounded-none border-0 bg-transparent'
          featureCollection={polygonFeatures}
          fitKey={fitKey}
          onMapMoveStart={() => setPopupState(null)}
          onMapReadyChange={setMap}
          onPointClick={(id, popup) => {
            onSelectStation(id)
            setPopupState({
              kind: 'station',
              popup,
              targetId: id,
            })
          }}
          onPolygonClick={(id, popup) => {
            onSelectBarangay(id)
            setPopupState({
              kind: 'barangay',
              popup,
              targetId: id,
            })
          }}
          pointFeatureCollection={pointFeatures}
          previewGeometry={null}
          selectedId={selectedBarangay?.id ?? null}
          selectedPointId={overlays.stations ? selectedStation?.id ?? null : null}
        >
          <GisMapPopup
            onClose={() => setPopupState(null)}
            popup={popupState?.popup ?? null}
            showCloseButton={false}
          >
            {popupBarangay ? (
              <BarangayPopupContent
                alertCount={popupBarangay.analyticsByWindow[timeWindow].alertCount}
                burdenScore={popupBarangay.analyticsByWindow[timeWindow].burdenScore}
                caseCount={popupBarangay.analyticsByWindow[timeWindow].caseCount}
                onClose={() => setPopupState(null)}
                pcode={popupBarangay.pcode}
                rank={popupBarangay.analyticsByWindow[timeWindow].rank}
                title={popupBarangay.name}
              />
            ) : popupStation ? (
              <StationPopupContent
                onClose={() => setPopupState(null)}
                station={popupStation}
              />
            ) : null}
          </GisMapPopup>
        </GisMapShell>
      </div>
    </div>
  )
}

function BarangayPopupContent({
  title,
  pcode,
  caseCount,
  burdenScore,
  alertCount,
  rank,
  onClose,
}: {
  title: string
  pcode: string
  caseCount: number
  burdenScore: number
  alertCount: number
  rank: number
  onClose: () => void
}) {
  return (
    <div className='flex min-w-[17rem] flex-col gap-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='truncate font-medium text-foreground'>{title}</p>
          <p className='mt-1 font-mono text-xs text-muted-foreground'>
            {pcode}
          </p>
        </div>
        <Button
          aria-label='Close analytics map popup'
          onClick={onClose}
          size='icon'
          variant='ghost'
        >
          <XIcon />
        </Button>
      </div>

      <div className='flex flex-wrap gap-2'>
        <Badge>Rank #{rank}</Badge>
        <Badge variant='outline'>{alertCount} alerts</Badge>
      </div>

      <Separator />

      <dl className='grid grid-cols-3 gap-3 text-xs'>
        <div>
          <dt className='text-muted-foreground'>Cases</dt>
          <dd className='font-semibold text-foreground'>
            {caseCount.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className='text-muted-foreground'>Burden</dt>
          <dd className='font-semibold text-foreground'>
            {burdenScore.toFixed(1)}
          </dd>
        </div>
        <div>
          <dt className='text-muted-foreground'>Alerts</dt>
          <dd className='font-semibold text-foreground'>
            {alertCount.toLocaleString()}
          </dd>
        </div>
      </dl>
    </div>
  )
}

function StationPopupContent({
  station,
  onClose,
}: {
  station: ChoStationPoint
  onClose: () => void
}) {
  return (
    <div className='flex min-w-[17rem] flex-col gap-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='truncate font-medium text-foreground'>{station.name}</p>
          <p className='mt-1 font-mono text-xs text-muted-foreground'>
            {station.stationCode}
          </p>
        </div>
        <Button
          aria-label='Close station popup'
          onClick={onClose}
          size='icon'
          variant='ghost'
        >
          <XIcon />
        </Button>
      </div>

      <div className='flex flex-wrap gap-2'>
        <Badge className='capitalize'>{station.facilityType.replace('_', ' ')}</Badge>
        <Badge variant='outline' className='capitalize'>
          {station.source}
        </Badge>
      </div>

      <Separator />

      <div className='space-y-1 text-xs'>
        <p className='text-muted-foreground'>Physical barangay</p>
        <p className='font-medium text-foreground'>{station.physicalBarangayName}</p>
      </div>

      <div className='flex items-center gap-2 rounded-lg border bg-background/70 px-3 py-2 text-xs text-muted-foreground'>
        <MapPinIcon className='size-4 text-foreground' />
        {station.coordinates.lat.toFixed(5)}, {station.coordinates.lng.toFixed(5)}
      </div>
    </div>
  )
}
