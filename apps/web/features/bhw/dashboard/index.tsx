"use client"

import { SyncStatusBanner } from "./components/sync-status-banner"
import { ReturnedRecordsAlert } from "./components/returned-records-alert"
import { QuickActionCards } from "./components/quick-action-cards"
import { HouseholdsSummaryCard } from "./components/households-summary-card"
import { SummaryStatsGrid } from "./components/summary-stats-grid"
import { RecentActivityList } from "./components/recent-activity-list"
import type { mockBhwDashboard } from "./data/mock"

type BhwDashboardPageProps = typeof mockBhwDashboard

export function BhwDashboardPage({
  bhwName,
  bhsName,
  currentQuarter,
  currentYear,
  isOnline,
  pendingSyncCount,
  oldestPendingSyncAgo,
  returnedCount,
  draftCount,
  households,
  stats,
  recentHouseholds,
}: BhwDashboardPageProps) {
  const firstName = bhwName.split(" ")[0]

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Good morning, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">{bhsName}</p>
      </div>

      <SyncStatusBanner
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        oldestPendingSyncAgo={oldestPendingSyncAgo}
      />

      <ReturnedRecordsAlert count={returnedCount} />

      <SummaryStatsGrid
        total={stats.total}
        pendingSync={stats.pendingSync}
        validated={stats.validated}
        returned={stats.returned}
      />

      <QuickActionCards draftCount={draftCount} />

      <HouseholdsSummaryCard
        assigned={households.assigned}
        profiled={households.profiled}
        overdueUpdate={households.overdueUpdate}
        quarter={currentQuarter}
        year={currentYear}
      />

      <RecentActivityList households={recentHouseholds} />
    </section>
  )
}
