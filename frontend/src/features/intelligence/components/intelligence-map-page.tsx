import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type maplibregl from 'maplibre-gl'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Map, MapControls, useMap } from '@/components/ui/map'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { env } from '@/config/env'
import { useSetPageMeta } from '@/contexts/page-context'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  getAvailableLayersForRole,
  getRoleMapActions,
  getRoleViewLabel,
  loadIntelligenceFixtures,
} from '@/features/intelligence/fixtures'
import type { BarangaySnapshot, GeoLayerId, MapRoleView } from '@/features/intelligence/types'
import {
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPinned,
  Radar,
} from 'lucide-react'

interface IntelligenceMapPageProps {
  roleView: MapRoleView
}

interface MapSurfaceProps {
  fixtures: Awaited<ReturnType<typeof loadIntelligenceFixtures>>
  selectedCode: string | null
  visibleLayers: GeoLayerId[]
  onSelectCode: (code: string) => void
}

const layerLabels: Record<GeoLayerId, { title: string; description: string }> = {
  choropleth: {
    title: 'Barangay intensity',
    description: 'Colors each barangay by the mock disease load for this frontend-only MVP.',
  },
  scope: {
    title: 'CHO2 scope',
    description: 'Highlights the operational coverage footprint from the CHO2 boundary file.',
  },
  diseaseHeat: {
    title: 'Disease heat',
    description: 'Shows the single shipped disease heat layer derived from the local mock overlay.',
  },
}

const mapColorScale = ['#ecfdf5', '#bbf7d0', '#4ade80', '#15803d']
const mapViewportHeightClass = 'h-[calc(100dvh-7.5rem)] min-h-[34rem] xl:h-[calc(100dvh-7.5rem)]'
const layerGroups: Array<{
  title: string
  description: string
  layers: GeoLayerId[]
}> = [
  {
    title: 'Base context',
    description: 'Operational boundaries and intensity context for the selected role view.',
    layers: ['choropleth', 'scope'],
  },
  {
    title: 'Overlays',
    description: 'Investigative overlay layers that sit on top of the base map.',
    layers: ['diseaseHeat'],
  },
]

const presetLabels: Record<'operational' | 'heatFocus' | 'scopeOnly', string[]> = {
  operational: ['Barangay intensity', 'CHO2 scope'],
  heatFocus: ['CHO2 scope', 'Disease heat'],
  scopeOnly: ['CHO2 scope'],
}

// Map provider styles
const cartoStyles = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
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

function statusVariant(status: BarangaySnapshot['alertStatus']): 'secondary' | 'outline' | 'destructive' {
  if (status === 'hotspot') return 'destructive'
  if (status === 'watch') return 'secondary'
  return 'outline'
}

function statusLabel(status: BarangaySnapshot['alertStatus']) {
  if (status === 'hotspot') return 'Hotspot'
  if (status === 'watch') return 'Watch'
  return 'Stable'
}

function DetailPanel({
  roleView,
  snapshot,
}: {
  roleView: MapRoleView
  snapshot: BarangaySnapshot | null
}) {
  const actions = getRoleMapActions(roleView)

  if (!snapshot) {
    return (
      <Empty className="border bg-muted/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MapPinned />
          </EmptyMedia>
          <EmptyTitle>Select a barangay</EmptyTitle>
          <EmptyDescription>
            Click any polygon on the map to inspect its CHO2 scope, alerts, and operational snapshot.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {snapshot.barangayCode}
          </div>
          <h2 className="font-heading text-xl font-semibold">{snapshot.barangayName}</h2>
          <p className="text-sm text-muted-foreground">{snapshot.bhsName}</p>
        </div>
        <Badge variant={statusVariant(snapshot.alertStatus)}>{statusLabel(snapshot.alertStatus)}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-background/80 p-3">
          <div className="text-xs text-muted-foreground">Total cases</div>
          <div className="mt-2 font-heading text-2xl font-semibold">{snapshot.totalCases}</div>
        </div>
        <div className="rounded-2xl border bg-background/80 p-3">
          <div className="text-xs text-muted-foreground">Active alerts</div>
          <div className="mt-2 font-heading text-2xl font-semibold">{snapshot.activeAlerts}</div>
        </div>
        <div className="rounded-2xl border bg-background/80 p-3">
          <div className="text-xs text-muted-foreground">Validation rate</div>
          <div className="mt-2 font-heading text-2xl font-semibold">{snapshot.validationRate}%</div>
        </div>
        <div className="rounded-2xl border bg-background/80 p-3">
          <div className="text-xs text-muted-foreground">Households</div>
          <div className="mt-2 font-heading text-2xl font-semibold">{snapshot.householdsCovered}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-muted/25 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Building2 className="size-4 text-muted-foreground" />
          Operational context
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{snapshot.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{snapshot.inCho2Scope ? 'Within CHO2 scope' : 'Outside CHO2 scope'}</Badge>
          <Badge variant="outline">{getRoleViewLabel(roleView)} view</Badge>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="text-sm font-medium">Next actions</div>
        <div className="grid gap-2">
          {actions.map((action) => (
            <Button key={action.to} variant="outline" className="justify-between" nativeButton={false} render={<Link to={action.to} />}>
              {action.label}
              <Radar data-icon="inline-end" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

function MapLayerSurface({
  fixtures,
  selectedCode,
  visibleLayers,
  onSelectCode,
}: MapSurfaceProps) {
  const { map, isLoaded } = useMap()
  const hasFitToBounds = useRef(false)
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)

  useEffect(() => {
    if (!map || !isLoaded) return

    if (!map.getSource('intelligence-barangays')) {
      map.addSource('intelligence-barangays', {
        type: 'geojson',
        data: fixtures.dasmarinas,
      })
    }

    if (!map.getSource('intelligence-cho2')) {
      map.addSource('intelligence-cho2', {
        type: 'geojson',
        data: fixtures.cho2,
      })
    }

    if (!map.getSource('intelligence-heat')) {
      map.addSource('intelligence-heat', {
        type: 'geojson',
        data: fixtures.diseaseHeat,
      })
    }

    if (!map.getLayer('intelligence-barangays-fill')) {
      map.addLayer({
        id: 'intelligence-barangays-fill',
        type: 'fill',
        source: 'intelligence-barangays',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'mockCases'], 0],
            0,
            mapColorScale[0],
            12,
            mapColorScale[1],
            24,
            mapColorScale[2],
            42,
            mapColorScale[3],
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['get', 'inCho2Scope'], false],
            0.82,
            0.28,
          ],
        },
      })
    }

    if (!map.getLayer('intelligence-barangays-outline')) {
      map.addLayer({
        id: 'intelligence-barangays-outline',
        type: 'line',
        source: 'intelligence-barangays',
        paint: {
          'line-color': '#0f172a',
          'line-opacity': 0.18,
          'line-width': 1,
        },
      })
    }

    if (!map.getLayer('intelligence-hover-outline')) {
      map.addLayer({
        id: 'intelligence-hover-outline',
        type: 'line',
        source: 'intelligence-barangays',
        filter: ['==', ['get', 'ADM4_PCODE'], ''],
        paint: {
          'line-color': '#14532d',
          'line-width': 2.25,
        },
      })
    }

    if (!map.getLayer('intelligence-selected-outline')) {
      map.addLayer({
        id: 'intelligence-selected-outline',
        type: 'line',
        source: 'intelligence-barangays',
        filter: ['==', ['get', 'ADM4_PCODE'], ''],
        paint: {
          'line-color': '#f97316',
          'line-width': 3,
        },
      })
    }

    if (!map.getLayer('intelligence-cho2-outline')) {
      map.addLayer({
        id: 'intelligence-cho2-outline',
        type: 'line',
        source: 'intelligence-cho2',
        paint: {
          'line-color': '#0f766e',
          'line-width': 2,
          'line-opacity': 0.9,
        },
      })
    }

    if (!map.getLayer('intelligence-heat-layer')) {
      map.addLayer({
        id: 'intelligence-heat-layer',
        type: 'heatmap',
        source: 'intelligence-heat',
        maxzoom: 13,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'intensity'],
            0,
            0,
            10,
            1,
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5,
            0.9,
            11,
            2.4,
            13,
            3.1,
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(248, 250, 252, 0)',
            0.16,
            'rgba(253, 224, 71, 0.30)',
            0.34,
            'rgba(251, 146, 60, 0.48)',
            0.58,
            'rgba(239, 68, 68, 0.7)',
            0.82,
            'rgba(190, 24, 93, 0.84)',
            1,
            'rgba(103, 12, 34, 0.92)',
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5,
            20,
            10,
            36,
            13,
            58,
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6,
            0.8,
            11,
            0.95,
            13,
            0.2,
          ],
        },
      })
    }

    if (!map.getLayer('intelligence-heat-hotspots')) {
      map.addLayer({
        id: 'intelligence-heat-hotspots',
        type: 'circle',
        source: 'intelligence-heat',
        minzoom: 12,
        paint: {
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'hotspotWeight'],
            1,
            'rgba(251, 146, 60, 0.62)',
            1.5,
            'rgba(239, 68, 68, 0.74)',
            1.9,
            'rgba(127, 29, 29, 0.88)',
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12,
            [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              1,
              4,
              10,
              10,
            ],
            15,
            [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              1,
              7,
              10,
              14,
            ],
          ],
          'circle-blur': 0.3,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12,
            0,
            12.4,
            0.7,
            15,
            0.85,
          ],
          'circle-stroke-color': 'rgba(255, 247, 237, 0.9)',
          'circle-stroke-width': 1,
        },
      })
    }

    ;(map.getSource('intelligence-barangays') as maplibregl.GeoJSONSource).setData(fixtures.dasmarinas)
    ;(map.getSource('intelligence-cho2') as maplibregl.GeoJSONSource).setData(fixtures.cho2)
    ;(map.getSource('intelligence-heat') as maplibregl.GeoJSONSource).setData(fixtures.diseaseHeat)

    const choroplethVisibility = visibleLayers.includes('choropleth') ? 'visible' : 'none'
    const scopeVisibility = visibleLayers.includes('scope') ? 'visible' : 'none'
    const heatVisibility = visibleLayers.includes('diseaseHeat') ? 'visible' : 'none'

    map.setLayoutProperty('intelligence-barangays-fill', 'visibility', choroplethVisibility)
    map.setLayoutProperty('intelligence-barangays-outline', 'visibility', choroplethVisibility)
    map.setLayoutProperty('intelligence-hover-outline', 'visibility', choroplethVisibility)
    map.setLayoutProperty('intelligence-selected-outline', 'visibility', choroplethVisibility)
    map.setLayoutProperty('intelligence-cho2-outline', 'visibility', scopeVisibility)
    map.setLayoutProperty('intelligence-heat-layer', 'visibility', heatVisibility)
    map.setLayoutProperty('intelligence-heat-hotspots', 'visibility', heatVisibility)

    map.setFilter('intelligence-hover-outline', ['==', ['get', 'ADM4_PCODE'], hoveredCode ?? ''])
    map.setFilter('intelligence-selected-outline', ['==', ['get', 'ADM4_PCODE'], selectedCode ?? ''])

    if (!hasFitToBounds.current) {
      hasFitToBounds.current = true
      map.fitBounds(fixtures.initialBounds, {
        padding: { top: 72, right: 72, bottom: 72, left: 72 },
        duration: 0,
      })
    }

    const handleEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }

    const handleMove = (event: maplibregl.MapMouseEvent) => {
      const feature = map.queryRenderedFeatures(event.point, {
        layers: ['intelligence-barangays-fill'],
      })[0]

      setHoveredCode((feature?.properties?.ADM4_PCODE as string | undefined) ?? null)
    }

    const handleLeave = () => {
      map.getCanvas().style.cursor = ''
      setHoveredCode(null)
    }

    const handleClick = (event: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const code = event.features?.[0]?.properties?.ADM4_PCODE as string | undefined
      if (code) {
        onSelectCode(code)
      }
    }

    map.on('mouseenter', 'intelligence-barangays-fill', handleEnter)
    map.on('mousemove', 'intelligence-barangays-fill', handleMove)
    map.on('mouseleave', 'intelligence-barangays-fill', handleLeave)
    map.on('click', 'intelligence-barangays-fill', handleClick)

    return () => {
      map.off('mouseenter', 'intelligence-barangays-fill', handleEnter)
      map.off('mousemove', 'intelligence-barangays-fill', handleMove)
      map.off('mouseleave', 'intelligence-barangays-fill', handleLeave)
      map.off('click', 'intelligence-barangays-fill', handleClick)
    }
  }, [fixtures, hoveredCode, isLoaded, map, onSelectCode, selectedCode, visibleLayers])

  return null
}

function LoadingState() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.25fr]">
      <Card className={`overflow-hidden border-primary/10 ${mapViewportHeightClass}`}>
        <CardContent className="h-full p-0">
          <Skeleton className="h-full w-full rounded-none" />
        </CardContent>
      </Card>
      {/* Desktop only: sidebar skeleton */}
      <Card className={`hidden overflow-hidden border-primary/10 xl:block ${mapViewportHeightClass}`}>
        <CardHeader className="border-b bg-muted/20">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-5 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function IntelligenceMapPage({ roleView }: IntelligenceMapPageProps) {
  const isMobile = useIsMobile()
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [visibleLayers, setVisibleLayers] = useState<GeoLayerId[]>(
    roleView === 'dso'
      ? ['scope']
      : roleView === 'cho'
        ? ['choropleth', 'scope', 'diseaseHeat']
        : ['choropleth', 'scope'],
  )
  const [layerControlsOpen, setLayerControlsOpen] = useState(!isMobile)
  const [mapProvider, setMapProvider] = useState<'carto' | 'maptiler'>(() => {
    if (typeof window === 'undefined') return 'carto'
    return (localStorage.getItem('gis-map-provider') as 'carto' | 'maptiler') ?? 'carto'
  })

  // Persist provider preference
  const handleProviderChange = (provider: 'carto' | 'maptiler') => {
    setMapProvider(provider)
    localStorage.setItem('gis-map-provider', provider)
  }

  const fixturesQuery = useQuery({
    queryKey: ['intelligence', 'fixtures'],
    queryFn: loadIntelligenceFixtures,
  })

  const availableLayers = useMemo(() => getAvailableLayersForRole(roleView), [roleView])
  const mapStyles = useMemo(
    () => getMapStyles(mapProvider, env.maptilerApiKey),
    [mapProvider, env.maptilerApiKey]
  )
  const selectedSnapshot = fixturesQuery.data?.snapshots[selectedCode ?? ''] ?? null

  useEffect(() => {
    setLayerControlsOpen(!isMobile)
  }, [isMobile])

  function applyPreset(preset: 'operational' | 'heatFocus' | 'scopeOnly') {
    const presetLayers: Record<typeof preset, GeoLayerId[]> = {
      operational: roleView === 'dso' ? ['scope'] : ['choropleth', 'scope'],
      heatFocus: roleView === 'dso' ? ['scope'] : ['scope', 'diseaseHeat'],
      scopeOnly: ['scope'],
    }

    setVisibleLayers(presetLayers[preset].filter((layer) => availableLayers.includes(layer)))
  }

  useSetPageMeta({
    title: 'Disease Map',
    breadcrumbs: [{ label: 'Intelligence' }, { label: 'Disease Map' }],
  })

  if (fixturesQuery.isLoading) {
    return <LoadingState />
  }

  if (fixturesQuery.isError || !fixturesQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Unable to load GIS fixtures</AlertTitle>
        <AlertDescription>
          The local GeoJSON assets or mock overlays could not be loaded. This route stays frontend-only, so the page needs those local files to render.
        </AlertDescription>
      </Alert>
    )
  }

  const fixtures = fixturesQuery.data

  if (fixtures.dasmarinas.features.length === 0) {
    return (
      <Empty className="border bg-muted/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MapPinned />
          </EmptyMedia>
          <EmptyTitle>No GIS fixtures available</EmptyTitle>
          <EmptyDescription>
            The disease map page is wired correctly, but the boundary dataset is empty.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <TooltipProvider>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.25fr]">
          <Card className={`overflow-hidden border-primary/10 ${mapViewportHeightClass}`}>
            <CardContent className="h-full p-0">
              <div className="relative h-full w-full bg-muted/30">
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
                  <MapLayerSurface
                    fixtures={fixtures}
                    selectedCode={selectedCode}
                    visibleLayers={visibleLayers}
                    onSelectCode={setSelectedCode}
                  />
                </Map>

                {/* Layer controls toggle button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-4 z-20 h-10 w-10"
                  onClick={() => setLayerControlsOpen(!layerControlsOpen)}
                  aria-label={layerControlsOpen ? 'Close layer controls' : 'Open layer controls'}
                  aria-expanded={layerControlsOpen}
                >
                  {layerControlsOpen ? (
                    <ChevronLeft className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </Button>

                {/* Collapsible layer controls panel */}
                <Collapsible
                  open={layerControlsOpen}
                  onOpenChange={setLayerControlsOpen}
                  className="absolute left-4 top-16 z-10 w-[min(100%-2rem,22rem)]"
                >
                  <CollapsibleContent>
                    <Card className="border-primary/10 bg-background/88 shadow-lg supports-backdrop-filter:backdrop-blur">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Layer controls</CardTitle>
                        <CardDescription>Organized by map context, overlays, and quick presets.</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        {layerGroups.map((group, index) => {
                          const groupLayers = group.layers.filter((layer) => availableLayers.includes(layer))
                          if (!groupLayers.length) return null

                          return (
                            <div key={group.title} className="space-y-2">
                              <div>
                                <div className="text-sm font-medium">{group.title}</div>
                                <div className="text-xs text-muted-foreground">{group.description}</div>
                              </div>
                              <ToggleGroup
                                value={visibleLayers}
                                onValueChange={(value) => setVisibleLayers((value as GeoLayerId[]) ?? [])}
                                multiple
                                orientation="vertical"
                                spacing={1}
                                className="w-full items-stretch"
                              >
                                {groupLayers.map((layerId) => (
                                  <Tooltip key={layerId}>
                                    <TooltipTrigger render={<div className="w-full" />}>
                                      <ToggleGroupItem value={layerId} variant="outline" className="w-full justify-between">
                                        <span>{layerLabels[layerId].title}</span>
                                        <Badge variant="outline">{group.title === 'Overlays' ? 'Overlay' : 'Base'}</Badge>
                                      </ToggleGroupItem>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-56">
                                      {layerLabels[layerId].description}
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </ToggleGroup>
                              {index < layerGroups.length - 1 ? <Separator /> : null}
                            </div>
                          )
                        })}
                        <div className="space-y-2">
                          <div>
                            <div className="text-sm font-medium">Quick presets</div>
                            <div className="text-xs text-muted-foreground">
                              One-tap views for operational review, heat investigation, or scope-only focus.
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Button variant="outline" className="justify-between" onClick={() => applyPreset('operational')}>
                              Operational
                              <span className="text-xs text-muted-foreground">{presetLabels.operational.join(' + ')}</span>
                            </Button>
                            <Button variant="outline" className="justify-between" onClick={() => applyPreset('heatFocus')}>
                              Heat focus
                              <span className="text-xs text-muted-foreground">{presetLabels.heatFocus.join(' + ')}</span>
                            </Button>
                            <Button variant="outline" className="justify-between" onClick={() => applyPreset('scopeOnly')}>
                              Scope only
                              <span className="text-xs text-muted-foreground">{presetLabels.scopeOnly.join(' + ')}</span>
                            </Button>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                          <div className="rounded-xl border bg-muted/20 p-3">
                            <div className="font-medium text-foreground">Default view</div>
                            <div className="mt-1 leading-5">CHO2 scope stays visible and CHO heatmap loads on by default.</div>
                          </div>
                          <div className="rounded-xl border bg-muted/20 p-3">
                            <div className="font-medium text-foreground">Interaction</div>
                            <div className="mt-1 leading-5">Hover to inspect, click to lock the barangay snapshot.</div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-dashed bg-muted/15 p-3 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="mb-2">Mock heat data</Badge>
                          <div className="leading-5">Heat intensity is seeded from the CHO2 mock case load for testing while backend GIS data is still pending.</div>
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>

          {!isMobile ? (
            <Card className={`${mapViewportHeightClass} overflow-hidden border-primary/10`}>
              <CardHeader className="border-b bg-muted/20">
                <CardTitle>Barangay snapshot</CardTitle>
                <CardDescription>Focused operational context for the currently selected polygon.</CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-5.25rem)] overflow-y-auto p-5">
                <DetailPanel roleView={roleView} snapshot={selectedSnapshot} />
              </CardContent>
            </Card>
          ) : null}

        {isMobile ? (
          <Drawer open={Boolean(selectedSnapshot)} onOpenChange={(open) => (!open ? setSelectedCode(null) : null)}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Barangay snapshot</DrawerTitle>
                <DrawerDescription>Tap outside the drawer to return to the full map canvas.</DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-6">
                <DetailPanel roleView={roleView} snapshot={selectedSnapshot} />
              </div>
            </DrawerContent>
          </Drawer>
        ) : null}
      </div>
    </TooltipProvider>
  )
}
