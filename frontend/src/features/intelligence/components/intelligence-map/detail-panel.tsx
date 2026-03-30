import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { getRoleMapActions, getRoleViewLabel } from '@/features/intelligence/fixtures'
import type { BarangaySnapshot, MapRoleView } from '@/features/intelligence/types'
import { statusLabel, statusVariant } from './constants'
import { Building2, MapPinned, Radar } from 'lucide-react'

interface DetailPanelProps {
  roleView: MapRoleView
  snapshot: BarangaySnapshot | null
}

export function DetailPanel({ roleView, snapshot }: DetailPanelProps) {
  const actions = getRoleMapActions(roleView)

  if (!snapshot) {
    return (
      <Empty className="border bg-muted/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MapPinned />
          </EmptyMedia>
          <EmptyTitle>Select a barangay</EmptyTitle>
          <EmptyDescription>
            Click any polygon on the map to inspect its CHO2 scope, alerts, and operational snapshot.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {snapshot.barangayCode}
          </div>
          <h2 className="font-heading text-xl font-semibold">{snapshot.barangayName}</h2>
          <p className="text-sm text-muted-foreground">{snapshot.bhsName}</p>
        </div>
        <Badge variant={statusVariant(snapshot.alertStatus)}>{statusLabel(snapshot.alertStatus)}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-background/80 p-3">
          <div className="text-xs text-muted-foreground">Total cases</div>
          <div className="mt-2 font-heading text-2xl font-semibold">{snapshot.totalCases}</div>
        </div>
        <div className="rounded-2xl border bg-background/80 p-3">
          <div className="text-xs text-muted-foreground">Active alerts</div>
          <div className="mt-2 font-heading text-2xl font-semibold">{snapshot.activeAlerts}</div>
        </div>
        <div className="rounded-2xl border bg-background/80 p-3">
          <div className="text-xs text-muted-foreground">Validation rate</div>
          <div className="mt-2 font-heading text-2xl font-semibold">{snapshot.validationRate}%</div>
        </div>
        <div className="rounded-2xl border bg-background/80 p-3">
          <div className="text-xs text-muted-foreground">Households</div>
          <div className="mt-2 font-heading text-2xl font-semibold">{snapshot.householdsCovered}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-muted/25 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Building2 className="size-4 text-muted-foreground" />
          Operational context
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{snapshot.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{snapshot.inCho2Scope ? 'Within CHO2 scope' : 'Outside CHO2 scope'}</Badge>
          <Badge variant="outline">{getRoleViewLabel(roleView)} view</Badge>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="text-sm font-medium">Next actions</div>
        <div className="grid gap-2">
          {actions.map((action) => (
            <Button
              key={action.to}
              variant="outline"
              className="justify-between"
              nativeButton={false}
              render={<Link to={action.to} />}
            >
              {action.label}
              <Radar data-icon="inline-end" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
