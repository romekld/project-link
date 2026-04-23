'use client'

import { useMemo, useRef, useState } from 'react'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  LocateFixedIcon,
  RotateCcwIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { CityBarangayRegistryRecord } from '@/features/health-stations/city-barangay-registry/data/schema'
import { toRegistryFeatureCollection } from '@/features/health-stations/city-barangay-registry/data/geojson'
import type { GisPointFeatureCollection } from '@/features/gis-map/data/types'
import { StationPinMap } from './station-pin-map'
import { getGeometryCentroid, isPointInGeometry } from '../data'

type StationPinEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  stationName: string
  stationCode: string
  physicalBarangayName: string
  physicalBarangayPcode: string
  registryRecords: CityBarangayRegistryRecord[]
  currentLatitude: number | null
  currentLongitude: number | null
  onApply: (coordinates: { lat: number; lng: number }) => void
}

const DEFAULT_CENTER = { lng: 120.94, lat: 14.32 }

export function StationPinEditorDialog({
  open,
  onOpenChange,
  stationName,
  stationCode,
  physicalBarangayName,
  physicalBarangayPcode,
  registryRecords,
  currentLatitude,
  currentLongitude,
  onApply,
}: StationPinEditorDialogProps) {
  const physicalBarangay = useMemo(
    () => registryRecords.find((r) => r.pcode === physicalBarangayPcode) ?? null,
    [physicalBarangayPcode, registryRecords]
  )

  const centroid = useMemo(
    () => getGeometryCentroid(physicalBarangay?.geometry ?? null),
    [physicalBarangay]
  )

  const boundaryCollection = useMemo(
    () => toRegistryFeatureCollection(physicalBarangay ? [physicalBarangay] : []),
    [physicalBarangay]
  )

  const defaultCoordinates = useMemo(() => {
    if (typeof currentLatitude === 'number' && typeof currentLongitude === 'number') {
      return { lat: currentLatitude, lng: currentLongitude }
    }
    return centroid ?? DEFAULT_CENTER
  }, [currentLatitude, currentLongitude, centroid])

  const [draftLat, setDraftLat] = useState('')
  const [draftLng, setDraftLng] = useState('')
  const [hasManualDraft, setHasManualDraft] = useState(false)
  const [fitKey, setFitKey] = useState(0)
  const [clickBlockedWarning, setClickBlockedWarning] = useState(false)
  const [snapBackWarning, setSnapBackWarning] = useState(false)

  const clickBlockedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const snapBackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentDraftLat = hasManualDraft ? draftLat : String(defaultCoordinates.lat)
  const currentDraftLng = hasManualDraft ? draftLng : String(defaultCoordinates.lng)
  const parsedLat = Number(currentDraftLat)
  const parsedLng = Number(currentDraftLng)
  const hasValidCoordinates = Number.isFinite(parsedLat) && Number.isFinite(parsedLng)

  const isOutsideBoundary = useMemo(() => {
    if (!physicalBarangay?.geometry || !hasValidCoordinates) return false
    return !isPointInGeometry([parsedLng, parsedLat], physicalBarangay.geometry)
  }, [physicalBarangay, hasValidCoordinates, parsedLat, parsedLng])

  const pointCollection = useMemo<GisPointFeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: hasValidCoordinates
        ? [
            {
              type: 'Feature',
              id: stationCode,
              geometry: { type: 'Point', coordinates: [parsedLng, parsedLat] },
              properties: {
                id: stationCode,
                name: stationName,
                pcode: physicalBarangayPcode,
                pinStatus:
                  currentLatitude != null && currentLongitude != null ? 'pinned' : 'draft',
              },
            },
          ]
        : [],
    }),
    [
      currentLatitude,
      currentLongitude,
      hasValidCoordinates,
      parsedLat,
      parsedLng,
      physicalBarangayPcode,
      stationCode,
      stationName,
    ]
  )

  function showClickBlocked() {
    setClickBlockedWarning(true)
    if (clickBlockedTimerRef.current) clearTimeout(clickBlockedTimerRef.current)
    clickBlockedTimerRef.current = setTimeout(() => setClickBlockedWarning(false), 3000)
  }

  function showSnapBack() {
    setSnapBackWarning(true)
    if (snapBackTimerRef.current) clearTimeout(snapBackTimerRef.current)
    snapBackTimerRef.current = setTimeout(() => setSnapBackWarning(false), 3000)
  }

  function handleResetToCentroid() {
    const target = centroid ?? DEFAULT_CENTER
    setHasManualDraft(true)
    setDraftLat(String(target.lat))
    setDraftLng(String(target.lng))
  }

  function handleMapClick(event: import('maplibre-gl').MapMouseEvent) {
    const { lat, lng } = event.lngLat
    if (physicalBarangay?.geometry && !isPointInGeometry([lng, lat], physicalBarangay.geometry)) {
      showClickBlocked()
      return
    }
    setClickBlockedWarning(false)
    setHasManualDraft(true)
    setDraftLat(String(lat))
    setDraftLng(String(lng))
  }

  function handlePointDrag(coordinates: { lat: number; lng: number }) {
    setHasManualDraft(true)
    setDraftLat(String(coordinates.lat))
    setDraftLng(String(coordinates.lng))
  }

  function handlePointDragEnd(coordinates: { lat: number; lng: number }) {
    if (!physicalBarangay?.geometry) return
    if (isPointInGeometry([coordinates.lng, coordinates.lat], physicalBarangay.geometry)) return
    const target = centroid ?? DEFAULT_CENTER
    setHasManualDraft(true)
    setDraftLat(String(target.lat))
    setDraftLng(String(target.lng))
    showSnapBack()
  }

  function handleApply() {
    if (!hasValidCoordinates || isOutsideBoundary) return
    onApply({ lat: parsedLat, lng: parsedLng })
    onOpenChange(false)
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setHasManualDraft(false)
      setDraftLat('')
      setDraftLng('')
      setClickBlockedWarning(false)
      setSnapBackWarning(false)
    }
    onOpenChange(nextOpen)
  }

  const isPinned = currentLatitude != null && currentLongitude != null

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className='max-h-[94dvh] w-[min(1200px,calc(100vw-0.75rem))] m:w-[min(1200px,calc(100vw-2.5rem))] sm:max-w-none'>
        <DialogHeader className=''>
          <DialogTitle className='text-base leading-none'>{stationName}</DialogTitle>
          <DialogDescription className='text-xs'>{stationCode}</DialogDescription>
        </DialogHeader>

        <div className='min-h-0 lg:grid lg:grid-cols-[minmax(0,1fr)_300px]'>
          <div className='min-h-[60dvh] min-w-0 '>
            <StationPinMap
              boundaryCollection={boundaryCollection}
              className='min-h-[58dvh] rounded-xl border bg-card shadow-sm lg:min-h-[70dvh]'
              draggablePointId={stationCode}
              fitKey={fitKey}
              initialFitScope='boundaries'
              onBoundaryClick={() => {}}
              onMapClick={handleMapClick}
              onPointDrag={handlePointDrag}
              onPointDragEnd={handlePointDragEnd}
              pointCollection={pointCollection}
              selectedBoundaryId={physicalBarangay?.id ?? null}
              selectedPointId={stationCode}
            />
          </div>

          <div className='flex min-h-0 flex-col divide-y overflow-y-auto bg-background lg:max-h-[calc(94dvh-6rem)]'>
            {/* Station info */}
            <div className='px-4 py-3'>
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold'>{stationName}</p>
                  <p className='mt-0.5 text-xs text-muted-foreground'>{stationCode}</p>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    {physicalBarangayName || 'No barangay assigned'}
                  </p>
                </div>
                <Badge
                  className='mt-0.5 shrink-0'
                  variant={isPinned ? 'default' : 'outline'}
                >
                  {isPinned ? 'Pinned' : 'Needs pin'}
                </Badge>
              </div>
            </div>

            {/* Boundary status */}
            <div className='px-4 py-3'>
              <div className='mb-1.5 flex items-center justify-between gap-2'>
                <span className='text-xs font-medium'>Boundary status</span>
                {hasValidCoordinates ? (
                  isOutsideBoundary ? (
                    <Badge className='gap-1' variant='destructive'>
                      <CircleAlertIcon className='size-3' />
                      Outside
                    </Badge>
                  ) : (
                    <Badge className='gap-1 bg-emerald-600 text-white hover:bg-emerald-600'>
                      <CircleCheckIcon className='size-3' />
                      Inside
                    </Badge>
                  )
                ) : (
                  <Badge variant='outline'>No pin</Badge>
                )}
              </div>
              {hasValidCoordinates && (
                <p className='font-mono text-[11px] text-muted-foreground'>
                  {parsedLat.toFixed(6)}°&nbsp;&nbsp;{parsedLng.toFixed(6)}°
                </p>
              )}
              {!physicalBarangay ? (
                <p className='mt-2 text-xs text-muted-foreground'>
                  Boundary data for {physicalBarangayName || 'this barangay'} is missing, so the map cannot enforce placement.
                </p>
              ) : isOutsideBoundary ? (
                <p className='mt-2 text-xs text-destructive'>
                  Move the pin inside {physicalBarangayName || 'the barangay boundary'} before saving.
                </p>
              ) : null}
            </div>

            {/* Inline warnings */}
            {clickBlockedWarning && (
              <div className='bg-amber-50 px-4 py-2.5 dark:bg-amber-950/30'>
                <p className='text-xs text-amber-700 dark:text-amber-300'>
                  Click was outside {physicalBarangayName || 'the boundary'} — pin not moved.
                </p>
              </div>
            )}
            {snapBackWarning && (
              <div className='bg-amber-50 px-4 py-2.5 dark:bg-amber-950/30'>
                <p className='text-xs text-amber-700 dark:text-amber-300'>
                  Pin was outside boundary — reset to centroid.
                </p>
              </div>
            )}

            {/* Map controls */}
            <div className='px-4 py-3'>
              <p className='mb-2 text-xs font-medium text-muted-foreground'>Map controls</p>
              <div className='flex flex-col gap-2'>
                <Button
                  className='h-8 justify-start gap-2 text-xs'
                  onClick={() => setFitKey((k) => k + 1)}
                  type='button'
                  variant='outline'
                >
                  <LocateFixedIcon className='size-3.5' />
                  Fit to barangay
                </Button>
                <Button
                  className='h-8 justify-start gap-2 text-xs'
                  onClick={handleResetToCentroid}
                  type='button'
                  variant='outline'
                >
                  <RotateCcwIcon className='size-3.5' />
                  Reset to centroid
                </Button>
              </div>
            </div>

            {/* Manual coordinate inputs */}
            <div className='px-4 py-3'>
              <p className='mb-3 text-xs font-medium text-muted-foreground'>
                Manual coordinates
              </p>
              <div className='grid gap-3'>
                <div className='grid gap-1.5'>
                  <label className='text-xs text-muted-foreground' htmlFor='pin-latitude'>
                    Latitude
                  </label>
                  <Input
                    id='pin-latitude'
                    inputMode='decimal'
                    onChange={(e) => {
                      setHasManualDraft(true)
                      setDraftLat(e.target.value)
                    }}
                    placeholder='14.300000'
                    value={currentDraftLat}
                  />
                </div>
                <div className='grid gap-1.5'>
                  <label className='text-xs text-muted-foreground' htmlFor='pin-longitude'>
                    Longitude
                  </label>
                  <Input
                    id='pin-longitude'
                    inputMode='decimal'
                    onChange={(e) => {
                      setHasManualDraft(true)
                      setDraftLng(e.target.value)
                    }}
                    placeholder='120.950000'
                    value={currentDraftLng}
                  />
                </div>
              </div>
              <p className='mt-3 text-xs text-muted-foreground'>
                Drag or click within the physical barangay boundary to place the pin.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant='outline'>
            Cancel
          </Button>
          <Button disabled={!hasValidCoordinates || isOutsideBoundary} onClick={handleApply}>
            Save Pin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
