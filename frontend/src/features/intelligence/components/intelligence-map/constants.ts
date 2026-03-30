import type { BarangaySnapshot, GeoLayerId, MapRoleView } from '@/features/intelligence/types'
import { Flame, MapIcon, Shield } from 'lucide-react'

export type MapProvider = 'carto' | 'maptiler'

export const layerLabels: Record<GeoLayerId, { title: string; description: string }> = {
  choropleth: {
    title: 'Barangay intensity',
    description: 'Colors each barangay by the mock disease load for this frontend-only MVP.',
  },
  scope: {
    title: 'CHO2 scope',
    description: 'Highlights the operational coverage footprint from the CHO2 boundary file.',
  },
  diseaseHeat: {
    title: 'Disease heat',
    description: 'Shows the single shipped disease heat layer derived from the local mock overlay.',
  },
}

export const mapColorScale = ['#ecfdf5', '#bbf7d0', '#4ade80', '#15803d']

export const mapViewportHeightClass = 'h-[calc(100dvh-7.5rem)] min-h-[34rem] xl:h-[calc(100dvh-7.5rem)]'

const MAP_PROVIDER_STORAGE_KEY = 'gis-map-provider'

const cartoStyles = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
}

function getMaptilerStyles(apiKey: string) {
  const style = `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`
  return { light: style, dark: style }
}

export function getMapStyles(provider: MapProvider, apiKey?: string) {
  if (provider === 'maptiler' && apiKey) {
    return getMaptilerStyles(apiKey)
  }

  return cartoStyles
}

export function getStoredMapProvider(): MapProvider {
  if (typeof window === 'undefined') {
    return 'carto'
  }

  const persisted = window.localStorage.getItem(MAP_PROVIDER_STORAGE_KEY)
  return persisted === 'maptiler' ? 'maptiler' : 'carto'
}

export function persistMapProvider(provider: MapProvider) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(MAP_PROVIDER_STORAGE_KEY, provider)
}

export function getDefaultVisibleLayers(roleView: MapRoleView): GeoLayerId[] {
  if (roleView === 'dso') return ['scope']
  if (roleView === 'cho') return ['choropleth', 'scope', 'diseaseHeat']
  return ['choropleth', 'scope']
}

export function getLayerIcon(layerId: GeoLayerId) {
  if (layerId === 'choropleth') return MapIcon
  if (layerId === 'scope') return Shield
  return Flame
}

export function statusVariant(status: BarangaySnapshot['alertStatus']): 'secondary' | 'outline' | 'destructive' {
  if (status === 'hotspot') return 'destructive'
  if (status === 'watch') return 'secondary'
  return 'outline'
}

export function statusLabel(status: BarangaySnapshot['alertStatus']) {
  if (status === 'hotspot') return 'Hotspot'
  if (status === 'watch') return 'Watch'
  return 'Stable'
}
