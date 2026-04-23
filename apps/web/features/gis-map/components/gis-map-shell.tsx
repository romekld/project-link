'use client'

import type React from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTheme } from '@/components/theme-provider'
import maplibregl, {
  type LngLatBoundsLike,
  type Map as MapLibreMap,
  type MapLayerMouseEvent,
  type MapMouseEvent,
} from 'maplibre-gl'
import { ExpandIcon, LocateFixedIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type {
  GisGeometry,
  GisMapPopupState,
  GisPointFeature,
  GisPointFeatureCollection,
  GisPolygonFeature,
  GisPolygonFeatureCollection,
} from '../data/types'
import {
  GIS_BOUNDARY_FILL_LAYER,
  GIS_POINT_LAYER,
  ensureGisLayers,
  setBoundarySourceData,
  setHoveredBoundary,
  setHoveredPoint,
  setPreviewGeometry,
  setPointSourceData,
  setSelectedBoundary,
  setSelectedPoint,
} from '../lib/layers'
import { getGisMapStyleUrl } from '../lib/styles'

type GisMapShellProps = {
  className?: string
  featureCollection: GisPolygonFeatureCollection
  pointFeatureCollection?: GisPointFeatureCollection | null
  selectedId: string | null
  selectedPointId?: string | null
  draggablePointId?: string | null
  previewGeometry: GisGeometry | null
  onPolygonClick: (id: string, popup: GisMapPopupState) => void
  onPointClick?: (id: string, popup: GisMapPopupState) => void
  onPointDrag?: (coordinates: { lat: number; lng: number }) => void
  onPointDragEnd?: (coordinates: { lat: number; lng: number }) => void
  onMapClick?: (event: MapMouseEvent) => void
  onMapMoveStart?: () => void
  initialFitScope?: 'all' | 'boundaries'
  fitKey?: number | string
  children?: React.ReactNode
}

export function GisMapShell({
  className,
  featureCollection,
  pointFeatureCollection,
  selectedId,
  selectedPointId,
  draggablePointId,
  previewGeometry,
  onPolygonClick,
  onPointClick,
  onPointDrag,
  onPointDragEnd,
  onMapClick,
  onMapMoveStart,
  initialFitScope = 'all',
  fitKey,
  children,
}: GisMapShellProps) {
  const { resolvedTheme } = useTheme()
  const mode = resolvedTheme === 'dark' ? 'dark' : 'light'
  const styleUrl = getGisMapStyleUrl(mode)
  const mapRef = useRef<MapLibreMap | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const initialStyleUrlRef = useRef(styleUrl)
  const currentStyleRef = useRef<string | null>(null)
  const mapReadyRef = useRef(false)
  const interactionsReadyRef = useRef(false)
  const pointInteractionsReadyRef = useRef(false)
  const hoveredIdRef = useRef<string | null>(null)
  const hoveredPointIdRef = useRef<string | null>(null)
  const polygonClickRef = useRef(onPolygonClick)
  const pointClickRef = useRef(onPointClick)
  const pointDragRef = useRef(onPointDrag)
  const pointDragEndRef = useRef(onPointDragEnd)
  const draggablePointIdRef = useRef<string | null>(draggablePointId ?? null)
  const fitKeyRef = useRef<number | string | undefined>(undefined)
  const mapClickRef = useRef(onMapClick)
  const moveStartRef = useRef(onMapMoveStart)
  const hydrateLayersRef = useRef<(map: MapLibreMap) => void>(() => undefined)
  const fitBoundsRef = useRef<[[number, number], [number, number]] | null>(
    null
  )
  const draggingPointIdRef = useRef<string | null>(null)

  const boundaryBounds = useMemo(
    () => getGeometryBounds(featureCollection.features.map((feature) => feature.geometry)),
    [featureCollection]
  )

  const allGeometryBounds = useMemo(
    () =>
      getGeometryBounds(
        [
          ...featureCollection.features.map((feature) => feature.geometry),
          ...(pointFeatureCollection?.features.map((feature) => feature.geometry) ?? []),
        ]
      ),
    [featureCollection, pointFeatureCollection]
  )

  const fitBounds = useMemo(
    () => (initialFitScope === 'boundaries' ? boundaryBounds : allGeometryBounds),
    [allGeometryBounds, boundaryBounds, initialFitScope]
  )

  const hydrateLayers = useCallback(
    (map: MapLibreMap) => {
      ensureGisLayers(
        map,
        featureCollection,
        previewGeometry,
        selectedId,
        hoveredIdRef.current,
        mode,
        pointFeatureCollection,
        selectedPointId ?? null,
        hoveredPointIdRef.current
      )
      registerInteractionsOnce(
        map,
        interactionsReadyRef,
        hoveredIdRef,
        polygonClickRef
      )
      registerPointInteractionsOnce(
        map,
        pointInteractionsReadyRef,
        hoveredPointIdRef,
        draggingPointIdRef,
        draggablePointIdRef,
        pointDragRef,
        pointClickRef,
        pointDragEndRef
      )
    },
    [featureCollection, mode, pointFeatureCollection, previewGeometry, selectedId, selectedPointId]
  )

  useEffect(() => {
    polygonClickRef.current = onPolygonClick
  }, [onPolygonClick])

  useEffect(() => {
    pointClickRef.current = onPointClick
  }, [onPointClick])

  useEffect(() => {
    pointDragRef.current = onPointDrag
  }, [onPointDrag])

  useEffect(() => {
    pointDragEndRef.current = onPointDragEnd
  }, [onPointDragEnd])

  useEffect(() => {
    draggablePointIdRef.current = draggablePointId ?? null
  }, [draggablePointId])

  useEffect(() => {
    if (fitKey === fitKeyRef.current) return
    const prev = fitKeyRef.current
    fitKeyRef.current = fitKey
    if (prev === undefined) return
    const map = mapRef.current
    if (!map || !mapReadyRef.current) return
    const bounds = fitBoundsRef.current
    if (!bounds) return
    map.fitBounds(bounds as LngLatBoundsLike, { padding: 44, duration: 450 })
  }, [fitKey])

  useEffect(() => {
    mapClickRef.current = onMapClick
  }, [onMapClick])

  useEffect(() => {
    moveStartRef.current = onMapMoveStart
  }, [onMapMoveStart])

  useEffect(() => {
    fitBoundsRef.current = fitBounds
  }, [fitBounds])

  useEffect(() => {
    hydrateLayersRef.current = hydrateLayers
  }, [hydrateLayers])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: initialStyleUrlRef.current,
      center: [120.94, 14.32],
      zoom: 11,
      attributionControl: false,
      canvasContextAttributes: { antialias: true },
    })
    currentStyleRef.current = initialStyleUrlRef.current

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true }),
      'bottom-right'
    )

    map.on('load', () => {
      mapReadyRef.current = true
      hydrateLayersRef.current(map)

      if (fitBoundsRef.current) {
        map.fitBounds(fitBoundsRef.current as LngLatBoundsLike, {
          padding: 44,
          duration: 0,
        })
      }
    })

    map.on('dragstart', () => {
      moveStartRef.current?.()
    })

    map.on('zoomstart', () => {
      moveStartRef.current?.()
    })

    map.on('click', (event) => {
      mapClickRef.current?.(event)
    })

    mapRef.current = map

    return () => {
      mapReadyRef.current = false
      mapRef.current = null
      map.remove()
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReadyRef.current || currentStyleRef.current === styleUrl) return

    currentStyleRef.current = styleUrl
    moveStartRef.current?.()
    map.setStyle(styleUrl)
    map.once('style.load', () => {
      hydrateLayers(map)
    })
  }, [hydrateLayers, styleUrl])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReadyRef.current) return

    if (map.getSource('gis-boundaries')) {
      setBoundarySourceData(map, featureCollection)
    } else {
      hydrateLayersRef.current(map)
    }
  }, [featureCollection])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReadyRef.current || !pointFeatureCollection) return

    if (map.getSource('gis-points')) {
      setPointSourceData(map, pointFeatureCollection)
    } else {
      hydrateLayersRef.current(map)
    }
  }, [pointFeatureCollection])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReadyRef.current) return

    setSelectedBoundary(map, selectedId)
  }, [selectedId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReadyRef.current) return

    setSelectedPoint(map, selectedPointId ?? null)
  }, [selectedPointId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReadyRef.current) return

    setPreviewGeometry(map, previewGeometry)
  }, [previewGeometry])

  function fitCity() {
    const map = mapRef.current
    if (!map || !fitBounds) return

    map.fitBounds(fitBounds as LngLatBoundsLike, {
      padding: 44,
      duration: 450,
    })
  }

  function requestFullscreen() {
    containerRef.current?.requestFullscreen?.()
  }

  return (
    <div
      className={cn(
        'relative h-full min-h-[480px] overflow-hidden rounded-md border bg-muted',
        className
      )}
    >
      <div className='absolute right-3 top-3 z-10 flex gap-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label='Fit map to visible boundaries'
              onClick={fitCity}
              size='icon'
              variant='secondary'
            >
              <LocateFixedIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit boundaries</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label='Open map fullscreen'
              onClick={requestFullscreen}
              size='icon'
              variant='secondary'
            >
              <ExpandIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fullscreen</TooltipContent>
        </Tooltip>
      </div>

      <div className='h-full w-full' ref={containerRef} />
      {children}
    </div>
  )
}

function registerInteractionsOnce(
  map: MapLibreMap,
  interactionsReadyRef: React.MutableRefObject<boolean>,
  hoveredIdRef: React.MutableRefObject<string | null>,
  polygonClickRef: React.MutableRefObject<
    (id: string, popup: GisMapPopupState) => void
  >
) {
  if (interactionsReadyRef.current) return

  map.on('click', GIS_BOUNDARY_FILL_LAYER, (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0] as GisPolygonFeature | undefined
    const id = feature?.properties?.id

    if (typeof id === 'string') {
      polygonClickRef.current(id, {
        id,
        lngLat: {
          lng: event.lngLat.lng,
          lat: event.lngLat.lat,
        },
        point: {
          x: event.point.x,
          y: event.point.y,
        },
      })
    }
  })

  map.on('mousemove', GIS_BOUNDARY_FILL_LAYER, (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0] as GisPolygonFeature | undefined
    const id = feature?.properties?.id ?? null

    if (id !== hoveredIdRef.current) {
      hoveredIdRef.current = id
      setHoveredBoundary(map, id)
    }

    map.getCanvas().style.cursor = id ? 'pointer' : ''
  })

  map.on('mouseleave', GIS_BOUNDARY_FILL_LAYER, () => {
    hoveredIdRef.current = null
    setHoveredBoundary(map, null)
    map.getCanvas().style.cursor = ''
  })

  interactionsReadyRef.current = true
}

function registerPointInteractionsOnce(
  map: MapLibreMap,
  interactionsReadyRef: React.MutableRefObject<boolean>,
  hoveredIdRef: React.MutableRefObject<string | null>,
  draggingPointIdRef: React.MutableRefObject<string | null>,
  draggablePointIdRef: React.MutableRefObject<string | null>,
  pointDragRef: React.MutableRefObject<
    ((coordinates: { lat: number; lng: number }) => void) | undefined
  >,
  pointClickRef: React.MutableRefObject<
    ((id: string, popup: GisMapPopupState) => void) | undefined
  >,
  pointDragEndRef?: React.MutableRefObject<
    ((coordinates: { lat: number; lng: number }) => void) | undefined
  >
) {
  if (interactionsReadyRef.current) return

  let lastDragCoords: { lat: number; lng: number } | null = null

  map.on('click', GIS_POINT_LAYER, (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0] as GisPointFeature | undefined
    const id = feature?.properties?.id

    if (typeof id === 'string') {
      pointClickRef.current?.(id, {
        id,
        lngLat: {
          lng: event.lngLat.lng,
          lat: event.lngLat.lat,
        },
        point: {
          x: event.point.x,
          y: event.point.y,
        },
      })
    }
  })

  map.on('mousemove', GIS_POINT_LAYER, (event: MapLayerMouseEvent) => {
    if (draggingPointIdRef.current) {
      map.getCanvas().style.cursor = 'grabbing'
      return
    }

    const feature = event.features?.[0] as GisPointFeature | undefined
    const id = feature?.properties?.id ?? null

    if (id !== hoveredIdRef.current) {
      hoveredIdRef.current = id
      setHoveredPoint(map, id)
    }

    map.getCanvas().style.cursor = id ? 'pointer' : ''
  })

  map.on('mousedown', GIS_POINT_LAYER, (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0] as GisPointFeature | undefined
    const id = feature?.properties?.id

    if (
      typeof id !== 'string' ||
      id !== draggablePointIdRef.current ||
      !pointDragRef.current
    ) {
      return
    }

    draggingPointIdRef.current = id
    map.getCanvas().style.cursor = 'grabbing'

    if (map.dragPan.isEnabled()) {
      map.dragPan.disable()
    }

    const startCoords = { lat: event.lngLat.lat, lng: event.lngLat.lng }
    lastDragCoords = startCoords
    pointDragRef.current(startCoords)
  })

  map.on('mousemove', (event: MapMouseEvent) => {
    if (!draggingPointIdRef.current || !pointDragRef.current) return

    const coords = { lat: event.lngLat.lat, lng: event.lngLat.lng }
    lastDragCoords = coords
    pointDragRef.current(coords)
    map.getCanvas().style.cursor = 'grabbing'
  })

  const finishPointDrag = () => {
    if (!draggingPointIdRef.current) return

    const finalCoords = lastDragCoords
    lastDragCoords = null
    draggingPointIdRef.current = null
    map.getCanvas().style.cursor = ''

    if (!map.dragPan.isEnabled()) {
      map.dragPan.enable()
    }

    if (finalCoords && pointDragEndRef?.current) {
      pointDragEndRef.current(finalCoords)
    }
  }

  map.on('mouseup', finishPointDrag)
  map.on('mouseleave', finishPointDrag)

  map.on('mouseleave', GIS_POINT_LAYER, () => {
    if (draggingPointIdRef.current) return

    hoveredIdRef.current = null
    setHoveredPoint(map, null)
    map.getCanvas().style.cursor = ''
  })

  interactionsReadyRef.current = true
}

function getGeometryBounds(geometries: GisGeometry[]) {
  let minLng = Number.POSITIVE_INFINITY
  let minLat = Number.POSITIVE_INFINITY
  let maxLng = Number.NEGATIVE_INFINITY
  let maxLat = Number.NEGATIVE_INFINITY

  for (const geometry of geometries) {
    visitPositions(geometry, ([lng, lat]) => {
      minLng = Math.min(minLng, lng)
      minLat = Math.min(minLat, lat)
      maxLng = Math.max(maxLng, lng)
      maxLat = Math.max(maxLat, lat)
    })
  }

  if (!Number.isFinite(minLng)) return null

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ] as [[number, number], [number, number]]
}

function visitPositions(
  geometry: GisGeometry,
  visit: (position: [number, number]) => void
) {
  if (geometry.type === 'Point') {
    visit([geometry.coordinates[0], geometry.coordinates[1]])
    return
  }

  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates) {
      for (const position of ring) {
        visit([position[0], position[1]])
      }
    }
    return
  }

  for (const polygon of geometry.coordinates) {
    for (const ring of polygon) {
      for (const position of ring) {
        visit([position[0], position[1]])
      }
    }
  }
}
