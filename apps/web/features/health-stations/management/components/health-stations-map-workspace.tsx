"use client"

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Building2Icon,
  MapIcon,
  MapPinCheckIcon,
  MapPinIcon,
  XIcon,
} from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { GisMapPopup } from '@/features/gis-map/components/gis-map-popup'
import { toRegistryFeatureCollection } from '@/features/health-stations/city-barangay-registry/data/geojson'
import type { CityBarangayRegistryRecord } from '@/features/health-stations/city-barangay-registry/data/schema'
import type { GisMapPopupState } from '@/features/gis-map/data/types'
import {
  buildStationPinViews,
  toStationPointFeatureCollection,
  type StationPinView,
} from '../../pin-map/data'
import { StationPinMap } from '../../pin-map/components/station-pin-map'
import { getFacilityTypeLabel, getPinStatusLabel } from '../data/options'
import type { HealthStation } from '../data/schema'

type HealthStationsMapWorkspaceProps = {
  stations: HealthStation[]
  registryRecords: CityBarangayRegistryRecord[]
}

type QuickPinFilter = 'all' | 'needs_review' | 'pinned'

type FocusOption = {
  value: string
  label: string
  description: string
  type: 'station' | 'barangay'
  stationId?: string
  barangayId?: string
}

type StationMapPopup =
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

export function HealthStationsMapWorkspace({
  stations,
  registryRecords,
}: HealthStationsMapWorkspaceProps) {
  const scopedRegistryRecords = useMemo(
    () => registryRecords.filter((record) => record.inCho2Scope),
    [registryRecords]
  )
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    () => stations[0]?.id ?? null
  )
  const [selectedBarangayId, setSelectedBarangayId] = useState<string | null>(null)
  const [focusValue, setFocusValue] = useState('')
  const [quickFilter, setQuickFilter] = useState<QuickPinFilter>('all')
  const [mapPopup, setMapPopup] = useState<StationMapPopup | null>(null)

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

  const visibleViews = useMemo(
    () =>
      pinViews.filter((view) => {
        if (quickFilter === 'pinned') return view.station.pinStatus === 'pinned'
        if (quickFilter === 'needs_review') return view.station.pinStatus !== 'pinned'
        return true
      }),
    [pinViews, quickFilter]
  )

  const boundaryCollection = useMemo(
    () => toRegistryFeatureCollection(scopedRegistryRecords),
    [scopedRegistryRecords]
  )

  const pointCollection = useMemo(
    () => toStationPointFeatureCollection(visibleViews),
    [visibleViews]
  )

  const focusOptions = useMemo(
    () => buildFocusOptions(pinViews, scopedRegistryRecords),
    [pinViews, scopedRegistryRecords]
  )

  const focusOptionsByValue = useMemo(
    () => new Map(focusOptions.map((option) => [option.value, option])),
    [focusOptions]
  )

  const totalPins = pinViews.filter((view) => view.station.pinStatus === 'pinned').length
  const needsReview = pinViews.length - totalPins
  const selectedPointId = visibleViews.some((view) => view.id === selectedView?.id)
    ? selectedView?.id ?? null
    : null

  function handleFocusChange(value: string | null) {
    const nextValue = value ?? ''
    setFocusValue(nextValue)

    const option = focusOptionsByValue.get(nextValue)
    if (!option) return

    setQuickFilter('all')

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
    setSelectedBarangayId(view?.physicalBarangay?.id ?? null)
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
            <h2 className='font-heading text-base font-semibold'>CHO2 Map Summary</h2>
            <p className='text-xs text-muted-foreground'>
              Focus boundaries and station pins at a glance.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Badge variant='secondary'>{scopedRegistryRecords.length} CHO2 barangays</Badge>
            <Badge variant='outline'>{pinViews.length} stations</Badge>
            <Badge variant='outline'>{totalPins} pinned</Badge>
            <Badge variant={needsReview ? 'outline' : 'default'}>{needsReview} review</Badge>
          </div>

          <div className='grid gap-1.5'>
            <span className='text-xs text-muted-foreground'>Find station or barangay</span>
            <Combobox
              items={focusOptions.map((option) => option.value)}
              value={focusValue}
              onValueChange={handleFocusChange}
            >
              <ComboboxInput
                aria-label='Find station or barangay on map'
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
            <span className='text-xs text-muted-foreground'>Visible pins</span>
            <ToggleGroup
              aria-label='Filter visible health station pins'
              className='w-full'
              onValueChange={(value) => {
                if (value) setQuickFilter(value as QuickPinFilter)
              }}
              size='sm'
              type='single'
              value={quickFilter}
              variant='outline'
            >
              <ToggleGroupItem aria-label='Show all pins' className='flex-1' value='all'>
                All
              </ToggleGroupItem>
              <ToggleGroupItem
                aria-label='Show pins that need review'
                className='flex-1'
                value='needs_review'
              >
                Review
              </ToggleGroupItem>
              <ToggleGroupItem
                aria-label='Show pinned stations'
                className='flex-1'
                value='pinned'
              >
                Pinned
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <Separator />

        <SelectedMapContext
          barangay={selectedBarangay}
          stationView={selectedView}
        />

        <div className='mt-auto rounded-md border bg-background p-3'>
          <p className='text-sm font-medium'>Legend</p>
          <div className='mt-2 grid gap-2 text-xs'>
            <LegendRow label='Pinned' tone='default' />
            <LegendRow label='Needs review' tone='outline' />
            <LegendRow label='Selected boundary' tone='secondary' />
          </div>
        </div>
      </aside>

      <div className='h-[520px] min-w-0 overflow-hidden rounded-lg border bg-card lg:h-full lg:min-h-0'>
        <StationPinMap
          boundaryCollection={boundaryCollection}
          className='h-full min-h-[520px] rounded-none border-0 lg:min-h-0'
          initialFitScope='boundaries'
          onBoundaryClick={(id, popup) => {
            handleBoundaryFocus(id, popup)
          }}
          onMapMoveStart={() => {
            setMapPopup(null)
          }}
          onPointClick={(id, popup) => {
            handlePointFocus(id, popup)
          }}
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
              <StationMapPopupContent
                mapPopup={mapPopup}
                onClose={() => setMapPopup(null)}
              />
            ) : null}
          </GisMapPopup>
        </StationPinMap>
      </div>
    </section>
  )
}

function StationMapPopupContent({
  mapPopup,
  onClose,
}: {
  mapPopup: StationMapPopup
  onClose: () => void
}) {
  const { popup, barangay, stationView } = mapPopup
  const isStationPopup = mapPopup.type === 'station'

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>

          <h3 className='truncate font-heading text-sm font-semibold'>
            {isStationPopup
              ? stationView?.station.name
              : barangay?.name ?? 'Selected barangay'}
          </h3>
          <p className='truncate text-xs text-muted-foreground mb-2'>
            {isStationPopup
              ? stationView?.station.physicalBarangayName
              : stationView?.station.name ?? 'No station assigned'}
          </p>
          <Badge variant={isStationPopup ? 'default' : 'secondary'}>
            {isStationPopup ? 'Health Station' : 'Barangay Boundary'}
          </Badge>
        </div>
        <Button
          aria-label='Close map popup'
          onClick={onClose}
          size='icon'
          type='button'
          variant='ghost'
        >
          <XIcon />
        </Button>
      </div>

      <Separator />

      {isStationPopup && stationView ? (
        <div className='grid gap-2 text-xs'>
          <InfoRow label='Station code' value={stationView.station.stationCode} />
          <InfoRow
            label='Type'
            value={getFacilityTypeLabel(stationView.station.facilityType)}
          />
          <InfoRow
            label='Pin status'
            value={getPinStatusLabel(stationView.station.pinStatus)}
          />
          <InfoRow
            label='Coordinates'
            value={`${stationView.coordinates.lat.toFixed(5)}, ${stationView.coordinates.lng.toFixed(5)}`}
          />
        </div>
      ) : (
        <div className='grid gap-2 text-xs'>
          <InfoRow label='PSGC' value={barangay?.pcode ?? 'No boundary'} />
          <InfoRow
            label='Area'
            value={barangay ? `${barangay.sourceAreaSqKm.toFixed(2)} sq km` : 'Unknown'}
          />
          <InfoRow
            label='Assigned station'
            value={stationView?.station.name ?? 'No station assigned'}
          />
          <InfoRow
            label='Click point'
            value={`${popup.lngLat.lat.toFixed(5)}, ${popup.lngLat.lng.toFixed(5)}`}
          />
        </div>
      )}

      {stationView ? (
        <Button asChild className='w-full' size='sm'>
          <Link href={`/admin/health-stations/manage/${stationView.station.id}/edit`}>
            Open Edit Form
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

function SelectedMapContext({
  barangay,
  stationView,
}: {
  barangay: CityBarangayRegistryRecord | null
  stationView: StationPinView | null
}) {
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
              <InfoRow
                label='Status'
                value={stationView.station.status === 'active' ? 'Active' : 'Inactive'}
              />
              <InfoRow
                label='Coordinates'
                value={`${stationView.coordinates.lat.toFixed(5)}, ${stationView.coordinates.lng.toFixed(5)}`}
              />
            </>
          ) : (
            <p className='text-muted-foreground'>No station assigned to this boundary.</p>
          )}
        </div>

        <Separator />

        <div className='grid gap-1.5'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <MapIcon className='size-4 text-muted-foreground' />
            <span className='truncate'>Barangay Boundary</span>
          </div>
          {barangay ? (
            <>
              <InfoRow label='Name' value={barangay.name} />
              <InfoRow label='PSGC' value={barangay.pcode} />
              <InfoRow label='Area' value={`${barangay.sourceAreaSqKm.toFixed(2)} sq km`} />
            </>
          ) : (
            <p className='text-muted-foreground'>
              Select a boundary or station to inspect coverage.
            </p>
          )}
        </div>
      </div>

      {stationView ? (
        <Button asChild className='mt-3 w-full' size='sm'>
          <Link href={`/admin/health-stations/manage/${stationView.station.id}/edit`}>
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
    description: `${view.station.physicalBarangayName} · ${getPinStatusLabel(view.station.pinStatus)}`,
    type: 'station',
    stationId: view.id,
    barangayId: view.physicalBarangay?.id ?? undefined,
  }))

  const barangayOptions: FocusOption[] = barangays.map((barangay) => ({
    value: `Barangay ${barangay.name}`,
    label: barangay.name,
    description: `${barangay.pcode} · CHO2 boundary`,
    type: 'barangay',
    barangayId: barangay.id,
  }))

  return [...stationOptions, ...barangayOptions].sort((left, right) =>
    left.label.localeCompare(right.label)
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

function LegendRow({
  label,
  tone,
}: {
  label: string
  tone: 'default' | 'secondary' | 'outline'
}) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <span className='text-muted-foreground'>{label}</span>
      <Badge className={cn(tone === 'default' && 'gap-1')} variant={tone}>
        {tone === 'default' ? <MapPinCheckIcon /> : <MapPinIcon />}
        {label}
      </Badge>
    </div>
  )
}
