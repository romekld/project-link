import { useEffect, useRef } from 'react'
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type maplibregl from 'maplibre-gl'
import { useMap } from '@/components/ui/map'

interface RegistryMapSurfaceProps {
  featureCollection: FeatureCollection<Polygon | MultiPolygon, {
    ADM4_PCODE: string
    ADM4_EN: string
    inCho2Scope: boolean
  }>
  initialBounds: [[number, number], [number, number]] | null
  selectedCode: string | null
  reviewGeometry: Polygon | MultiPolygon | null
  onSelectCode: (code: string | null) => void
}

const REGISTRY_SOURCE_ID = 'city-barangay-registry-source'
const REGISTRY_FILL_LAYER_ID = 'city-barangay-registry-fill'
const REGISTRY_OUTLINE_LAYER_ID = 'city-barangay-registry-outline'
const REGISTRY_SELECTED_LAYER_ID = 'city-barangay-registry-selected'
const REGISTRY_REVIEW_SOURCE_ID = 'city-barangay-registry-review'
const REGISTRY_REVIEW_LAYER_ID = 'city-barangay-registry-review-outline'

export function RegistryMapSurface({
  featureCollection,
  initialBounds,
  selectedCode,
  reviewGeometry,
  onSelectCode,
}: RegistryMapSurfaceProps) {
  const { map, isLoaded } = useMap()
  const hasFitToBounds = useRef(false)

  useEffect(() => {
    if (!map || !isLoaded) return

    if (!map.getSource(REGISTRY_SOURCE_ID)) {
      map.addSource(REGISTRY_SOURCE_ID, {
        type: 'geojson',
        data: featureCollection,
      })
    }

    if (!map.getSource(REGISTRY_REVIEW_SOURCE_ID)) {
      map.addSource(REGISTRY_REVIEW_SOURCE_ID, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
    }

    if (!map.getLayer(REGISTRY_FILL_LAYER_ID)) {
      map.addLayer({
        id: REGISTRY_FILL_LAYER_ID,
        type: 'fill',
        source: REGISTRY_SOURCE_ID,
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['get', 'inCho2Scope'], false],
            '#dcfce7',
            '#e2e8f0',
          ],
          'fill-opacity': 0.55,
        },
      })
    }

    if (!map.getLayer(REGISTRY_OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: REGISTRY_OUTLINE_LAYER_ID,
        type: 'line',
        source: REGISTRY_SOURCE_ID,
        paint: {
          'line-color': '#0f172a',
          'line-opacity': 0.22,
          'line-width': 1,
        },
      })
    }

    if (!map.getLayer(REGISTRY_SELECTED_LAYER_ID)) {
      map.addLayer({
        id: REGISTRY_SELECTED_LAYER_ID,
        type: 'line',
        source: REGISTRY_SOURCE_ID,
        filter: ['==', ['get', 'ADM4_PCODE'], ''],
        paint: {
          'line-color': '#2563eb',
          'line-width': 3,
        },
      })
    }

    if (!map.getLayer(REGISTRY_REVIEW_LAYER_ID)) {
      map.addLayer({
        id: REGISTRY_REVIEW_LAYER_ID,
        type: 'line',
        source: REGISTRY_REVIEW_SOURCE_ID,
        paint: {
          'line-color': '#f97316',
          'line-width': 3,
        },
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
      onSelectCode(code ?? null)
    }

    map.on('mouseenter', REGISTRY_FILL_LAYER_ID, handleEnter)
    map.on('mouseleave', REGISTRY_FILL_LAYER_ID, handleLeave)
    map.on('click', REGISTRY_FILL_LAYER_ID, handleClick)

    return () => {
      map.off('mouseenter', REGISTRY_FILL_LAYER_ID, handleEnter)
      map.off('mouseleave', REGISTRY_FILL_LAYER_ID, handleLeave)
      map.off('click', REGISTRY_FILL_LAYER_ID, handleClick)
    }
  }, [featureCollection, isLoaded, map, onSelectCode])

  useEffect(() => {
    if (!map || !isLoaded) return

    const source = map.getSource(REGISTRY_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    const reviewSource = map.getSource(REGISTRY_REVIEW_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!source || !reviewSource) return

    source.setData(featureCollection)
    map.setFilter(REGISTRY_SELECTED_LAYER_ID, ['==', ['get', 'ADM4_PCODE'], selectedCode ?? ''])
    reviewSource.setData(
      reviewGeometry
        ? {
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: reviewGeometry, properties: {} }],
          }
        : { type: 'FeatureCollection', features: [] },
    )

    if (!hasFitToBounds.current && initialBounds) {
      hasFitToBounds.current = true
      map.fitBounds(initialBounds, {
        padding: { top: 56, right: 56, bottom: 56, left: 56 },
        duration: 0,
      })
    }
  }, [featureCollection, initialBounds, isLoaded, map, reviewGeometry, selectedCode])

  return null
}
