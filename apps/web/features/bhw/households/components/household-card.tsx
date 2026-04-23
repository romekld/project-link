"use client"

import Link from "next/link"
import { AlertTriangle, ChevronRight, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Household } from "../data/schema"
import { syncStatusConfig, formatVisitQuartersSummary } from "../data/formatters"

type HouseholdCardProps = {
  household: Household
}

export function HouseholdCard({ household }: HouseholdCardProps) {
  const statusCfg = syncStatusConfig[household.syncStatus]
  const quartersSummary = formatVisitQuartersSummary(
    household.visitDateQ1,
    household.visitDateQ2,
    household.visitDateQ3,
    household.visitDateQ4
  )

  return (
    <article className="rounded-lg border bg-card p-3 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {household.respondentLastName}, {household.respondentFirstName}
          </p>
          <p className="text-xs text-muted-foreground">{household.householdNumber}</p>
        </div>
        <Badge variant={statusCfg.variant} className="shrink-0 capitalize">
          {statusCfg.label}
        </Badge>
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="size-3.5" />
          {household.members.length} member{household.members.length !== 1 ? "s" : ""}
        </span>
        <span>{quartersSummary}</span>
        {household.nhtsStatus === "NHTS-4Ps" && (
          <Badge variant="outline" className="text-[10px]">4Ps</Badge>
        )}
      </div>

      {household.syncStatus === "returned" && household.returnedReason && (
        <div className="mt-2 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span className="line-clamp-2">{household.returnedReason}</span>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/bhw/households/${household.id}/edit`}>
            Edit
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="px-3">
          <Link href={`/bhw/households/${household.id}`} aria-label="View details">
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  )
}
