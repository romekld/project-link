'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import type {
  CoveragePlannerRecord,
  CoverageStagedAction,
} from '../data/coverage-schema'
import type {
  CityBarangayImportItem,
  CityBarangayRegistryRecord,
} from '../data/schema'

const RegistryMapCanvas = dynamic(
  () =>
    import('./registry-map-canvas').then((module) => module.RegistryMapCanvas),
  {
    ssr: false,
    loading: () => (
      <Skeleton className='h-full min-h-[320px] w-full md:min-h-[420px] xl:min-h-0' />
    ),
  }
)

type RegistryMapPanelProps = {
  records: CityBarangayRegistryRecord[]
  coverageRecords?: CoveragePlannerRecord[]
  mode?: 'registry' | 'coverage'
  selectedPcode: string | null
  previewItem: CityBarangayImportItem | null
  onSelectPcode: (pcode: string) => void
  onOpenHistory: (record: CityBarangayRegistryRecord) => void
  onStageCoverage?: (
    record: CoveragePlannerRecord,
    action: CoverageStagedAction
  ) => void
  onUndoCoverage?: (record: CoveragePlannerRecord) => void
}

export function RegistryMapPanel({
  records,
  coverageRecords = [],
  mode = 'registry',
  selectedPcode,
  previewItem,
  onSelectPcode,
  onOpenHistory,
  onStageCoverage,
  onUndoCoverage,
}: RegistryMapPanelProps) {
  return (
    <RegistryMapCanvas
      coverageRecords={coverageRecords}
      mode={mode}
      onOpenHistory={onOpenHistory}
      onSelectPcode={onSelectPcode}
      onStageCoverage={onStageCoverage}
      onUndoCoverage={onUndoCoverage}
      previewItem={previewItem}
      records={records}
      selectedPcode={selectedPcode}
    />
  )
}
