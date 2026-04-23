'use client'

import { useMemo, useState, useTransition } from 'react'
import { applyCoverageChangesAction } from '../actions'
import { FolderInput, MapIcon, MapPinnedIcon, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  CoveragePlannerRecord,
  CoverageStagedAction,
  CoverageStagedChanges,
} from '../data/coverage-schema'
import {
  buildCoverageRecords,
  buildCoverageStats,
  resetCoverageChanges,
  stageCoverageChange,
  undoCoverageChange,
} from '../data/coverage-helpers'
import type {
  CityBarangayImportItem,
  CityBarangayPageMode,
  CityBarangayRegistryData,
  CityBarangayRegistryRecord,
} from '../data/schema'
import { RegistryOverviewRail } from './registry/registry-overview-rail'
import { RegistryMapPanel } from './registry-map-panel'
import { RegistryTable } from './registry/registry-table'
import { GeometryHistorySheet } from './registry/geometry-history-sheet'
import { ImportReviewPanel } from './import-review/import-review-panel'
import { CoverageLeftPanel } from './coverage-planner/coverage-left-panel'
import { CoveragePlannerPanel } from './coverage-planner/coverage-planner-panel'

type RegistryPageShellProps = {
  data: CityBarangayRegistryData
  mode: CityBarangayPageMode
}

type WorkspaceTab = 'registry' | 'coverage' | 'import'

export function RegistryPageShell({ data, mode }: RegistryPageShellProps) {
  const isAdmin = mode === 'admin'
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('registry')
  const [selectedPcode, setSelectedPcode] = useState(
    data.records[0]?.pcode ?? null
  )
  const [historyRecord, setHistoryRecord] =
    useState<CityBarangayRegistryRecord | null>(null)
  const [importItems, setImportItems] = useState(data.importItems)
  const [selectedImportItemId, setSelectedImportItemId] = useState<string | null>(
    data.importItems.find((item) => item.geometry)?.id ?? null
  )
  const [stagedChanges, setStagedChanges] = useState<CoverageStagedChanges>({})
  const [batchReason, setBatchReason] = useState('')
  const [applyError, setApplyError] = useState<string | null>(null)
  const [, startApplyTransition] = useTransition()

  const selectedRecord = useMemo(
    () => data.records.find((record) => record.pcode === selectedPcode) ?? null,
    [data.records, selectedPcode]
  )

  const selectedImportItem = useMemo(
    () => importItems.find((item) => item.id === selectedImportItemId) ?? null,
    [importItems, selectedImportItemId]
  )

  const coverageRecords = useMemo(
    () => buildCoverageRecords(data.records, stagedChanges),
    [data.records, stagedChanges]
  )

  const coverageStats = useMemo(
    () => buildCoverageStats(coverageRecords),
    [coverageRecords]
  )

  const selectedCoverageRecord = useMemo(
    () =>
      coverageRecords.find((record) => record.pcode === selectedPcode) ?? null,
    [coverageRecords, selectedPcode]
  )

  const historyVersions = useMemo(() => {
    if (!historyRecord) return []

    return data.geometryVersions.filter(
      (version) => version.cityBarangayId === historyRecord.id
    )
  }, [data.geometryVersions, historyRecord])

  const cityNames = useMemo(
    () =>
      Array.from(
        new Set(
          data.records
            .map((record) => record.city)
            .filter((city): city is string => Boolean(city))
        )
      ),
    [data.records]
  )

  const hasMultipleCities = cityNames.length > 1
  const primaryCity = cityNames[0] ?? 'Selected city'
  const cityLabel = hasMultipleCities ? 'Selected City' : primaryCity
  const pageHeader = useMemo(() => {
    if (activeTab === 'coverage') {
      return {
        title: 'Manage Scoped Barangays',
        description:
          'Stage add or remove actions to update CHO2 operational scope before applying.',
      }
    }

    if (activeTab === 'import') {
      return {
        title: 'Review GeoJSON Imports',
        description:
          'Validate staged boundary files and resolve conflicts before commit.',
      }
    }

    return {
      title: `Barangays in ${cityLabel}`,
      description:
        'Browse official barangay boundaries and view current CHO2 coverage status.',
    }
  }, [activeTab, cityLabel])

  function handleSelectRecord(record: CityBarangayRegistryRecord) {
    setSelectedPcode(record.pcode)
    setActiveTab('registry')
  }

  function handleSelectPcode(pcode: string) {
    setSelectedPcode(pcode)
  }

  function handlePreviewImportItem(item: CityBarangayImportItem) {
    setSelectedImportItemId(item.id)
    setActiveTab('import')
  }

  function handleImportItemsChange(nextItems: CityBarangayImportItem[]) {
    setImportItems(nextItems)
  }

  function handleSelectCoverageRecord(record: CoveragePlannerRecord) {
    setSelectedPcode(record.pcode)
    setActiveTab('coverage')
  }

  function handleStageCoverage(
    record: CoveragePlannerRecord,
    action: CoverageStagedAction
  ) {
    setStagedChanges((current) =>
      stageCoverageChange(record, current, action)
    )
  }

  function handleStageSelectedCoverage(
    records: CoveragePlannerRecord[],
    action: CoverageStagedAction
  ) {
    setStagedChanges((current) =>
      records.reduce(
        (next, record) => stageCoverageChange(record, next, action),
        current
      )
    )
  }

  function handleUndoCoverage(record: CoveragePlannerRecord) {
    setStagedChanges((current) => undoCoverageChange(record.pcode, current))
  }

  function handleUndoSelectedCoverage(records: CoveragePlannerRecord[]) {
    setStagedChanges((current) =>
      records.reduce(
        (next, record) => undoCoverageChange(record.pcode, next),
        current
      )
    )
  }

  function handleResetCoverage() {
    setStagedChanges(resetCoverageChanges())
  }

  function handleApplyCoverage() {
    setApplyError(null)
    const snapshot = { ...stagedChanges }
    // Optimistic: clear staged changes immediately.
    setStagedChanges(resetCoverageChanges())
    setBatchReason('')

    startApplyTransition(async () => {
      const result = await applyCoverageChangesAction(snapshot, batchReason)
      if ('error' in result) {
        // Restore staged changes if the server action failed.
        setStagedChanges(snapshot)
        setBatchReason(batchReason)
        setApplyError(result.error)
      }
    })
  }

  return (
    <section className='min-h-0 xl:h-[calc(100svh-6rem)] xl:overflow-hidden'>
      <div className='grid min-h-0 gap-4 xl:h-full xl:grid-cols-[300px_minmax(0,1fr)]'>
        {activeTab === 'coverage' ? (
          <CoverageLeftPanel
            onResetChanges={handleResetCoverage}
            selectedRecord={selectedCoverageRecord}
            stats={coverageStats}
          />
        ) : (
          <RegistryOverviewRail
            cityName={primaryCity}
            hasMultipleCities={hasMultipleCities}
            selectedRecord={selectedRecord}
            stats={data.stats}
          />
        )}

        <div className='min-h-0 min-w-0 overflow-y-auto pb-4 pr-1'>
          <Tabs
            className='flex min-w-0 flex-col gap-4'
            onValueChange={(value) => {
              if (
                value === 'registry' ||
                value === 'coverage' ||
                (value === 'import' && isAdmin)
              ) {
                setActiveTab(value)
              }
            }}
            value={activeTab}
          >
            <div className='flex flex-wrap items-end justify-between gap-3'>
              <div className='min-w-0'>
                <h1 className='font-heading text-2xl font-bold tracking-tight'>
                  {pageHeader.title}
                </h1>
                <p className='text-sm text-muted-foreground'>
                  {pageHeader.description}
                </p>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <TabsList>
                  <TabsTrigger value='registry'>
                    <MapIcon />
                    Barangays
                  </TabsTrigger>
                  <TabsTrigger value='coverage'>
                    <MapPinnedIcon />
                    Manage Coverage
                  </TabsTrigger>
                  {isAdmin ? (
                    <TabsTrigger value='import'>
                      <FileCheck />
                      Add Barangay
                    </TabsTrigger>
                  ) : null}
                </TabsList>
                {isAdmin ? (
                  <Button onClick={() => setActiveTab('import')}>
                    <FolderInput />
                    Open Import Review
                  </Button>
                ) : (
                  <Button disabled variant='outline'>
                    <MapPinnedIcon />
                    Read-only Access
                  </Button>
                )}
              </div>
            </div>

            <div className='h-[min(55svh,600px)] min-h-[320px] xl:h-[min(45svh,520px)] xl:min-h-0'>
              <RegistryMapPanel
                coverageRecords={coverageRecords}
                mode={activeTab === 'coverage' ? 'coverage' : 'registry'}
                onOpenHistory={setHistoryRecord}
                onSelectPcode={handleSelectPcode}
                onStageCoverage={handleStageCoverage}
                onUndoCoverage={handleUndoCoverage}
                previewItem={activeTab === 'import' ? selectedImportItem : null}
                records={data.records}
                selectedPcode={selectedPcode}
              />
            </div>

            <TabsContent className='mt-0' value='registry'>
              <RegistryTable
                data={data.records}
                onOpenHistory={setHistoryRecord}
                onSelect={handleSelectRecord}
                selectedPcode={selectedPcode}
              />
            </TabsContent>

            <TabsContent className='mt-0' value='coverage'>
              <CoveragePlannerPanel
                batchReason={batchReason}
                onBatchReasonChange={setBatchReason}
                onApply={handleApplyCoverage}
                onReset={handleResetCoverage}
                onSelect={handleSelectCoverageRecord}
                onStage={handleStageCoverage}
                onStageSelected={handleStageSelectedCoverage}
                onUndo={handleUndoCoverage}
                onUndoSelected={handleUndoSelectedCoverage}
                records={coverageRecords}
                selectedPcode={selectedPcode}
                stats={coverageStats}
                applyError={applyError}
              />
            </TabsContent>

            {isAdmin ? (
              <TabsContent className='mt-0' value='import'>
                <ImportReviewPanel
                  items={importItems}
                  job={data.importJob}
                  onItemsChange={handleImportItemsChange}
                  onPreview={handlePreviewImportItem}
                  selectedItemId={selectedImportItemId}
                />
              </TabsContent>
            ) : null}
          </Tabs>
        </div>
      </div>

      <GeometryHistorySheet
        onOpenChange={(open) => {
          if (!open) setHistoryRecord(null)
        }}
        open={!!historyRecord}
        record={historyRecord}
        versions={historyVersions}
      />
    </section>
  )
}
