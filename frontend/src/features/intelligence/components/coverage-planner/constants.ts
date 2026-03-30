import type { CoveragePlannerRecord } from '@/features/intelligence/types'
import type { MapProvider } from './types'

const MAP_PROVIDER_STORAGE_KEY = 'gis-map-provider'

const cartoStyles = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
}

interface CoverageSummary {
  inScope: number
  outOfScope: number
  pendingAdds: number
  pendingRemoves: number
}

export interface CoverageStatus {
  label: 'Staged add' | 'Staged remove' | 'In CHO2' | 'Outside CHO2'
  variant: 'secondary' | 'destructive' | 'default' | 'outline'
}

export type { CoverageSummary }

function getMaptilerStyles(apiKey: string) {
  const style = `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`
  return { light: style, dark: style }
}

export function getCoveragePlannerMapStyles(provider: MapProvider, apiKey?: string) {
  if (provider === 'maptiler' && apiKey) {
    return getMaptilerStyles(apiKey)
  }

  return cartoStyles
}

export function getStoredCoveragePlannerMapProvider(): MapProvider {
  if (typeof window === 'undefined') {
    return 'carto'
  }

  const persisted = window.localStorage.getItem(MAP_PROVIDER_STORAGE_KEY)
  return persisted === 'maptiler' ? 'maptiler' : 'carto'
}

export function persistCoveragePlannerMapProvider(provider: MapProvider) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(MAP_PROVIDER_STORAGE_KEY, provider)
}

export function getEffectiveScope(record: CoveragePlannerRecord) {
  if (record.pendingAction === 'add') return true
  if (record.pendingAction === 'remove') return false
  return record.inCho2Scope
}

export function getCoverageStatus(record: CoveragePlannerRecord): CoverageStatus {
  if (record.pendingAction === 'add') {
    return { label: 'Staged add', variant: 'secondary' as const }
  }

  if (record.pendingAction === 'remove') {
    return { label: 'Staged remove', variant: 'destructive' as const }
  }

  if (record.inCho2Scope) {
    return { label: 'In CHO2', variant: 'default' as const }
  }

  return { label: 'Outside CHO2', variant: 'outline' as const }
}

export function buildCoverageSummary(records: CoveragePlannerRecord[]): CoverageSummary {
  return records.reduce<CoverageSummary>(
    (summary, record) => {
      const effectiveScope = getEffectiveScope(record)

      if (effectiveScope) summary.inScope += 1
      else summary.outOfScope += 1

      if (record.pendingAction === 'add') summary.pendingAdds += 1
      if (record.pendingAction === 'remove') summary.pendingRemoves += 1
      return summary
    },
    { inScope: 0, outOfScope: 0, pendingAdds: 0, pendingRemoves: 0 },
  )
}
