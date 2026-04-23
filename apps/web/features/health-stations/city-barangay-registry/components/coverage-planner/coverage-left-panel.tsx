'use client'

import { RotateCcwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type {
  CoveragePlannerRecord,
  CoveragePlannerStats,
} from '../../data/coverage-schema'
import { formatArea, formatCompactNumber } from '../../data/formatters'
import { CoverageStatusBadge } from './coverage-status-badge'

type CoverageLeftPanelProps = {
  stats: CoveragePlannerStats
  selectedRecord: CoveragePlannerRecord | null
  onResetChanges: () => void
}

export function CoverageLeftPanel({
  stats,
  selectedRecord,
  onResetChanges,
}: CoverageLeftPanelProps) {
  const countCoverage =
    stats.totalBarangays > 0
      ? Math.round((stats.nextInScope / stats.totalBarangays) * 100)
      : 0
  const areaCoverage =
    stats.totalAreaSqKm > 0
      ? Math.round((stats.nextInScopeAreaSqKm / stats.totalAreaSqKm) * 100)
      : 0
  const stagedCount = stats.stagedAdds + stats.stagedRemoves

  return (
    <aside className='flex min-h-0 flex-col gap-3 p-px pb-3 xl:sticky xl:top-0 xl:h-full xl:self-start xl:overflow-y-auto xl:overscroll-contain'>
      <Card size='sm'>
        <CardHeader>
          <CardTitle>Coverage Overview</CardTitle>
          <CardDescription>Current and staged CHO2 scope.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          <dl className='grid gap-2 text-sm'>
            <RailRow
              label='City barangays'
              value={formatCompactNumber(stats.totalBarangays)}
            />
            <RailRow
              label='Next CHO2 scope'
              value={formatCompactNumber(stats.nextInScope)}
            />
            <RailRow
              label='Outside after apply'
              value={formatCompactNumber(stats.totalBarangays - stats.nextInScope)}
            />
          </dl>
          <Progress value={countCoverage} />
        </CardContent>
      </Card>

      <Card size='sm'>
        <CardHeader>
          <CardTitle>Area Coverage</CardTitle>
          <CardDescription>Operational scope by land area.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          <dl className='grid gap-2 text-sm'>
            <RailRow label='Total area' value={formatArea(stats.totalAreaSqKm)} />
            <RailRow
              label='CHO2 area'
              value={formatArea(stats.nextInScopeAreaSqKm)}
            />
            <RailRow
              label='Outside area'
              value={formatArea(stats.totalAreaSqKm - stats.nextInScopeAreaSqKm)}
            />
          </dl>
          <Progress value={areaCoverage} />
        </CardContent>
      </Card>

      <Card size='sm'>
        <CardHeader>
          <CardTitle>Staged Changes</CardTitle>
          <CardDescription>Nothing applies until committed.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          <dl className='grid gap-2 text-sm'>
            <RailRow label='Adds' value={formatCompactNumber(stats.stagedAdds)} />
            <RailRow
              label='Removes'
              value={formatCompactNumber(stats.stagedRemoves)}
            />
            <RailRow label='Net change' value={`${stats.stagedAdds - stats.stagedRemoves}`} />
          </dl>
          <Button
            className='h-10 w-full'
            disabled={!stagedCount}
            onClick={onResetChanges}
            variant='outline'
          >
            <RotateCcwIcon data-icon='inline-start' />
            Reset staged changes
          </Button>
        </CardContent>
      </Card>

      <Card size='sm'>
        <CardHeader>
          <CardTitle>Selected Barangay</CardTitle>
          <CardDescription>Operational scope summary.</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedRecord ? (
            <div className='flex flex-col gap-3'>
              <div>
                <p className='font-medium'>{selectedRecord.name}</p>
                <p className='font-mono text-xs text-muted-foreground'>
                  {selectedRecord.pcode}
                </p>
              </div>
              <CoverageStatusBadge record={selectedRecord} />
              <dl className='grid gap-2 text-sm'>
                <RailRow
                  label='Area'
                  value={formatArea(selectedRecord.sourceAreaSqKm)}
                />
              </dl>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>
              Select a barangay from the map or table.
            </p>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}

function RailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='text-right font-mono font-medium tabular-nums'>{value}</dd>
    </div>
  )
}
