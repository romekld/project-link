import type { HealthStationPinStatus, HealthStationStatus } from './schema'

export function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

export function formatCoordinates(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) return 'No pin'

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

export function formatStationStatus(status: HealthStationStatus) {
  return status === 'active' ? 'Active' : 'Inactive'
}

export function formatPinStatus(status: HealthStationPinStatus) {
  if (status === 'pinned') return 'Pinned'
  if (status === 'draft') return 'Draft'
  return 'Needs pin'
}
