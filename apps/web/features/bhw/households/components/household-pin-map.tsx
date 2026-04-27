"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { StationPinMap } from "@/features/health-stations/pin-map/components/station-pin-map"
import {
  isPointInGeometry,
  getGeometryCentroid,
} from "@/features/health-stations/pin-map/data"
import type {
  GisPointFeature,
  GisPointFeatureCollection,
  GisPolygonFeatureCollection,
} from "@/features/gis-map/data/types"

type PinCoordinates = { lat: number; lng: number }

type HouseholdPinMapProps = {
  barangayBoundary: GisPolygonFeatureCollection | null
  barangayId: string | null
  currentPin: PinCoordinates | null
  onPinChange: (pin: PinCoordinates | null) => void
}

const PLACEHOLDER_PIN_ID = "household-pin"

export function HouseholdPinMap({
  barangayBoundary,
  barangayId,
  currentPin,
  onPinChange,
}: HouseholdPinMapProps) {
  const [dragPin, setDragPin] = useState<PinCoordinates | null>(currentPin)

  const pointCollection: GisPointFeatureCollection = dragPin
    ? {
        type: "FeatureCollection" as const,
        features: [
          {
            type: "Feature" as const,
            id: PLACEHOLDER_PIN_ID,
            geometry: { type: "Point" as const, coordinates: [dragPin.lng, dragPin.lat] },
            properties: { id: PLACEHOLDER_PIN_ID },
          } as GisPointFeature,
        ],
      }
    : { type: "FeatureCollection" as const, features: [] }

  const handlePointDrag = useCallback(({ lat, lng }: PinCoordinates) => {
    setDragPin({ lat, lng })
  }, [])

  const handlePointDragEnd = useCallback(
    ({ lat, lng }: PinCoordinates) => {
      if (!barangayBoundary) {
        const pin = { lat, lng }
        setDragPin(pin)
        onPinChange(pin)
        return
      }

      const rawGeometry = barangayBoundary.features[0]?.geometry
      const boundary =
        rawGeometry && (rawGeometry.type === "Polygon" || rawGeometry.type === "MultiPolygon")
          ? rawGeometry
          : null
      if (boundary && !isPointInGeometry([lng, lat], boundary)) {
        const centroid = boundary ? getGeometryCentroid(boundary) : null
        const snapTo = centroid ? { lat: centroid.lat, lng: centroid.lng } : currentPin
        setDragPin(snapTo)
        toast.warning("Pin must stay within the barangay boundary.")
        return
      }

      const pin = { lat, lng }
      setDragPin(pin)
      onPinChange(pin)
    },
    [barangayBoundary, currentPin, onPinChange]
  )

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-md border">
      <StationPinMap
        boundaryCollection={barangayBoundary ?? { type: "FeatureCollection", features: [] }}
        pointCollection={pointCollection}
        selectedBoundaryId={barangayId}
        selectedPointId={dragPin ? PLACEHOLDER_PIN_ID : null}
        draggablePointId={PLACEHOLDER_PIN_ID}
        onPointDrag={handlePointDrag}
        onPointDragEnd={handlePointDragEnd}
        onBoundaryClick={() => {}}
        fitKey={barangayId ?? "none"}
        initialFitScope="boundaries"
      />
    </div>
  )
}
