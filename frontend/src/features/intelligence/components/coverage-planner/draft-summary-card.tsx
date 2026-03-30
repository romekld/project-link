import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers3, Send, Trash2 } from 'lucide-react'

interface DraftSummaryCardProps {
  totals: {
    inScope: number
    outOfScope: number
    pendingAdds: number
    pendingRemoves: number
  }
  hasStagedChanges: boolean
  onReviewApply: () => void
  onClearAll: () => void
}

export function DraftSummaryCard({ totals, hasStagedChanges, onReviewApply, onClearAll }: DraftSummaryCardProps) {
  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers3 className="size-4 text-muted-foreground" />
          Staged changes
        </CardTitle>
        <CardDescription>
          Review pending scope changes, then apply them with one shared reason.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-muted/20 p-3">
            <div className="text-xs text-muted-foreground">In CHO2</div>
            <div className="mt-2 font-heading text-2xl font-semibold">{totals.inScope}</div>
          </div>
          <div className="rounded-2xl border bg-muted/20 p-3">
            <div className="text-xs text-muted-foreground">Outside scope</div>
            <div className="mt-2 font-heading text-2xl font-semibold">{totals.outOfScope}</div>
          </div>
          <div className="rounded-2xl border bg-muted/20 p-3">
            <div className="text-xs text-muted-foreground">Staged add</div>
            <div className="mt-2 font-heading text-2xl font-semibold">{totals.pendingAdds}</div>
          </div>
          <div className="rounded-2xl border bg-muted/20 p-3">
            <div className="text-xs text-muted-foreground">Staged remove</div>
            <div className="mt-2 font-heading text-2xl font-semibold">{totals.pendingRemoves}</div>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed bg-muted/15 p-3">
          <Badge variant="secondary" className="mb-2">Ready to review</Badge>
          <p className="text-sm leading-6 text-muted-foreground">
            Staged rows remain local until you confirm the batch and send the changes to the backend.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={onReviewApply} disabled={!hasStagedChanges}>
            <Send data-icon="inline-start" />
            Review and apply
          </Button>
          <Button variant="outline" onClick={onClearAll} disabled={!hasStagedChanges}>
            <Trash2 data-icon="inline-start" />
            Clear all staged
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
