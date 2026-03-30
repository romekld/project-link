import { useEffect, useRef, useState } from 'react'
import type maplibregl from 'maplibre-gl'
import { MapControls, useMap } from '@/components/ui/map'
import type { GeoLayerId, IntelligenceFixtures } from '@/features/intelligence/types'
import { mapColorScale, type MapProvider } from './constants'

interface MapLayerSurfaceProps {
  fixtures: IntelligenceFixtures
  selectedCode: string | null
  visibleLayers: GeoLayerId[]
  onSelectCode: (code: string) => void
}

const SOURCE_IDS = {
  barangays: 'intelligence-barangays',
  cho2: 'intelligence-cho2',
  heat: 'intelligence-heat',
} as const

const LAYER_IDS = {
  barangaysFill: 'intelligence-barangays-fill',
  barangaysOutline: 'intelligence-barangays-outline',
  hoverOutline: 'intelligence-hover-outline',
  selectedOutline: 'intelligence-selected-outline',
  cho2Outline: 'intelligence-cho2-outline',
  heatLayer: 'intelligence-heat-layer',
  heatHotspots: 'intelligence-heat-hotspots',
} as const

function ensureSources(map: maplibregl.Map, fixtures: IntelligenceFixtures) {
  if (!map.getSource(SOURCE_IDS.barangays)) {
    map.addSource(SOURCE_IDS.barangays, {
      type: 'geojson',
      data: fixtures.dasmarinas,
    })
  }

  if (!map.getSource(SOURCE_IDS.cho2)) {
    map.addSource(SOURCE_IDS.cho2, {
      type: 'geojson',
      data: fixtures.cho2,
    })
  }

  if (!map.getSource(SOURCE_IDS.heat)) {
    map.addSource(SOURCE_IDS.heat, {
      type: 'geojson',
      data: fixtures.diseaseHeat,
    })
  }
}

function ensureLayers(map: maplibregl.Map) {
  if (!map.getLayer(LAYER_IDS.barangaysFill)) {
    map.addLayer({
      id: LAYER_IDS.barangaysFill,
      type: 'fill',
      source: SOURCE_IDS.barangays,
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

  if (!map.getLayer(LAYER_IDS.barangaysOutline)) {
    map.addLayer({
      id: LAYER_IDS.barangaysOutline,
      type: 'line',
      source: SOURCE_IDS.barangays,
      paint: {
        'line-color': '#0f172a',
        'line-opacity': 0.18,
        'line-width': 1,
      },
    })
  }

  if (!map.getLayer(LAYER_IDS.hoverOutline)) {
    map.addLayer({
      id: LAYER_IDS.hoverOutline,
      type: 'line',
      source: SOURCE_IDS.barangays,
      filter: ['==', ['get', 'ADM4_PCODE'], ''],
      paint: {
        'line-color': '#14532d',
        'line-width': 2.25,
      },
    })
  }

  if (!map.getLayer(LAYER_IDS.selectedOutline)) {
    map.addLayer({
      id: LAYER_IDS.selectedOutline,
      type: 'line',
      source: SOURCE_IDS.barangays,
      filter: ['==', ['get', 'ADM4_PCODE'], ''],
      paint: {
        'line-color': '#f97316',
        'line-width': 3,
      },
    })
  }

  if (!map.getLayer(LAYER_IDS.cho2Outline)) {
    map.addLayer({
      id: LAYER_IDS.cho2Outline,
      type: 'line',
      source: SOURCE_IDS.cho2,
      paint: {
        'line-color': '#0f766e',
        'line-width': 2,
        'line-opacity': 0.9,
      },
    })
  }

  if (!map.getLayer(LAYER_IDS.heatLayer)) {
    map.addLayer({
      id: LAYER_IDS.heatLayer,
      type: 'heatmap',
      source: SOURCE_IDS.heat,
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

  if (!map.getLayer(LAYER_IDS.heatHotspots)) {
    map.addLayer({
      id: LAYER_IDS.heatHotspots,
      type: 'circle',
      source: SOURCE_IDS.heat,
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
}

function syncSourceData(map: maplibregl.Map, fixtures: IntelligenceFixtures) {
  ;(map.getSource(SOURCE_IDS.barangays) as maplibregl.GeoJSONSource).setData(fixtures.dasmarinas)
  ;(map.getSource(SOURCE_IDS.cho2) as maplibregl.GeoJSONSource).setData(fixtures.cho2)
  ;(map.getSource(SOURCE_IDS.heat) as maplibregl.GeoJSONSource).setData(fixtures.diseaseHeat)
}

function setLayerVisibility(map: maplibregl.Map, layerId: string, visibility: 'visible' | 'none') {
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visibility)
  }
}

function syncLayerVisibility(map: maplibregl.Map, visibleLayers: GeoLayerId[]) {
  const choroplethVisibility = visibleLayers.includes('choropleth') ? 'visible' : 'none'
  const scopeVisibility = visibleLayers.includes('scope') ? 'visible' : 'none'
  const heatVisibility = visibleLayers.includes('diseaseHeat') ? 'visible' : 'none'

  setLayerVisibility(map, LAYER_IDS.barangaysFill, choroplethVisibility)
  setLayerVisibility(map, LAYER_IDS.barangaysOutline, choroplethVisibility)
  setLayerVisibility(map, LAYER_IDS.hoverOutline, choroplethVisibility)
  setLayerVisibility(map, LAYER_IDS.selectedOutline, choroplethVisibility)
  setLayerVisibility(map, LAYER_IDS.cho2Outline, scopeVisibility)
  setLayerVisibility(map, LAYER_IDS.heatLayer, heatVisibility)
  setLayerVisibility(map, LAYER_IDS.heatHotspots, heatVisibility)
}

function syncSelectionFilters(map: maplibregl.Map, hoveredCode: string | null, selectedCode: string | null) {
  if (map.getLayer(LAYER_IDS.hoverOutline)) {
    map.setFilter(LAYER_IDS.hoverOutline, ['==', ['get', 'ADM4_PCODE'], hoveredCode ?? ''])
  }

  if (map.getLayer(LAYER_IDS.selectedOutline)) {
    map.setFilter(LAYER_IDS.selectedOutline, ['==', ['get', 'ADM4_PCODE'], selectedCode ?? ''])
  }
}

interface ProviderControlProps {
  mapProvider: MapProvider
  onProviderChange: (provider: MapProvider) => void
}

export function MapProviderControls({ mapProvider, onProviderChange }: ProviderControlProps) {
  return (
    <MapControls
      position="bottom-right"
      showZoom
      showFullscreen
      showProviderToggle
      mapProvider={mapProvider}
      onProviderChange={onProviderChange}
    />
  )
}

export function MapLayerSurface({ fixtures, selectedCode, visibleLayers, onSelectCode }: MapLayerSurfaceProps) {
  const { map, isLoaded } = useMap()
  const hasFitToBounds = useRef(false)
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)

  useEffect(() => {
    if (!map || !isLoaded) {
      return
    }

    ensureSources(map, fixtures)
    ensureLayers(map)
    syncSourceData(map, fixtures)

    if (!hasFitToBounds.current) {
      hasFitToBounds.current = true
      map.fitBounds(fixtures.initialBounds, {
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        duration: 0,
      })
      map.zoomTo(map.getZoom() + 0.25, { duration: 0 })
    }
  }, [fixtures, isLoaded, map])

  useEffect(() => {
    if (!map || !isLoaded) {
      return
    }

    syncLayerVisibility(map, visibleLayers)
  }, [isLoaded, map, visibleLayers])

  useEffect(() => {
    if (!map || !isLoaded) {
      return
    }

    syncSelectionFilters(map, hoveredCode, selectedCode)
  }, [hoveredCode, isLoaded, map, selectedCode])

  useEffect(() => {
    if (!map || !isLoaded || !map.getLayer(LAYER_IDS.barangaysFill)) {
      return
    }

    const handleEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }

    const handleMove = (event: maplibregl.MapMouseEvent) => {
      const [feature] = map.queryRenderedFeatures(event.point, {
        layers: [LAYER_IDS.barangaysFill],
      })

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

    map.on('mouseenter', LAYER_IDS.barangaysFill, handleEnter)
    map.on('mousemove', LAYER_IDS.barangaysFill, handleMove)
    map.on('mouseleave', LAYER_IDS.barangaysFill, handleLeave)
    map.on('click', LAYER_IDS.barangaysFill, handleClick)

    return () => {
      map.off('mouseenter', LAYER_IDS.barangaysFill, handleEnter)
      map.off('mousemove', LAYER_IDS.barangaysFill, handleMove)
      map.off('mouseleave', LAYER_IDS.barangaysFill, handleLeave)
      map.off('click', LAYER_IDS.barangaysFill, handleClick)
    }
  }, [isLoaded, map, onSelectCode])

  return null
}
