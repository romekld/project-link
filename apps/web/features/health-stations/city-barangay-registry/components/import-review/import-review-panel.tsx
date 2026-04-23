'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2Icon, FileJsonIcon, UploadIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import type {
  CityBarangayImportAction,
  CityBarangayImportItem,
  CityBarangayImportJob,
} from '../../data/schema'
import { formatImportStatus } from '../../data/formatters'
import { ImportReviewTable } from './import-review-table'
import { ImportCommitDialog } from './import-commit-dialog'

type ImportReviewPanelProps = {
  job: CityBarangayImportJob
  items: CityBarangayImportItem[]
  selectedItemId: string | null
  onPreview: (item: CityBarangayImportItem) => void
  onItemsChange: (items: CityBarangayImportItem[]) => void
}

export function ImportReviewPanel({
  job,
  items,
  selectedItemId,
  onPreview,
  onItemsChange,
}: ImportReviewPanelProps) {
  const [commitOpen, setCommitOpen] = useState(false)
  const [committed, setCommitted] = useState(false)

  const invalidCount = items.filter((item) => item.action === 'invalid').length
  const unresolvedCount = items.filter(
    (item) => item.action === 'review_required'
  ).length
  const overwriteCount = items.filter((item) => item.action === 'overwrite').length
  const commitReady = invalidCount === 0 && unresolvedCount === 0
  const progressValue =
    job.totalFeatures > 0
      ? Math.round((job.validFeatures / job.totalFeatures) * 100)
      : 0

  const summary = useMemo(
    () => [
      { label: 'Total rows', value: job.totalFeatures },
      { label: 'Valid rows', value: job.validFeatures },
      { label: 'Invalid rows', value: invalidCount },
      { label: 'Duplicate rows', value: job.duplicateFeatures },
    ],
    [invalidCount, job.duplicateFeatures, job.totalFeatures, job.validFeatures]
  )

  function handleSetAction(
    item: CityBarangayImportItem,
    action: CityBarangayImportAction
  ) {
    onItemsChange(
      items.map((current) =>
        current.id === item.id
          ? {
              ...current,
              action,
              selectedOverwrite: action === 'overwrite',
            }
          : current
      )
    )
  }

  function handleCommit() {
    onItemsChange(
      items.map((item) =>
        item.action === 'create' || item.action === 'overwrite'
          ? {
              ...item,
              action: 'committed',
              processedAt: new Date().toISOString(),
            }
          : item
      )
    )
    setCommitted(true)
    setCommitOpen(false)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]'>
        <Card>
          <CardHeader>
            <CardTitle>GeoJSON Intake</CardTitle>
            <CardDescription>
              Upload or paste GeoJSON before running validation.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Button className='h-11' variant='outline'>
                <UploadIcon data-icon='inline-start' />
                Upload GeoJSON
              </Button>
              <Button className='h-11' variant='outline'>
                <FileJsonIcon data-icon='inline-start' />
                Run validation
              </Button>
            </div>
            <Textarea
              className='min-h-32 resize-none'
              placeholder='Paste a GeoJSON FeatureCollection payload for validation.'
              readOnly
              value=''
            />
            <p className='text-xs text-muted-foreground'>
              UI scaffold only. Backend validation will be connected to the
              staged import workflow.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Job Summary</CardTitle>
            <CardDescription>
              Current job: {job.filename} / {formatImportStatus(job.status)}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
              {summary.map((item) => (
                <div
                  className='rounded-md border bg-muted/40 p-3'
                  key={item.label}
                >
                  <p className='font-mono text-xl font-semibold tabular-nums'>
                    {item.value}
                  </p>
                  <p className='text-xs text-muted-foreground'>{item.label}</p>
                </div>
              ))}
            </div>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center justify-between gap-3 text-sm'>
                <span className='text-muted-foreground'>Validation completion</span>
                <span className='font-mono tabular-nums'>{progressValue}%</span>
              </div>
              <Progress value={progressValue} />
            </div>
            <Button
              className='h-11 w-full'
              disabled={!commitReady || committed}
              onClick={() => setCommitOpen(true)}
            >
              <CheckCircle2Icon data-icon='inline-start' />
              {committed ? 'Changes committed' : 'Commit validated changes'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {!commitReady ? (
        <Alert variant={invalidCount > 0 ? 'destructive' : 'default'}>
          <AlertTitle>Commit is blocked</AlertTitle>
          <AlertDescription>
            Resolve {unresolvedCount} duplicate decision
            {unresolvedCount === 1 ? '' : 's'} and fix {invalidCount} invalid
            feature{invalidCount === 1 ? '' : 's'} before commit.
          </AlertDescription>
        </Alert>
      ) : null}

      <ImportReviewTable
        data={items}
        onPreview={onPreview}
        onSetAction={handleSetAction}
        selectedItemId={selectedItemId}
      />

      <ImportCommitDialog
        onConfirm={handleCommit}
        onOpenChange={setCommitOpen}
        open={commitOpen}
        overwriteCount={overwriteCount}
      />
    </div>
  )
}

