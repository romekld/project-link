import { useEffect, useMemo, useRef } from 'react'
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type maplibregl from 'maplibre-gl'
import { useMap } from '@/components/ui/map'
import type { CoveragePlannerRecord } from '@/features/intelligence/types'
import { getCoverageStatus, getEffectiveScope } from './constants'

interface CoveragePlannerMapSurfaceProps {
  baseFeatureCollection: FeatureCollection<Polygon | MultiPolygon, { ADM4_PCODE: string; ADM4_EN: string }>
  initialBounds: [[number, number], [number, number]] | null
  records: CoveragePlannerRecord[]
  selectedCode: string | null
  onSelectCode: (code: string | null, coordinates?: [number, number]) => void
}

const MAP_SOURCE_ID = 'coverage-planner-barangays'
const MAP_FILL_LAYER_ID = 'coverage-planner-fill'
const MAP_OUTLINE_LAYER_ID = 'coverage-planner-outline'
const MAP_SELECTED_LAYER_ID = 'coverage-planner-selected'

export function CoveragePlannerMapSurface({
  baseFeatureCollection,
  initialBounds,
  records,
  selectedCode,
  onSelectCode,
}: CoveragePlannerMapSurfaceProps) {
  const { map, isLoaded } = useMap()
  const hasFitToBounds = useRef(false)

  const recordsByCode = useMemo(
    () => new Map(records.map((record) => [record.barangayCode, record])),
    [records],
  )

  const plannerFeatureCollection = useMemo(
    () => ({
      ...baseFeatureCollection,
      features: baseFeatureCollection.features.map((feature) => {
        const record = recordsByCode.get(feature.properties.ADM4_PCODE)
        const status = record ? getCoverageStatus(record).label : 'Outside CHO2'
        const effectiveScope = record ? getEffectiveScope(record) : false

        return {
          ...feature,
          properties: {
            ...feature.properties,
            plannerStatus: status,
            plannerScope: effectiveScope,
          },
        }
      }),
    }),
    [baseFeatureCollection, recordsByCode],
  )

  useEffect(() => {
    if (!map || !isLoaded) return

    if (!map.getSource(MAP_SOURCE_ID)) {
      map.addSource(MAP_SOURCE_ID, {
        type: 'geojson',
        data: baseFeatureCollection,
      })
    }

    if (!map.getLayer(MAP_FILL_LAYER_ID)) {
      map.addLayer({
        id: MAP_FILL_LAYER_ID,
        type: 'fill',
        source: MAP_SOURCE_ID,
        paint: {
          'fill-color': [
            'match',
            ['get', 'plannerStatus'],
            'Staged add',
            '#0f766e',
            'Staged remove',
            '#dc2626',
            'In CHO2',
            '#22c55e',
            '#cbd5e1',
          ],
          'fill-opacity': 0.62,
        },
      })
    }

    if (!map.getLayer(MAP_OUTLINE_LAYER_ID)) {
      map.addLayer({
        id: MAP_OUTLINE_LAYER_ID,
        type: 'line',
        source: MAP_SOURCE_ID,
        paint: {
          'line-color': '#0f172a',
          'line-opacity': 0.22,
          'line-width': 1,
        },
      })
    }

    if (!map.getLayer(MAP_SELECTED_LAYER_ID)) {
      map.addLayer({
        id: MAP_SELECTED_LAYER_ID,
        type: 'line',
        source: MAP_SOURCE_ID,
        filter: ['==', ['get', 'ADM4_PCODE'], ''],
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
      if (!code) return
      onSelectCode(code, [event.lngLat.lng, event.lngLat.lat])
    }

    map.on('mouseenter', MAP_FILL_LAYER_ID, handleEnter)
    map.on('mouseleave', MAP_FILL_LAYER_ID, handleLeave)
    map.on('click', MAP_FILL_LAYER_ID, handleClick)

    return () => {
      map.off('mouseenter', MAP_FILL_LAYER_ID, handleEnter)
      map.off('mouseleave', MAP_FILL_LAYER_ID, handleLeave)
      map.off('click', MAP_FILL_LAYER_ID, handleClick)
    }
  }, [baseFeatureCollection, isLoaded, map, onSelectCode])

  useEffect(() => {
    if (!map || !isLoaded) return

    const source = map.getSource(MAP_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!source) return

    source.setData(plannerFeatureCollection)
    map.setFilter(MAP_SELECTED_LAYER_ID, ['==', ['get', 'ADM4_PCODE'], selectedCode ?? ''])

    const nextBounds = initialBounds
    if (!hasFitToBounds.current && nextBounds) {
      hasFitToBounds.current = true
      map.fitBounds(nextBounds, {
        padding: { top: 56, right: 56, bottom: 56, left: 56 },
        duration: 0,
      })
    }
  }, [plannerFeatureCollection, initialBounds, isLoaded, map, selectedCode])

  return null
}
