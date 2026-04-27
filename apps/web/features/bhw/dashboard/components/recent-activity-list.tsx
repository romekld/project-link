"use client"

import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SyncStatus = "draft" | "pending_sync" | "pending_validation" | "returned" | "validated"

type RecentHousehold = {
  id: string
  householdNumber: string
  respondentLastName: string
  respondentFirstName: string
  syncStatus: SyncStatus
  lastUpdated: string
}

const syncStatusConfig: Record<SyncStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  pending_sync: { label: "Pending", variant: "outline" },
  pending_validation: { label: "In Review", variant: "default" },
  returned: { label: "Returned", variant: "destructive" },
  validated: { label: "Validated", variant: "default" },
}

type RecentActivityListProps = {
  households: RecentHousehold[]
}

export function RecentActivityList({ households }: RecentActivityListProps) {
  if (households.length === 0) return null

  return (
    <Card>
      <CardHeader className="border-b pb-3 pt-4">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y">
          {households.map((hh) => {
            const config = syncStatusConfig[hh.syncStatus]
            return (
              <li key={hh.id} className="flex items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {hh.respondentLastName}, {hh.respondentFirstName}
                  </p>
                  <p className="text-xs text-muted-foreground">{hh.householdNumber}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant={config.variant} className="text-xs">
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(hh.lastUpdated), { addSuffix: true })}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
