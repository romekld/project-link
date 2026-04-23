"use client"

import { AlertCircle, CheckCircle2, Clock, CloudOff } from "lucide-react"
import { cn } from "@/lib/utils"

type SyncStatusBannerProps = {
  isOnline: boolean
  pendingSyncCount: number
  oldestPendingSyncAgo?: string
}

export function SyncStatusBanner({
  isOnline,
  pendingSyncCount,
  oldestPendingSyncAgo,
}: SyncStatusBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 text-sm",
        isOnline
          ? pendingSyncCount > 0
            ? "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100"
            : "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100"
          : "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
      )}
    >
      {isOnline ? (
        pendingSyncCount > 0 ? (
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        )
      ) : (
        <CloudOff className="mt-0.5 size-4 shrink-0" />
      )}

      <div className="flex-1">
        <p className="font-medium">
          {isOnline ? "Online" : "Offline — working locally"}
        </p>
        {pendingSyncCount > 0 && (
          <p className="mt-0.5 text-xs opacity-80">
            {pendingSyncCount} record{pendingSyncCount !== 1 ? "s" : ""} pending sync
            {oldestPendingSyncAgo ? ` · oldest ${oldestPendingSyncAgo}` : ""}
          </p>
        )}
        {isOnline && pendingSyncCount === 0 && (
          <p className="mt-0.5 text-xs opacity-80">All records synced</p>
        )}
        {!isOnline && (
          <p className="mt-0.5 text-xs opacity-80">
            Records save locally and will sync automatically when you reconnect.
          </p>
        )}
      </div>

      {pendingSyncCount > 0 && (
        <div className="flex items-center gap-1 text-xs font-medium opacity-80">
          <Clock className="size-3" />
          {pendingSyncCount}
        </div>
      )}
    </div>
  )
}
