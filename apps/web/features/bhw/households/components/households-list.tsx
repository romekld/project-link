"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import { HouseholdCard } from "./household-card"
import type { Household, SyncStatus } from "../data/schema"

const statusFilters: { label: string; value: SyncStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Returned", value: "returned" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending_sync" },
  { label: "Synced", value: "validated" },
]

type HouseholdsListProps = {
  households: Household[]
}

export function HouseholdsList({ households }: HouseholdsListProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<SyncStatus | "all">("all")

  const filtered = households.filter((hh) => {
    const matchesSearch =
      search.trim() === "" ||
      `${hh.respondentLastName} ${hh.respondentFirstName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      hh.householdNumber.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || hh.syncStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const returnedCount = households.filter((h) => h.syncStatus === "returned").length

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search name or household number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((f) => {
          const isActive = statusFilter === f.value
          const showBadge = f.value === "returned" && returnedCount > 0
          return (
            <Button
              key={f.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
              {showBadge && (
                <Badge
                  variant="destructive"
                  className="ml-1 size-4 rounded-full p-0 text-[10px]"
                >
                  {returnedCount}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <p className="text-sm text-muted-foreground">No households match your filter.</p>
        </Empty>
      ) : (
        <div className="grid gap-3">
          {filtered.map((hh) => (
            <HouseholdCard key={hh.id} household={hh} />
          ))}
        </div>
      )}
    </div>
  )
}
