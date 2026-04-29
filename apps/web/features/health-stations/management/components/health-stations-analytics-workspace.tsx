"use client"

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import { MapboxOverlay } from '@deck.gl/mapbox'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { Building2Icon, MapIcon, XIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { GisMapPopup } from '@/features/gis-map/components/gis-map-popup'
import { GisMapShell } from '@/features/gis-map/components/gis-map-shell'
import type { GisMapPopupState } from '@/features/gis-map/data/types'
import { toRegistryFeatureCollection } from '@/features/health-stations/city-barangay-registry/data/geojson'
import type { CityBarangayRegistryRecord } from '@/features/health-stations/city-barangay-registry/data/schema'
import { cn } from '@/lib/utils'
import { buildStationPinViews, toStationPointFeatureCollection, type StationPinView } from '../../pin-map/data'
import { buildMockHeatmapPoints, type HealthStationsHeatmapPoint, type HeatmapSignalLevel } from '../data/mock-heatmap'
import { getFacilityTypeLabel, getPinStatusLabel } from '../data/options'
import type { ManagementRouteContext } from '../data/route-context'
import { getStationEditPath } from '../data/route-context'
import type { HealthStation } from '../data/schema'

type HealthStationsAnalyticsWorkspaceProps = {
  stations: HealthStation[]
  registryRecords: CityBarangayRegistryRecord[]
  routeContext: ManagementRouteContext
}

type HeatFilter = 'all' | HeatmapSignalLevel

type FocusOption = {
  value: string
  label: string
  description: string
  type: 'station' | 'barangay'
  stationId?: string
  barangayId?: string
}

type AnalyticsMapPopup =
  | {
      type: 'barangay'
      popup: GisMapPopupState
      barangay: CityBarangayRegistryRecord
      stationView: StationPinView | null
    }
  | {
      type: 'station'
      popup: GisMapPopupState
      stationView: StationPinView
      barangay: CityBarangayRegistryRecord | null
    }

export function HealthStationsAnalyticsWorkspace({
  stations,
  registryRecords,
  routeContext,
}: HealthStationsAnalyticsWorkspaceProps) {
  const scopedRegistryRecords = useMemo(
    () => {
      const scoped = registryRecords.filter((record) => record.inCho2Scope)
      return scoped.length ? scoped : registryRecords
    },
    [registryRecords]
  )
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    () => stations[0]?.id ?? null
  )
  const [selectedBarangayId, setSelectedBarangayId] = useState<string | null>(null)
  const [focusValue, setFocusValue] = useState('')
  const [heatFilter, setHeatFilter] = useState<HeatFilter>('all')
  const [mapPopup, setMapPopup] = useState<AnalyticsMapPopup | null>(null)

  const pinViews = useMemo(
    () => buildStationPinViews(stations, scopedRegistryRecords),
    [scopedRegistryRecords, stations]
  )
  const selectedView = useMemo(
    () => pinViews.find((view) => view.id === selectedStationId) ?? null,
    [pinViews, selectedStationId]
  )
  const selectedBarangay = useMemo(() => {
    if (selectedBarangayId) {
      return (
        scopedRegistryRecords.find((record) => record.id === selectedBarangayId) ??
        null
      )
    }

    return selectedView?.physicalBarangay ?? null
  }, [scopedRegistryRecords, selectedBarangayId, selectedView])

  const allHeatPoints = useMemo(
    () => buildMockHeatmapPoints(stations, scopedRegistryRecords),
    [scopedRegistryRecords, stations]
  )
  const visibleHeatPoints = useMemo(
    () =>
      heatFilter === 'all'
        ? allHeatPoints
        : allHeatPoints.filter((point) => point.level === heatFilter),
    [allHeatPoints, heatFilter]
  )

  const boundaryCollection = useMemo(
    () => toRegistryFeatureCollection(scopedRegistryRecords),
    [scopedRegistryRecords]
  )
  const pointCollection = useMemo(
    () => toStationPointFeatureCollection(pinViews),
    [pinViews]
  )
  const focusOptions = useMemo(
    () => buildFocusOptions(pinViews, scopedRegistryRecords),
    [pinViews, scopedRegistryRecords]
  )
  const focusOptionsByValue = useMemo(
    () => new Map(focusOptions.map((option) => [option.value, option])),
    [focusOptions]
  )

  const pointCounts = useMemo(
    () => ({
      critical: allHeatPoints.filter((point) => point.level === 'critical').length,
      elevated: allHeatPoints.filter((point) => point.level === 'elevated').length,
      watch: allHeatPoints.filter((point) => point.level === 'watch').length,
    }),
    [allHeatPoints]
  )

  const selectedBarangayPoints = useMemo(
    () =>
      selectedBarangay
        ? allHeatPoints.filter((point) => point.barangayId === selectedBarangay.id)
        : [],
    [allHeatPoints, selectedBarangay]
  )
  const selectedStationPoints = useMemo(
    () =>
      selectedView
        ? allHeatPoints.filter((point) => point.stationId === selectedView.station.id)
        : [],
    [allHeatPoints, selectedView]
  )
  const selectedPointId = selectedView?.id ?? null
  const peakWeight = visibleHeatPoints.reduce(
    (highest, point) => Math.max(highest, point.weight),
    0
  )

  function handleFocusChange(value: string | null) {
    const nextValue = value ?? ''
    setFocusValue(nextValue)

    const option = focusOptionsByValue.get(nextValue)
    if (!option) return

    if (option.type === 'station' && option.stationId) {
      const view = pinViews.find((item) => item.id === option.stationId)
      setSelectedStationId(option.stationId)
      setSelectedBarangayId(view?.physicalBarangay?.id ?? null)
      setMapPopup(null)
      return
    }

    if (option.type === 'barangay' && option.barangayId) {
      const barangay = scopedRegistryRecords.find(
        (record) => record.id === option.barangayId
      )
      const view = barangay
        ? pinViews.find((item) => item.station.physicalBarangayPcode === barangay.pcode)
        : null

      setSelectedBarangayId(option.barangayId)
      setSelectedStationId(view?.id ?? null)
      setMapPopup(null)
    }
  }

  function handleBoundaryFocus(id: string, popup: GisMapPopupState) {
    const barangay = scopedRegistryRecords.find((record) => record.id === id)
    if (!barangay) return

    const view = pinViews.find(
      (item) => item.station.physicalBarangayPcode === barangay.pcode
    )

    setSelectedBarangayId(id)
    setSelectedStationId(view?.id ?? null)
    setFocusValue('')
    setMapPopup({
      type: 'barangay',
      popup,
      barangay,
      stationView: view ?? null,
    })
  }

  function handlePointFocus(id: string, popup: GisMapPopupState) {
    const view = pinViews.find((item) => item.id === id)
    if (!view) return

    setSelectedStationId(id)
    setSelectedBarangayId(view.physicalBarangay?.id ?? null)
    setFocusValue('')
    setMapPopup({
      type: 'station',
      popup,
      stationView: view,
      barangay: view.physicalBarangay,
    })
  }

  return (
    <section className='grid gap-4 lg:h-[calc(100dvh-13rem)] lg:min-h-[520px] lg:grid-cols-[minmax(17rem,20%)_minmax(0,1fr)]'>
      <aside className='flex min-h-0 flex-col gap-3 overflow-hidden rounded-lg border bg-card p-4'>
        <div className='flex flex-col gap-3'>
          <div>
            <h2 className='font-heading text-base font-semibold'>CHO2 Heatmap Summary</h2>
            <p className='text-xs text-muted-foreground'>
              Showcase clustered demand intensity around station coverage.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Badge variant='secondary'>{scopedRegistryRecords.length} CHO2 barangays</Badge>
            <Badge variant='outline'>{pinViews.length} stations</Badge>
            <Badge variant='outline'>{visibleHeatPoints.length} signals</Badge>
            <Badge variant={peakWeight > 1.2 ? 'default' : 'outline'}>
              Peak {peakWeight.toFixed(2)}
            </Badge>
          </div>

          <div className='grid gap-1.5'>
            <span className='text-xs text-muted-foreground'>Find station or barangay</span>
            <Combobox
              items={focusOptions.map((option) => option.value)}
              value={focusValue}
              onValueChange={handleFocusChange}
            >
              <ComboboxInput
                aria-label='Find station or barangay in heatmap'
                className='w-full'
                placeholder='Search station or barangay'
                showClear
              />
              <ComboboxContent>
                <ComboboxEmpty>No matching station or barangay.</ComboboxEmpty>
                <ComboboxList>
                  {(value) => {
                    const option = focusOptionsByValue.get(value)
                    if (!option) return null

                    return (
                      <ComboboxItem key={option.value} value={option.value}>
                        <div className='flex min-w-0 flex-col'>
                          <span className='truncate'>{option.label}</span>
                          <span className='truncate text-xs text-muted-foreground'>
                            {option.description}
                          </span>
                        </div>
                      </ComboboxItem>
                    )
                  }}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className='grid gap-1.5'>
            <span className='text-xs text-muted-foreground'>Visible heat signals</span>
            <ToggleGroup
              aria-label='Filter visible heatmap intensity bands'
              className='w-full'
              onValueChange={(value) => {
                if (value) setHeatFilter(value as HeatFilter)
              }}
              size='sm'
              type='single'
              value={heatFilter}
              variant='outline'
            >
              <ToggleGroupItem className='flex-1' value='all'>
                All
              </ToggleGroupItem>
              <ToggleGroupItem className='flex-1' value='critical'>
                Critical
              </ToggleGroupItem>
              <ToggleGroupItem className='flex-1' value='elevated'>
                Elevated
              </ToggleGroupItem>
              <ToggleGroupItem className='flex-1' value='watch'>
                Watch
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <Separator />

        <SelectedAnalyticsContext
          barangay={selectedBarangay}
          barangayPoints={selectedBarangayPoints}
          routeContext={routeContext}
          stationPoints={selectedStationPoints}
          stationView={selectedView}
        />

        <div className='mt-auto rounded-md border bg-background p-3'>
          <p className='text-sm font-medium'>Legend</p>
          <div className='mt-2 grid gap-2 text-xs'>
            <HeatLegendRow color='bg-red-500' count={pointCounts.critical} label='Critical hotspots' />
            <HeatLegendRow color='bg-orange-500' count={pointCounts.elevated} label='Elevated hotspots' />
            <HeatLegendRow color='bg-yellow-400' count={pointCounts.watch} label='Watch activity' />
            <HeatLegendRow color='bg-green-500' count={pinViews.length} label='Station coverage anchors' />
          </div>
        </div>
      </aside>

      <div className='h-[520px] min-w-0 overflow-hidden rounded-lg border bg-card lg:h-full lg:min-h-0'>
        <AnalyticsHeatmapMap
          boundaryCollection={boundaryCollection}
          heatPoints={visibleHeatPoints}
          onBoundaryClick={handleBoundaryFocus}
          onMapMoveStart={() => setMapPopup(null)}
          onPointClick={handlePointFocus}
          pointCollection={pointCollection}
          selectedBoundaryId={selectedBarangay?.id ?? null}
          selectedPointId={selectedPointId}
        >
          <GisMapPopup
            onClose={() => setMapPopup(null)}
            popup={mapPopup?.popup ?? null}
            showCloseButton={false}
          >
            {mapPopup ? (
              <AnalyticsPopupContent
                allHeatPoints={allHeatPoints}
                mapPopup={mapPopup}
                onClose={() => setMapPopup(null)}
                routeContext={routeContext}
              />
            ) : null}
          </GisMapPopup>
        </AnalyticsHeatmapMap>
      </div>
    </section>
  )
}

function AnalyticsHeatmapMap({
  boundaryCollection,
  pointCollection,
  selectedBoundaryId,
  selectedPointId,
  heatPoints,
  onBoundaryClick,
  onPointClick,
  onMapMoveStart,
  children,
}: {
  boundaryCollection: ReturnType<typeof toRegistryFeatureCollection>
  pointCollection: ReturnType<typeof toStationPointFeatureCollection>
  selectedBoundaryId: string | null
  selectedPointId: string | null
  heatPoints: HealthStationsHeatmapPoint[]
  onBoundaryClick: (id: string, popup: GisMapPopupState) => void
  onPointClick: (id: string, popup: GisMapPopupState) => void
  onMapMoveStart: () => void
  children: ReactNode
}) {
  const [map, setMap] = useState<MapLibreMap | null>(null)
  const overlayRef = useRef<MapboxOverlay | null>(null)

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
      layers: [
        new HeatmapLayer<HealthStationsHeatmapPoint>({
          id: 'health-stations-management-heatmap',
          data: heatPoints,
          getPosition: (point) => [point.lng, point.lat],
          getWeight: (point) => point.weight,
          aggregation: 'SUM',
          colorRange: [
            [34, 197, 94],
            [163, 230, 53],
            [250, 204, 21],
            [249, 115, 22],
            [239, 68, 68],
          ],
          intensity: 1.2,
          radiusPixels: 48,
          threshold: 0.04,
          opacity: 0.52,
        }),
      ],
    })
  }, [heatPoints])

  return (
    <GisMapShell
      className='h-full min-h-[520px] rounded-none border-0 lg:min-h-0'
      featureCollection={boundaryCollection}
      initialFitScope='boundaries'
      onMapMoveStart={onMapMoveStart}
      onMapReadyChange={setMap}
      onPointClick={onPointClick}
      onPolygonClick={onBoundaryClick}
      pointFeatureCollection={pointCollection}
      previewGeometry={null}
      selectedId={selectedBoundaryId}
      selectedPointId={selectedPointId}
    >
      {children}
    </GisMapShell>
  )
}

function AnalyticsPopupContent({
  mapPopup,
  allHeatPoints,
  onClose,
  routeContext,
}: {
  mapPopup: AnalyticsMapPopup
  allHeatPoints: HealthStationsHeatmapPoint[]
  onClose: () => void
  routeContext: ManagementRouteContext
}) {
  const { barangay, stationView } = mapPopup
  const isStationPopup = mapPopup.type === 'station'
  const stationPoints = stationView
    ? allHeatPoints.filter((point) => point.stationId === stationView.station.id)
    : []
  const barangayPoints = barangay
    ? allHeatPoints.filter((point) => point.barangayId === barangay.id)
    : []
  const metrics = summarizePoints(isStationPopup ? stationPoints : barangayPoints)

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='truncate font-heading text-sm font-semibold'>
            {isStationPopup
              ? stationView?.station.name
              : barangay?.name ?? 'Selected barangay'}
          </h3>
          <p className='mb-2 truncate text-xs text-muted-foreground'>
            {isStationPopup
              ? stationView?.station.physicalBarangayName
              : stationView?.station.name ?? 'No station assigned'}
          </p>
          <Badge variant={isStationPopup ? 'default' : 'secondary'}>
            {isStationPopup ? 'Station hotspot profile' : 'Barangay hotspot profile'}
          </Badge>
        </div>
        <Button
          aria-label='Close analytics popup'
          onClick={onClose}
          size='icon'
          type='button'
          variant='ghost'
        >
          <XIcon />
        </Button>
      </div>

      <Separator />

      <div className='grid gap-2 text-xs'>
        <InfoRow label='Signals' value={String(metrics.count)} />
        <InfoRow label='Peak intensity' value={metrics.peak.toFixed(2)} />
        <InfoRow label='Critical count' value={String(metrics.critical)} />
        <InfoRow label='Average weight' value={metrics.average.toFixed(2)} />
      </div>

      {stationView && routeContext.canManage ? (
        <Button asChild className='w-full' size='sm'>
          <Link href={getStationEditPath(routeContext, stationView.station.id)}>
            Open Edit Form
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

function SelectedAnalyticsContext({
  barangay,
  barangayPoints,
  stationView,
  stationPoints,
  routeContext,
}: {
  barangay: CityBarangayRegistryRecord | null
  barangayPoints: HealthStationsHeatmapPoint[]
  stationView: StationPinView | null
  stationPoints: HealthStationsHeatmapPoint[]
  routeContext: ManagementRouteContext
}) {
  const stationMetrics = summarizePoints(stationPoints)
  const barangayMetrics = summarizePoints(barangayPoints)

  return (
    <div className='rounded-md border bg-background p-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='font-heading text-sm font-semibold'>Selected Context</h3>
          <p className='truncate text-xs text-muted-foreground'>
            {barangay?.name ?? 'No barangay selected'}
          </p>
        </div>
        {stationView ? (
          <Badge variant={stationView.station.pinStatus === 'pinned' ? 'default' : 'outline'}>
            {getPinStatusLabel(stationView.station.pinStatus)}
          </Badge>
        ) : null}
      </div>

      <Separator className='my-3' />

      <div className='grid gap-3 text-xs'>
        <div className='grid gap-1.5'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <Building2Icon className='size-4 text-muted-foreground' />
            <span className='truncate'>Health Station</span>
          </div>
          {stationView ? (
            <>
              <InfoRow label='Name' value={stationView.station.name} />
              <InfoRow
                label='Type'
                value={getFacilityTypeLabel(stationView.station.facilityType)}
              />
              <InfoRow label='Signals' value={String(stationMetrics.count)} />
              <InfoRow label='Peak' value={stationMetrics.peak.toFixed(2)} />
            </>
          ) : (
            <p className='text-muted-foreground'>No station assigned to this boundary.</p>
          )}
        </div>

        <Separator />

        <div className='grid gap-1.5'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <MapIcon className='size-4 text-muted-foreground' />
            <span className='truncate'>Barangay Heat Profile</span>
          </div>
          {barangay ? (
            <>
              <InfoRow label='Name' value={barangay.name} />
              <InfoRow label='PSGC' value={barangay.pcode} />
              <InfoRow label='Signals' value={String(barangayMetrics.count)} />
              <InfoRow label='Peak' value={barangayMetrics.peak.toFixed(2)} />
            </>
          ) : (
            <p className='text-muted-foreground'>
              Select a boundary or station to inspect hotspot density.
            </p>
          )}
        </div>
      </div>

      {stationView && routeContext.canManage ? (
        <Button asChild className='mt-3 w-full' size='sm'>
          <Link href={getStationEditPath(routeContext, stationView.station.id)}>
            Open Edit Form
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

function buildFocusOptions(
  pinViews: StationPinView[],
  barangays: CityBarangayRegistryRecord[]
) {
  const stationOptions: FocusOption[] = pinViews.map((view) => ({
    value: `${view.station.name} (${view.station.stationCode})`,
    label: view.station.name,
    description: `${view.station.physicalBarangayName} - ${view.station.pinStatus}`,
    type: 'station',
    stationId: view.id,
    barangayId: view.physicalBarangay?.id ?? undefined,
  }))

  const barangayOptions: FocusOption[] = barangays.map((barangay) => ({
    value: `Barangay ${barangay.name}`,
    label: barangay.name,
    description: `${barangay.pcode} - CHO2 hotspot zone`,
    type: 'barangay',
    barangayId: barangay.id,
  }))

  return [...stationOptions, ...barangayOptions].sort((left, right) =>
    left.label.localeCompare(right.label)
  )
}

function summarizePoints(points: HealthStationsHeatmapPoint[]) {
  if (!points.length) {
    return {
      count: 0,
      peak: 0,
      average: 0,
      critical: 0,
    }
  }

  const totalWeight = points.reduce((sum, point) => sum + point.weight, 0)

  return {
    count: points.length,
    peak: points.reduce((max, point) => Math.max(max, point.weight), 0),
    average: totalWeight / points.length,
    critical: points.filter((point) => point.level === 'critical').length,
  }
}

function HeatLegendRow({
  label,
  color,
  count,
}: {
  label: string
  color: string
  count: number
}) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <div className='flex items-center gap-2'>
        <span className={cn('size-2.5 rounded-full', color)} />
        <span className='text-muted-foreground'>{label}</span>
      </div>
      <span className='font-medium'>{count}</span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-start justify-between gap-3'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-right font-medium'>{value}</span>
    </div>
  )
}
