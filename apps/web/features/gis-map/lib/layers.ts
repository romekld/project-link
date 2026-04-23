import type {
  FilterSpecification,
  GeoJSONSource,
  Map as MapLibreMap,
} from 'maplibre-gl'
import type {
  GisMapStyleMode,
  GisPointFeatureCollection,
  GisPolygonFeatureCollection,
  GisPreviewFeatureCollection,
} from '../data/types'
import type { GisGeometry } from '../data/types'

export const GIS_BOUNDARY_SOURCE = 'gis-boundaries'
export const GIS_BOUNDARY_FILL_LAYER = 'gis-boundaries-fill'
export const GIS_BOUNDARY_LINE_LAYER = 'gis-boundaries-line'
export const GIS_BOUNDARY_HOVER_FILL_LAYER = 'gis-boundaries-hover-fill'
export const GIS_BOUNDARY_HOVER_LINE_LAYER = 'gis-boundaries-hover-line'
export const GIS_BOUNDARY_SELECTED_LINE_LAYER = 'gis-boundaries-selected-line'
export const GIS_PREVIEW_SOURCE = 'gis-preview'
export const GIS_PREVIEW_FILL_LAYER = 'gis-preview-fill'
export const GIS_PREVIEW_LINE_LAYER = 'gis-preview-line'
export const GIS_POINT_SOURCE = 'gis-points'
export const GIS_POINT_HALO_LAYER = 'gis-points-halo'
export const GIS_POINT_LAYER = 'gis-points-layer'
export const GIS_POINT_HOVER_LAYER = 'gis-points-hover'
export const GIS_POINT_SELECTED_LAYER = 'gis-points-selected'

type SourceData = Parameters<GeoJSONSource['setData']>[0]

export function setBoundarySourceData(
  map: MapLibreMap,
  featureCollection: GisPolygonFeatureCollection
) {
  const source = map.getSource(GIS_BOUNDARY_SOURCE) as GeoJSONSource | undefined
  source?.setData(featureCollection as SourceData)
}

export function setSelectedBoundary(map: MapLibreMap, id: string | null) {
  if (!map.getLayer(GIS_BOUNDARY_SELECTED_LINE_LAYER)) return

  map.setFilter(GIS_BOUNDARY_SELECTED_LINE_LAYER, [
    '==',
    ['get', 'id'],
    id ?? '',
  ])
}

export function setHoveredBoundary(map: MapLibreMap, id: string | null) {
  const filter: FilterSpecification = ['==', ['get', 'id'], id ?? '']

  if (map.getLayer(GIS_BOUNDARY_HOVER_FILL_LAYER)) {
    map.setFilter(GIS_BOUNDARY_HOVER_FILL_LAYER, filter)
  }

  if (map.getLayer(GIS_BOUNDARY_HOVER_LINE_LAYER)) {
    map.setFilter(GIS_BOUNDARY_HOVER_LINE_LAYER, filter)
  }
}

export function setPreviewGeometry(
  map: MapLibreMap,
  geometry: GisGeometry | null
) {
  const source = map.getSource(GIS_PREVIEW_SOURCE) as GeoJSONSource | undefined
  source?.setData(toPreviewFeatureCollection(geometry) as SourceData)
}

export function setPointSourceData(
  map: MapLibreMap,
  pointCollection: GisPointFeatureCollection
) {
  const source = map.getSource(GIS_POINT_SOURCE) as GeoJSONSource | undefined
  source?.setData(pointCollection as SourceData)
}

export function ensureGisLayers(
  map: MapLibreMap,
  featureCollection: GisPolygonFeatureCollection,
  previewGeometry: GisGeometry | null,
  selectedId: string | null,
  hoveredId: string | null,
  mode: GisMapStyleMode,
  pointCollection?: GisPointFeatureCollection | null,
  selectedPointId?: string | null,
  hoveredPointId?: string | null
) {
  const beforeId = getFirstSymbolLayerId(map)
  const colors = getBoundaryColors(mode)

  if (!map.getSource(GIS_BOUNDARY_SOURCE)) {
    map.addSource(GIS_BOUNDARY_SOURCE, {
      type: 'geojson',
      data: featureCollection as SourceData,
    })
  } else {
    setBoundarySourceData(map, featureCollection)
  }

  if (!map.getLayer(GIS_BOUNDARY_FILL_LAYER)) {
    map.addLayer(
      {
        id: GIS_BOUNDARY_FILL_LAYER,
        type: 'fill',
        source: GIS_BOUNDARY_SOURCE,
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'stagedAction'], 'add'],
            colors.stagedAddFill,
            ['==', ['get', 'stagedAction'], 'remove'],
            colors.stagedRemoveFill,
            ['==', ['get', 'inCho2Scope'], true],
            colors.inScopeFill,
            colors.outsideFill,
          ],
          'fill-opacity': [
            'case',
            ['==', ['get', 'stagedAction'], 'add'],
            colors.stagedFillOpacity,
            ['==', ['get', 'stagedAction'], 'remove'],
            colors.stagedFillOpacity,
            ['==', ['get', 'inCho2Scope'], true],
            colors.inScopeFillOpacity,
            colors.outsideFillOpacity,
          ],
        },
      },
      beforeId
    )
  }

  if (!map.getLayer(GIS_BOUNDARY_HOVER_FILL_LAYER)) {
    map.addLayer(
      {
        id: GIS_BOUNDARY_HOVER_FILL_LAYER,
        type: 'fill',
        source: GIS_BOUNDARY_SOURCE,
        filter: ['==', ['get', 'id'], hoveredId ?? ''],
        paint: {
          'fill-color': colors.hoverFill,
          'fill-opacity': colors.hoverFillOpacity,
        },
      },
      beforeId
    )
  }

  if (!map.getLayer(GIS_BOUNDARY_LINE_LAYER)) {
    map.addLayer(
      {
        id: GIS_BOUNDARY_LINE_LAYER,
        type: 'line',
        source: GIS_BOUNDARY_SOURCE,
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'stagedAction'], 'add'],
            colors.stagedAddLine,
            ['==', ['get', 'stagedAction'], 'remove'],
            colors.stagedRemoveLine,
            ['==', ['get', 'inCho2Scope'], true],
            colors.inScopeLine,
            colors.outsideLine,
          ],
          'line-opacity': colors.lineOpacity,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9,
            0.9,
            13,
            1.8,
          ],
        },
      },
      beforeId
    )
  }

  if (!map.getLayer(GIS_BOUNDARY_HOVER_LINE_LAYER)) {
    map.addLayer(
      {
        id: GIS_BOUNDARY_HOVER_LINE_LAYER,
        type: 'line',
        source: GIS_BOUNDARY_SOURCE,
        filter: ['==', ['get', 'id'], hoveredId ?? ''],
        paint: {
          'line-color': colors.hoverLine,
          'line-width': 3,
          'line-opacity': colors.hoverLineOpacity,
        },
      },
      beforeId
    )
  }

  if (!map.getLayer(GIS_BOUNDARY_SELECTED_LINE_LAYER)) {
    map.addLayer(
      {
        id: GIS_BOUNDARY_SELECTED_LINE_LAYER,
        type: 'line',
        source: GIS_BOUNDARY_SOURCE,
        filter: ['==', ['get', 'id'], selectedId ?? ''],
        paint: {
          'line-color': colors.selectedLine,
          'line-width': 4.5,
          'line-opacity': 0.95,
        },
      },
      beforeId
    )
  }

  if (!map.getSource(GIS_PREVIEW_SOURCE)) {
    map.addSource(GIS_PREVIEW_SOURCE, {
      type: 'geojson',
      data: toPreviewFeatureCollection(previewGeometry) as SourceData,
    })
  } else {
    setPreviewGeometry(map, previewGeometry)
  }

  if (!map.getLayer(GIS_PREVIEW_FILL_LAYER)) {
    map.addLayer(
      {
        id: GIS_PREVIEW_FILL_LAYER,
        type: 'fill',
        source: GIS_PREVIEW_SOURCE,
        paint: {
          'fill-color': '#f59e0b',
          'fill-opacity': 0.26,
        },
      },
      beforeId
    )
  }

  if (!map.getLayer(GIS_PREVIEW_LINE_LAYER)) {
    map.addLayer(
      {
        id: GIS_PREVIEW_LINE_LAYER,
        type: 'line',
        source: GIS_PREVIEW_SOURCE,
        paint: {
          'line-color': '#f59e0b',
          'line-dasharray': [2, 1],
          'line-width': 3.5,
        },
      },
      beforeId
    )
  }

  if (pointCollection) {
    if (!map.getSource(GIS_POINT_SOURCE)) {
      map.addSource(GIS_POINT_SOURCE, {
        type: 'geojson',
        data: pointCollection as SourceData,
      })
    } else {
      setPointSourceData(map, pointCollection)
    }

    if (!map.getLayer(GIS_POINT_HALO_LAYER)) {
      map.addLayer(
        {
          id: GIS_POINT_HALO_LAYER,
          type: 'circle',
          source: GIS_POINT_SOURCE,
          paint: {
            'circle-color': [
              'case',
              ['==', ['get', 'pinStatus'], 'pinned'],
              colors.pointPinnedFill,
              ['==', ['get', 'pinStatus'], 'draft'],
              colors.pointDraftFill,
              colors.pointNeedsPinFill,
            ],
            'circle-opacity': 0.18,
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 8, 13, 14],
          },
        },
        beforeId
      )
    }

    if (!map.getLayer(GIS_POINT_LAYER)) {
      map.addLayer(
        {
          id: GIS_POINT_LAYER,
          type: 'circle',
          source: GIS_POINT_SOURCE,
          paint: {
            'circle-color': [
              'case',
              ['==', ['get', 'pinStatus'], 'pinned'],
              colors.pointPinnedFill,
              ['==', ['get', 'pinStatus'], 'draft'],
              colors.pointDraftFill,
              colors.pointNeedsPinFill,
            ],
            'circle-opacity': 0.96,
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 5.5, 13, 8.5],
            'circle-stroke-color': colors.pointStroke,
            'circle-stroke-width': 2,
          },
        },
        beforeId
      )
    }

    if (!map.getLayer(GIS_POINT_HOVER_LAYER)) {
      map.addLayer(
        {
          id: GIS_POINT_HOVER_LAYER,
          type: 'circle',
          source: GIS_POINT_SOURCE,
          filter: ['==', ['get', 'id'], hoveredPointId ?? ''],
          paint: {
            'circle-color': colors.pointHoverFill,
            'circle-opacity': 0.18,
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 10, 13, 16],
            'circle-stroke-color': colors.pointHoverStroke,
            'circle-stroke-width': 2,
          },
        },
        beforeId
      )
    }

    if (!map.getLayer(GIS_POINT_SELECTED_LAYER)) {
      map.addLayer(
        {
          id: GIS_POINT_SELECTED_LAYER,
          type: 'circle',
          source: GIS_POINT_SOURCE,
          filter: ['==', ['get', 'id'], selectedPointId ?? ''],
          paint: {
            'circle-color': colors.pointSelectedFill,
            'circle-opacity': 0.2,
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 11, 13, 18],
            'circle-stroke-color': colors.pointSelectedStroke,
            'circle-stroke-width': 3,
          },
        },
        beforeId
      )
    }
  }

  setHoveredBoundary(map, hoveredId)
  setSelectedBoundary(map, selectedId)
  setHoveredPoint(map, hoveredPointId ?? null)
  setSelectedPoint(map, selectedPointId ?? null)
}

function getBoundaryColors(mode: GisMapStyleMode) {
  if (mode === 'dark') {
    return {
      inScopeFill: '#34d399',
      outsideFill: '#cbd5e1',
      inScopeFillOpacity: 0.3,
      outsideFillOpacity: 0.16,
      inScopeLine: '#a7f3d0',
      outsideLine: '#e2e8f0',
      lineOpacity: 0.88,
      hoverFill: '#60a5fa',
      hoverFillOpacity: 0.24,
      hoverLine: '#bfdbfe',
      hoverLineOpacity: 0.95,
      selectedLine: '#3b82f6',
      stagedAddFill: '#60a5fa',
      stagedRemoveFill: '#f59e0b',
      stagedAddLine: '#bfdbfe',
      stagedRemoveLine: '#fcd34d',
      stagedFillOpacity: 0.32,
      pointPinnedFill: '#38bdf8',
      pointNeedsPinFill: '#94a3b8',
      pointDraftFill: '#f59e0b',
      pointStroke: '#0f172a',
      pointHoverFill: '#60a5fa',
      pointHoverStroke: '#dbeafe',
      pointSelectedFill: '#22c55e',
      pointSelectedStroke: '#dcfce7',
    }
  }

  return {
    inScopeFill: '#1f7a5b',
    outsideFill: '#64748b',
    inScopeFillOpacity: 0.28,
    outsideFillOpacity: 0.14,
    inScopeLine: '#0f513e',
    outsideLine: '#475569',
    lineOpacity: 0.95,
    hoverFill: '#0f5cff',
    hoverFillOpacity: 0.2,
    hoverLine: '#0f5cff',
    hoverLineOpacity: 0.85,
    selectedLine: '#2563eb',
    stagedAddFill: '#2563eb',
    stagedRemoveFill: '#f59e0b',
    stagedAddLine: '#1d4ed8',
    stagedRemoveLine: '#b45309',
    stagedFillOpacity: 0.24,
    pointPinnedFill: '#0284c7',
    pointNeedsPinFill: '#64748b',
    pointDraftFill: '#d97706',
    pointStroke: '#ffffff',
    pointHoverFill: '#3b82f6',
    pointHoverStroke: '#dbeafe',
    pointSelectedFill: '#16a34a',
    pointSelectedStroke: '#dcfce7',
  }
}

function getFirstSymbolLayerId(map: MapLibreMap) {
  return map
    .getStyle()
    .layers?.find((layer) => layer.type === 'symbol')?.id
}

function toPreviewFeatureCollection(
  geometry: GisGeometry | null
): GisPreviewFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: geometry
      ? [
          {
            type: 'Feature',
            geometry,
            properties: {},
          },
        ]
      : [],
  }
}

export function setSelectedPoint(map: MapLibreMap, id: string | null) {
  if (!map.getLayer(GIS_POINT_SELECTED_LAYER)) return

  map.setFilter(GIS_POINT_SELECTED_LAYER, ['==', ['get', 'id'], id ?? ''])
}

export function setHoveredPoint(map: MapLibreMap, id: string | null) {
  const filter: FilterSpecification = ['==', ['get', 'id'], id ?? '']

  if (map.getLayer(GIS_POINT_HOVER_LAYER)) {
    map.setFilter(GIS_POINT_HOVER_LAYER, filter)
  }
}
