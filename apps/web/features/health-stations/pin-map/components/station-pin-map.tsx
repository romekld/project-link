'use client'

import type { ReactNode } from 'react'
import type { MapMouseEvent } from 'maplibre-gl'
import { GisMapShell } from '@/features/gis-map/components/gis-map-shell'
import type {
  GisMapPopupState,
  GisPointFeatureCollection,
  GisPolygonFeatureCollection,
} from '@/features/gis-map/data/types'

type StationPinMapProps = {
  boundaryCollection: GisPolygonFeatureCollection
  pointCollection: GisPointFeatureCollection
  selectedBoundaryId: string | null
  selectedPointId: string | null
  draggablePointId?: string | null
  onPointDrag?: (coordinates: { lat: number; lng: number }) => void
  onPointDragEnd?: (coordinates: { lat: number; lng: number }) => void
  initialFitScope?: 'all' | 'boundaries'
  fitKey?: number | string
  onBoundaryClick: (id: string, popup: GisMapPopupState) => void
  onPointClick?: (id: string, popup: GisMapPopupState) => void
  onMapClick?: (event: MapMouseEvent) => void
  onMapMoveStart?: () => void
  className?: string
  children?: ReactNode
}

export function StationPinMap({
  boundaryCollection,
  pointCollection,
  selectedBoundaryId,
  selectedPointId,
  draggablePointId,
  onPointDrag,
  onPointDragEnd,
  initialFitScope,
  fitKey,
  onBoundaryClick,
  onPointClick,
  onMapClick,
  onMapMoveStart,
  className,
  children,
}: StationPinMapProps) {
  return (
    <GisMapShell
      className={className}
      featureCollection={boundaryCollection}
      pointFeatureCollection={pointCollection}
      draggablePointId={draggablePointId}
      fitKey={fitKey}
      initialFitScope={initialFitScope}
      onMapClick={onMapClick}
      onMapMoveStart={onMapMoveStart}
      onPointDrag={onPointDrag}
      onPointDragEnd={onPointDragEnd}
      onPointClick={onPointClick}
      onPolygonClick={onBoundaryClick}
      previewGeometry={null}
      selectedId={selectedBoundaryId}
      selectedPointId={selectedPointId}
    >
      {children}
    </GisMapShell>
  )
}