import type { CoveragePendingAction } from '@/features/intelligence/types'

export type MapProvider = 'carto' | 'maptiler'

export interface PendingDraft {
  action: CoveragePendingAction
  codes: string[]
}
