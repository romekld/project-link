import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import type { CoveragePlannerRecord } from '@/features/intelligence/types'
import { getCoverageStatus } from './constants'
import { ClipboardPenLine, MapPlus } from 'lucide-react'

interface SelectedBarangayCardProps {
  selectedRecord: CoveragePlannerRecord | null
  batchReason: string
}

export function SelectedBarangayCard({ selectedRecord, batchReason }: SelectedBarangayCardProps) {
  if (!selectedRecord) {
    return (
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardPenLine className="size-4 text-muted-foreground" />
            Selected barangay
          </CardTitle>
          <CardDescription>
            Map clicks and table clicks stay synchronized so planners can review by geography or by list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Empty className="min-h-56 border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MapPlus />
              </EmptyMedia>
              <EmptyTitle>Pick a barangay to edit</EmptyTitle>
              <EmptyDescription>
                Click the map or any table row to stage an add or remove action.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const selectedStatus = getCoverageStatus(selectedRecord)

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardPenLine className="size-4 text-muted-foreground" />
          Selected barangay
        </CardTitle>
        <CardDescription>
          Map clicks and table clicks stay synchronized so planners can review by geography or by list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-sm font-semibold">{selectedRecord.barangayName}</div>
            <div className="text-xs text-muted-foreground">{selectedRecord.bhsName}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={selectedStatus.variant}>
              {selectedStatus.label}
            </Badge>
            <Badge variant="outline">{selectedRecord.validationRate}% validated</Badge>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Cases</div>
              <div className="font-medium">{selectedRecord.totalCases}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Alerts</div>
              <div className="font-medium">{selectedRecord.activeAlerts}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Households</div>
              <div className="font-medium">{selectedRecord.householdsCovered}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Reason</div>
              <div className="font-medium">
                {batchReason || selectedRecord.changeReason || (selectedRecord.pendingAction ? 'Reason will be added during review' : 'No staged reason yet')}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
