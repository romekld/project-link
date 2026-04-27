"use client"

import { Users, Clock, CheckCircle, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Stat = {
  label: string
  value: number
  icon: React.ElementType
  colorClass: string
}

type SummaryStatsGridProps = {
  total: number
  pendingSync: number
  validated: number
  returned: number
}

export function SummaryStatsGrid({ total, pendingSync, validated, returned }: SummaryStatsGridProps) {
  const stats: Stat[] = [
    { label: "Total Households", value: total, icon: Users, colorClass: "text-blue-500" },
    { label: "Pending Sync", value: pendingSync, icon: Clock, colorClass: "text-amber-500" },
    { label: "Validated", value: validated, icon: CheckCircle, colorClass: "text-green-500" },
    { label: "Returned", value: returned, icon: RotateCcw, colorClass: "text-rose-500" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex flex-col gap-1 pt-4 pb-4">
            <div className="flex items-center gap-2">
              <stat.icon className={`size-4 shrink-0 ${stat.colorClass}`} />
              <span className="text-xs text-muted-foreground leading-tight">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
