import {
  Building2Icon,
  CircleDotIcon,
  MapPinCheckIcon,
  MapPinIcon,
  MapPinnedIcon,
  RadioTowerIcon,
  ShieldCheckIcon,
  ShieldIcon,
} from 'lucide-react'
import type {
  HealthStationFacilityType,
  HealthStationPinStatus,
  HealthStationStatus,
} from './schema'

export const stationStatusOptions: {
  label: string
  value: HealthStationStatus
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { label: 'Active', value: 'active', icon: ShieldCheckIcon },
  { label: 'Inactive', value: 'inactive', icon: ShieldIcon },
]

export const facilityTypeOptions: {
  label: string
  value: HealthStationFacilityType
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { label: 'Barangay Health Station', value: 'bhs', icon: Building2Icon },
  { label: 'Barangay Health Center', value: 'main_bhs', icon: MapPinnedIcon },
  { label: 'Satellite Health Station', value: 'satellite', icon: RadioTowerIcon },
]

export const pinStatusOptions: {
  label: string
  value: HealthStationPinStatus
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { label: 'Pinned', value: 'pinned', icon: MapPinCheckIcon },
  { label: 'Needs pin', value: 'needs_pin', icon: MapPinIcon },
  { label: 'Draft', value: 'draft', icon: CircleDotIcon },
]

export function getFacilityTypeLabel(value: HealthStationFacilityType) {
  return facilityTypeOptions.find((option) => option.value === value)?.label ?? value
}

export function getPinStatusLabel(value: HealthStationPinStatus) {
  return pinStatusOptions.find((option) => option.value === value)?.label ?? value
}
