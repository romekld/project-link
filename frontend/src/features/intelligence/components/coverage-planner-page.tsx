import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import type maplibregl from 'maplibre-gl'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Map, MapControls, MapPopup, useMap } from '@/components/ui/map'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useSetPageMeta } from '@/contexts/page-context'
import { env } from '@/config/env'
import {
  buildCoveragePlannerRecords,
  loadIntelligenceFixtures,
} from '@/features/intelligence'
import { IntelligenceDataTable, selectionColumn } from './intelligence-data-table'
import type {
  CoveragePendingAction,
  CoveragePlannerRecord,
  IntelligenceFixtures,
} from '@/features/intelligence/types'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPenLine,
  Layers3,
  MapPinned,
  MapPlus,
  ShieldAlert,
} from 'lucide-react'

interface CoveragePlannerPageProps {
  roleScope: 'cho' | 'admin'
}

interface CoveragePlannerMapSurfaceProps {
  fixtures: IntelligenceFixtures
  records: CoveragePlannerRecord[]
  selectedCode: string | null
  onSelectCode: (code: string | null, coordinates?: [number, number]) => void
}

interface PendingDraft {
  action: CoveragePendingAction
  codes: string[]
}

const cartoStyles = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
}

function getMaptilerStyles(apiKey: string) {
  const style = `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`
  return { light: style, dark: style }
}

function getMapStyles(provider: 'carto' | 'maptiler', apiKey?: string) {
  if (provider === 'maptiler' && apiKey) {
    return getMaptilerStyles(apiKey)
  }

  return cartoStyles
}

function getEffectiveScope(record: CoveragePlannerRecord) {
  if (record.pendingAction === 'add') return true
  if (record.pendingAction === 'remove') return false
  return record.inCho2Scope
}

function getCoverageStatus(record: CoveragePlannerRecord) {
  if (record.pendingAction === 'add') {
    return { label: 'Pending add', variant: 'secondary' as const }
  }

  if (record.pendingAction === 'remove') {
    return { label: 'Pending remove', variant: 'destructive' as const }
  }

  if (record.inCho2Scope) {
    return { label: 'In CHO2', variant: 'default' as const }
  }

  return { label: 'Outside CHO2', variant: 'outline' as const }
}

function LoadingState() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <Card className="overflow-hidden border-primary/10">
        <CardContent className="p-0">
          <Skeleton className="h-[calc(100dvh-9rem)] min-h-[34rem] w-full rounded-none" />
        </CardContent>
      </Card>
      <Card className="border-primary/10">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

function CoveragePlannerMapSurface({
  fixtures,
  records,
  selectedCode,
  onSelectCode,
}: CoveragePlannerMapSurfaceProps) {
  const { map, isLoaded } = useMap()
  const hasFitToBounds = useRef(false)

  const featureCollection = useMemo(() => ({
    ...fixtures.dasmarinas,
    features: fixtures.dasmarinas.features.map((feature) => {
      const record = records.find((item) => item.barangayCode === feature.properties.ADM4_PCODE)
      const status = record ? getCoverageStatus(record).label : 'Outside CHO2'
      const effectiveScope = record ? getEffectiveScope(record) : feature.properties.inCho2Scope

      return {
        ...feature,
        properties: {
          ...feature.properties,
          plannerStatus: status,
          plannerScope: effectiveScope,
        },
      }
    }),
  }), [fixtures.dasmarinas, records])

  useEffect(() => {
    if (!map || !isLoaded) return

    if (!map.getSource('coverage-planner-barangays')) {
      map.addSource('coverage-planner-barangays', {
        type: 'geojson',
        data: featureCollection,
      })
    }

    if (!map.getLayer('coverage-planner-fill')) {
      map.addLayer({
        id: 'coverage-planner-fill',
        type: 'fill',
        source: 'coverage-planner-barangays',
        paint: {
          'fill-color': [
            'match',
            ['get', 'plannerStatus'],
            'Pending add',
            '#0f766e',
            'Pending remove',
            '#dc2626',
            'In CHO2',
            '#22c55e',
            '#cbd5e1',
          ],
          'fill-opacity': 0.62,
        },
      })
    }

    if (!map.getLayer('coverage-planner-outline')) {
      map.addLayer({
        id: 'coverage-planner-outline',
        type: 'line',
        source: 'coverage-planner-barangays',
        paint: {
          'line-color': '#0f172a',
          'line-opacity': 0.22,
          'line-width': 1,
        },
      })
    }

    if (!map.getLayer('coverage-planner-selected')) {
      map.addLayer({
        id: 'coverage-planner-selected',
        type: 'line',
        source: 'coverage-planner-barangays',
        filter: ['==', ['get', 'ADM4_PCODE'], ''],
        paint: {
          'line-color': '#f97316',
          'line-width': 3,
        },
      })
    }

    ;(map.getSource('coverage-planner-barangays') as maplibregl.GeoJSONSource).setData(featureCollection)
    map.setFilter('coverage-planner-selected', ['==', ['get', 'ADM4_PCODE'], selectedCode ?? ''])

    if (!hasFitToBounds.current) {
      hasFitToBounds.current = true
      map.fitBounds(fixtures.initialBounds, {
        padding: { top: 56, right: 56, bottom: 56, left: 56 },
        duration: 0,
      })
    }

    const handleEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }

    const handleLeave = () => {
      map.getCanvas().style.cursor = ''
    }

    const handleClick = (event: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const code = event.features?.[0]?.properties?.ADM4_PCODE as string | undefined
      if (!code) return

      onSelectCode(code, [event.lngLat.lng, event.lngLat.lat])
    }

    map.on('mouseenter', 'coverage-planner-fill', handleEnter)
    map.on('mouseleave', 'coverage-planner-fill', handleLeave)
    map.on('click', 'coverage-planner-fill', handleClick)

    return () => {
      map.off('mouseenter', 'coverage-planner-fill', handleEnter)
      map.off('mouseleave', 'coverage-planner-fill', handleLeave)
      map.off('click', 'coverage-planner-fill', handleClick)
    }
  }, [featureCollection, fixtures.initialBounds, isLoaded, map, onSelectCode, selectedCode])

  return null
}

export function CoveragePlannerPage({ roleScope }: CoveragePlannerPageProps) {
  const [records, setRecords] = useState<CoveragePlannerRecord[]>([])
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<CoveragePlannerRecord[]>([])
  const [popupCoordinates, setPopupCoordinates] = useState<[number, number] | null>(null)
  const [pendingDraft, setPendingDraft] = useState<PendingDraft | null>(null)
  const [draftReason, setDraftReason] = useState('')
  const [mapProvider, setMapProvider] = useState<'carto' | 'maptiler'>(() => {
    if (typeof window === 'undefined') return 'carto'
    return (localStorage.getItem('gis-map-provider') as 'carto' | 'maptiler') ?? 'carto'
  })

  const fixturesQuery = useQuery({
    queryKey: ['intelligence', 'fixtures'],
    queryFn: loadIntelligenceFixtures,
  })

  useEffect(() => {
    if (!fixturesQuery.data) return
    setRecords(buildCoveragePlannerRecords(fixturesQuery.data))
  }, [fixturesQuery.data])

  useSetPageMeta({
    title: 'Coverage Planner',
    breadcrumbs: [{ label: roleScope === 'cho' ? 'Intelligence' : 'BHS Registry' }, { label: 'Coverage Planner' }],
  })

  const selectedRecord = records.find((record) => record.barangayCode === selectedCode) ?? null
  const mapStyles = useMemo(
    () => getMapStyles(mapProvider, env.maptilerApiKey),
    [mapProvider],
  )

  const totals = useMemo(() => {
    return records.reduce(
      (summary, record) => {
        const effectiveScope = getEffectiveScope(record)
        if (effectiveScope) summary.inScope += 1
        else summary.outOfScope += 1

        if (record.pendingAction === 'add') summary.pendingAdds += 1
        if (record.pendingAction === 'remove') summary.pendingRemoves += 1
        return summary
      },
      { inScope: 0, outOfScope: 0, pendingAdds: 0, pendingRemoves: 0 },
    )
  }, [records])

  const columns = useMemo<ColumnDef<CoveragePlannerRecord>[]>(() => [
    selectionColumn<CoveragePlannerRecord>(),
    {
      accessorKey: 'barangayName',
      header: 'Barangay',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.barangayName}</div>
          <div className="text-xs text-muted-foreground">{row.original.barangayCode}</div>
        </div>
      ),
    },
    {
      accessorKey: 'bhsName',
      header: 'Health station',
    },
    {
      id: 'status',
      header: 'Coverage status',
      cell: ({ row }) => {
        const status = getCoverageStatus(row.original)
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    {
      accessorKey: 'activeAlerts',
      header: 'Alerts',
    },
    {
      accessorKey: 'totalCases',
      header: 'Cases',
    },
    {
      accessorKey: 'validationRate',
      header: 'Validation',
      cell: ({ row }) => `${row.original.validationRate}%`,
    },
  ], [])

  function handleProviderChange(provider: 'carto' | 'maptiler') {
    setMapProvider(provider)
    localStorage.setItem('gis-map-provider', provider)
  }

  function openDraftDialog(action: CoveragePendingAction, codes: string[]) {
    if (!codes.length) return
    setPendingDraft({ action, codes })
    setDraftReason('')
  }

  function commitDraft() {
    if (!pendingDraft || !draftReason.trim()) return

    setRecords((current) =>
      current.map((record) =>
        pendingDraft.codes.includes(record.barangayCode)
          ? {
              ...record,
              pendingAction: pendingDraft.action,
              changeReason: draftReason.trim(),
            }
          : record,
      ),
    )
    setPendingDraft(null)
    setDraftReason('')
  }

  function clearDraft(codes: string[]) {
    setRecords((current) =>
      current.map((record) =>
        codes.includes(record.barangayCode)
          ? {
              ...record,
              pendingAction: null,
              changeReason: '',
            }
          : record,
      ),
    )
  }

  if (fixturesQuery.isLoading) {
    return <LoadingState />
  }

  if (fixturesQuery.isError || !fixturesQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Unable to load coverage planner</AlertTitle>
        <AlertDescription>
          The local GIS fixtures could not be loaded, so the planner cannot render the city and CHO2 coverage layers.
        </AlertDescription>
      </Alert>
    )
  }

  if (!records.length) {
    return (
      <Empty className="border bg-muted/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MapPinned />
          </EmptyMedia>
          <EmptyTitle>No barangays available</EmptyTitle>
          <EmptyDescription>
            The planner is ready, but the barangay fixtures are empty.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const bulkCodes = selectedRows.map((row) => row.barangayCode)
  const popupStatus = selectedRecord ? getCoverageStatus(selectedRecord) : null
  const nextAction = selectedRecord && getEffectiveScope(selectedRecord) ? 'remove' : 'add'

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="overflow-hidden border-primary/10">
          <CardContent className="p-0">
            <div className="relative h-[calc(100dvh-9rem)] min-h-[34rem] w-full bg-muted/30">
              <Map
                center={[120.9406, 14.3294]}
                zoom={11}
                maxZoom={16}
                minZoom={9}
                styles={mapStyles}
                className="h-full"
              >
                <MapControls
                  position="bottom-right"
                  showZoom
                  showFullscreen
                  showProviderToggle
                  mapProvider={mapProvider}
                  onProviderChange={handleProviderChange}
                />
                <CoveragePlannerMapSurface
                  fixtures={fixturesQuery.data}
                  records={records}
                  selectedCode={selectedCode}
                  onSelectCode={(code, coordinates) => {
                    setSelectedCode(code)
                    setPopupCoordinates(coordinates ?? null)
                  }}
                />
                {selectedRecord && popupCoordinates ? (
                  <MapPopup
                    longitude={popupCoordinates[0]}
                    latitude={popupCoordinates[1]}
                    closeButton
                    onClose={() => setPopupCoordinates(null)}
                    className="w-72"
                  >
                    <div className="space-y-3 pr-6">
                      <div className="space-y-1">
                        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          {selectedRecord.barangayCode}
                        </div>
                        <div className="text-sm font-semibold">{selectedRecord.barangayName}</div>
                        <div className="text-xs text-muted-foreground">{selectedRecord.bhsName}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={popupStatus?.variant}>{popupStatus?.label}</Badge>
                        <Badge variant="outline">{selectedRecord.totalCases} mock cases</Badge>
                      </div>
                      <div className="grid gap-2">
                        <Button
                          size="sm"
                          onClick={() => openDraftDialog(nextAction, [selectedRecord.barangayCode])}
                        >
                          {nextAction === 'add' ? 'Add to CHO2 scope' : 'Remove from CHO2 scope'}
                        </Button>
                        {selectedRecord.pendingAction ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => clearDraft([selectedRecord.barangayCode])}
                          >
                            Clear staged change
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </MapPopup>
                ) : null}
              </Map>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers3 className="size-4 text-muted-foreground" />
                Draft summary
              </CardTitle>
              <CardDescription>
                Coverage edits stay local for now, with a required reason captured for each staged change.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border bg-muted/20 p-3">
                  <div className="text-xs text-muted-foreground">In CHO2</div>
                  <div className="mt-2 font-heading text-2xl font-semibold">{totals.inScope}</div>
                </div>
                <div className="rounded-2xl border bg-muted/20 p-3">
                  <div className="text-xs text-muted-foreground">Outside scope</div>
                  <div className="mt-2 font-heading text-2xl font-semibold">{totals.outOfScope}</div>
                </div>
                <div className="rounded-2xl border bg-muted/20 p-3">
                  <div className="text-xs text-muted-foreground">Pending add</div>
                  <div className="mt-2 font-heading text-2xl font-semibold">{totals.pendingAdds}</div>
                </div>
                <div className="rounded-2xl border bg-muted/20 p-3">
                  <div className="text-xs text-muted-foreground">Pending remove</div>
                  <div className="mt-2 font-heading text-2xl font-semibold">{totals.pendingRemoves}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed bg-muted/15 p-3">
                <Badge variant="secondary" className="mb-2">Draft only</Badge>
                <p className="text-sm leading-6 text-muted-foreground">
                  These updates are intentionally frontend-only while we finalize the backend and database flow.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardPenLine className="size-4 text-muted-foreground" />
                Selected barangay
              </CardTitle>
              <CardDescription>
                Map clicks and table clicks stay synchronized so planners can review by geography or by list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRecord ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-semibold">{selectedRecord.barangayName}</div>
                    <div className="text-xs text-muted-foreground">{selectedRecord.bhsName}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getCoverageStatus(selectedRecord).variant}>
                      {getCoverageStatus(selectedRecord).label}
                    </Badge>
                    <Badge variant="outline">{selectedRecord.validationRate}% validated</Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Cases</div>
                      <div className="font-medium">{selectedRecord.totalCases}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Alerts</div>
                      <div className="font-medium">{selectedRecord.activeAlerts}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Households</div>
                      <div className="font-medium">{selectedRecord.householdsCovered}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Reason</div>
                      <div className="font-medium">{selectedRecord.changeReason || 'No staged reason yet'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <Empty className="min-h-56 border bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MapPlus />
                    </EmptyMedia>
                    <EmptyTitle>Pick a barangay to edit</EmptyTitle>
                    <EmptyDescription>
                      Click the map or any table row to stage an add or remove action.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-4 border-primary/10">
        <CardHeader>
          <CardTitle>Barangay coverage list</CardTitle>
          <CardDescription>
            Search the full city list, stage bulk coverage changes, and review reasons before backend wiring begins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntelligenceDataTable
            columns={columns}
            data={records}
            filterColumn="barangayName"
            filterPlaceholder="Search barangay"
            onSelectionChange={setSelectedRows}
            onRowClick={(row) => {
              setSelectedCode(row.barangayCode)
              setPopupCoordinates(null)
            }}
            toolbar={(
              <>
                <Button
                  variant="outline"
                  disabled={!bulkCodes.length}
                  onClick={() => openDraftDialog('add', bulkCodes)}
                >
                  <CheckCircle2 data-icon="inline-start" />
                  Stage add
                </Button>
                <Button
                  variant="outline"
                  disabled={!bulkCodes.length}
                  onClick={() => openDraftDialog('remove', bulkCodes)}
                >
                  <ShieldAlert data-icon="inline-start" />
                  Stage remove
                </Button>
                <Button
                  variant="ghost"
                  disabled={!bulkCodes.length}
                  onClick={() => clearDraft(bulkCodes)}
                >
                  Clear draft
                </Button>
              </>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={Boolean(pendingDraft)} onOpenChange={(open) => (!open ? setPendingDraft(null) : null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {pendingDraft?.action === 'add' ? 'Stage add to CHO2 scope' : 'Stage removal from CHO2 scope'}
            </DialogTitle>
            <DialogDescription>
              Add a short reason so this frontend-only draft already follows the audit pattern we want for the real workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
              {pendingDraft?.codes.length} barangay{pendingDraft?.codes.length === 1 ? '' : 's'} selected for this staged change.
            </div>
            <Field>
              <FieldLabel htmlFor="coverage-reason">Reason for change</FieldLabel>
              <Textarea
                id="coverage-reason"
                placeholder="Example: realign operational responsibility after CHO2 field validation."
                value={draftReason}
                onChange={(event) => setDraftReason(event.target.value)}
              />
              <FieldDescription>
                This will stay in local mock state for now, but we’re keeping the interaction audit-ready.
              </FieldDescription>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDraft(null)}>
              Cancel
            </Button>
            <Button onClick={commitDraft} disabled={!draftReason.trim()}>
              Save draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
