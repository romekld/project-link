'use client'

import Link from 'next/link'
import { useMemo, useState, type ComponentType } from 'react'
import {
  Building2Icon,
  CircleDotIcon,
  MapIcon,
  MapPinCheckIcon,
  MapPinIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/page-header'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { toRegistryFeatureCollection } from '@/features/health-stations/city-barangay-registry/data/geojson'
import type { CityBarangayRegistryRecord } from '@/features/health-stations/city-barangay-registry/data/schema'
import type { ManagementRouteContext } from '../../management/data/route-context'
import {
  getStationCreatePath,
  getStationEditPath,
} from '../../management/data/route-context'
import type {
  HealthStation,
  HealthStationFacilityType,
  HealthStationPinStatus,
  HealthStationStatus,
} from '../../management/data/schema'
import { getFacilityTypeLabel, getPinStatusLabel } from '../../management/data/options'
import {
  buildStationPinViews,
  getStationPinCoordinates,
  getStationPinFallbackLabel,
  toStationPointFeatureCollection,
} from '../../pin-map/data'
import { StationPinMap } from '../../pin-map/components/station-pin-map'

type PinsWorkspacePageProps = {
  stations: HealthStation[]
  registryRecords: CityBarangayRegistryRecord[]
  routeContext: ManagementRouteContext
  initialSelectedStationId?: string | null
}

const statusOptions: Array<{ label: string; value: HealthStationStatus | 'all'; icon: typeof ShieldCheckIcon }> = [
  { label: 'All statuses', value: 'all', icon: ShieldIcon },
  { label: 'Active', value: 'active', icon: ShieldCheckIcon },
  { label: 'Inactive', value: 'inactive', icon: ShieldIcon },
]

const pinStatusFilterOptions: Array<{ label: string; value: HealthStationPinStatus | 'all'; icon: typeof MapPinIcon }> = [
  { label: 'All pin states', value: 'all', icon: MapPinIcon },
  { label: 'Pinned', value: 'pinned', icon: MapPinCheckIcon },
  { label: 'Needs pin', value: 'needs_pin', icon: MapPinIcon },
  { label: 'Draft', value: 'draft', icon: CircleDotIcon },
]

const facilityTypeFilterOptions: Array<{ label: string; value: HealthStationFacilityType | 'all'; icon: typeof Building2Icon }> = [
  { label: 'All facility types', value: 'all', icon: Building2Icon },
  { label: 'Barangay Health Station', value: 'bhs', icon: Building2Icon },
  { label: 'Barangay Health Center', value: 'main_bhs', icon: MapIcon },
  { label: 'Satellite Health Station', value: 'satellite', icon: Building2Icon },
]

export function PinsWorkspacePage({
  stations,
  registryRecords,
  routeContext,
  initialSelectedStationId,
}: PinsWorkspacePageProps) {
  const scopedRegistryRecords = useMemo(
    () => registryRecords.filter((record) => record.inCho2Scope),
    [registryRecords]
  )
  const [selectedStationId, setSelectedStationId] = useState(
    initialSelectedStationId ?? stations[0]?.id ?? null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<HealthStationStatus | 'all'>('all')
  const [pinFilter, setPinFilter] = useState<HealthStationPinStatus | 'all'>('all')
  const [facilityFilter, setFacilityFilter] = useState<HealthStationFacilityType | 'all'>('all')

  const pinViews = useMemo(
    () => buildStationPinViews(stations, scopedRegistryRecords),
    [scopedRegistryRecords, stations]
  )

  const boundaryCollection = useMemo(
    () => toRegistryFeatureCollection(scopedRegistryRecords),
    [scopedRegistryRecords]
  )

  const filteredViews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return pinViews.filter((view) => {
      if (statusFilter !== 'all' && view.station.status !== statusFilter) return false
      if (pinFilter !== 'all' && view.station.pinStatus !== pinFilter) return false
      if (facilityFilter !== 'all' && view.station.facilityType !== facilityFilter) return false

      if (!query) return true

      const haystack = [
        view.station.name,
        view.station.stationCode,
        view.station.physicalBarangayName,
        view.station.physicalBarangayPcode,
        getStationPinFallbackLabel(view),
        `${view.coordinates.lat.toFixed(6)}, ${view.coordinates.lng.toFixed(6)}`,
      ]

      return haystack.some((entry) => entry.toLowerCase().includes(query))
    })
  }, [facilityFilter, pinFilter, pinViews, searchQuery, statusFilter])

  const selectedView = useMemo(() => {
    if (!filteredViews.length) return null

    return filteredViews.find((view) => view.id === selectedStationId) ?? filteredViews[0]
  }, [filteredViews, selectedStationId])

  const selectedBoundaryId = selectedView?.physicalBarangay?.id ?? null
  const selectedPointId = selectedView?.id ?? null

  const pointCollection = useMemo(
    () => toStationPointFeatureCollection(filteredViews),
    [filteredViews]
  )

  const totalPins = pinViews.filter((view) => view.station.pinStatus === 'pinned').length
  const needsPins = pinViews.filter((view) => view.station.pinStatus === 'needs_pin').length
  const drafts = pinViews.filter((view) => view.station.pinStatus === 'draft').length

  return (
    <section className='flex min-h-0 flex-1 flex-col gap-4'>
      <PageHeader
        title='Health Station Pins'
        description='Review every health station pin, filter by state, and keep physical locations aligned with the map.'
        controls={
          <>
            <Button asChild className='h-10 px-4' variant='outline'>
              <Link href={routeContext.basePath}>Back to stations</Link>
            </Button>
            <Button asChild className='h-10 px-4'>
              <Link href={getStationCreatePath(routeContext)}>
                Add station
                <PlusIcon data-icon='inline-end' />
              </Link>
            </Button>
          </>
        }
      />

      <div className='grid min-h-0 flex-1 gap-4 xl:grid-cols-[390px_minmax(0,1fr)]'>
        <aside className='flex min-h-0 flex-col gap-4'>
          <Card className='shadow-none'>
            <CardHeader className='border-b'>
              <CardTitle>Pin filters</CardTitle>
              <CardDescription>Search by station, barangay, or coordinates.</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-3 pt-4'>
              <Input
                placeholder='Search station, barangay, code, or coordinates'
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />

              <div className='grid gap-3 sm:grid-cols-3 xl:grid-cols-1'>
                <FilterSelect
                  label='Status'
                  onValueChange={(value) => setStatusFilter(value as HealthStationStatus | 'all')}
                  options={statusOptions}
                  value={statusFilter}
                />
                <FilterSelect
                  label='Pin state'
                  onValueChange={(value) => setPinFilter(value as HealthStationPinStatus | 'all')}
                  options={pinStatusFilterOptions}
                  value={pinFilter}
                />
                <FilterSelect
                  label='Facility type'
                  onValueChange={(value) => setFacilityFilter(value as HealthStationFacilityType | 'all')}
                  options={facilityTypeFilterOptions}
                  value={facilityFilter}
                />
              </div>

              <div className='flex flex-wrap gap-2'>
                <Badge variant='secondary'>{pinViews.length} stations</Badge>
                <Badge variant='outline'>{scopedRegistryRecords.length} CHO2 barangays</Badge>
                <Badge variant='outline'>{totalPins} pinned</Badge>
                <Badge variant='outline'>{needsPins} needs pin</Badge>
                <Badge variant='outline'>{drafts} drafts</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className='flex min-h-0 flex-1 flex-col shadow-none'>
            <CardHeader className='border-b'>
              <CardTitle>Station list</CardTitle>
              <CardDescription>Click a station to focus it on the map.</CardDescription>
            </CardHeader>
            <ScrollArea className='min-h-0 flex-1'>
              <CardContent className='flex flex-col gap-3 pt-4'>
                {filteredViews.length ? (
                  filteredViews.map((view) => {
                    const coordinates = getStationPinCoordinates(view)
                    const isSelected = view.id === selectedStationId

                    return (
                      <button
                        key={view.id}
                        type='button'
                        onClick={() => setSelectedStationId(view.id)}
                        className={cn(
                          'w-full rounded-xl border bg-background p-3 text-left shadow-none transition-colors',
                          isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/60'
                        )}
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <p className='truncate font-medium'>{view.station.name}</p>
                            <p className='text-xs text-muted-foreground'>{view.station.stationCode}</p>
                          </div>
                          <Badge variant={view.station.pinStatus === 'pinned' ? 'default' : 'outline'}>
                            {getPinStatusLabel(view.station.pinStatus)}
                          </Badge>
                        </div>

                        <div className='mt-3 grid gap-2 text-sm'>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='text-muted-foreground'>Physical barangay</span>
                            <span className='truncate font-medium'>{view.station.physicalBarangayName}</span>
                          </div>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='text-muted-foreground'>Coordinates</span>
                            <span className='font-mono text-xs tabular-nums'>
                              {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <Empty className='rounded-md border'>
                    <EmptyHeader>
                      <EmptyTitle>No stations found</EmptyTitle>
                      <EmptyDescription>
                        Adjust filters to see stations that still need pin review.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </CardContent>
            </ScrollArea>
          </Card>

          <Card className='shadow-none'>
            <CardHeader className='border-b'>
              <CardTitle>Legend</CardTitle>
              <CardDescription>Marker colors show pin state at a glance.</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-2 pt-4 text-sm'>
              <LegendRow label='Pinned' tone='default' />
              <LegendRow label='Needs pin' tone='secondary' />
              <LegendRow label='Draft' tone='outline' />
            </CardContent>
          </Card>

          <Card className='shadow-none'>
            <CardHeader className='border-b'>
              <CardTitle>Selected station</CardTitle>
              <CardDescription>Current focus for map review.</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-3 pt-4 text-sm'>
              {selectedView ? (
                <>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <p className='truncate font-medium'>{selectedView.station.name}</p>
                      <p className='text-xs text-muted-foreground'>{selectedView.station.stationCode}</p>
                    </div>
                    <Badge variant={selectedView.station.status === 'active' ? 'default' : 'outline'}>
                      {selectedView.station.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className='grid gap-2'>
                    <Row label='Facility type' value={getFacilityTypeLabel(selectedView.station.facilityType)} />
                    <Row label='Physical barangay' value={selectedView.station.physicalBarangayName} />
                    <Row label='Pin source' value={getStationPinFallbackLabel(selectedView)} />
                    <Row
                      label='Coordinates'
                      value={`${selectedView.coordinates.lat.toFixed(6)}, ${selectedView.coordinates.lng.toFixed(6)}`}
                    />
                  </div>
                  <Button asChild className='w-full'>
                    <Link href={getStationEditPath(routeContext, selectedView.station.id)}>
                      Open edit form
                    </Link>
                  </Button>
                </>
              ) : (
                <p className='text-muted-foreground'>Select a station to see pin details.</p>
              )}
            </CardContent>
          </Card>
        </aside>

        <div className='min-h-0 min-w-0 overflow-hidden rounded-2xl border bg-card shadow-none'>
          <StationPinMap
            boundaryCollection={boundaryCollection}
            className='min-h-[min(78dvh,980px)] rounded-none border-0'
            onBoundaryClick={(id) => {
              const matched = scopedRegistryRecords.find((record) => record.id === id)
              if (!matched) return

              const nextStation = pinViews.find(
                (view) => view.station.physicalBarangayPcode === matched.pcode
              )

              if (nextStation) {
                setSelectedStationId(nextStation.id)
              }
            }}
            onPointClick={(id) => {
              setSelectedStationId(id)
            }}
            pointCollection={pointCollection}
            selectedBoundaryId={selectedBoundaryId}
            selectedPointId={selectedPointId}
            initialFitScope='boundaries'
          />
        </div>
      </div>
    </section>
  )
}

function FilterSelect<T extends string>({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string
  value: T
  onValueChange: (value: string) => void
  options: Array<{ label: string; value: T; icon: ComponentType<{ className?: string }> }>
}) {
  return (
    <div className='grid gap-1.5'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className='h-10 w-full'>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

function LegendRow({ label, tone }: { label: string; tone: 'default' | 'secondary' | 'outline' }) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <span className='text-muted-foreground'>{label}</span>
      <Badge variant={tone}>{label}</Badge>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-start justify-between gap-3'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-right font-medium'>{value}</span>
    </div>
  )
}
