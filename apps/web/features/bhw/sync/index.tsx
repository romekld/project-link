"use client"

import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CloudOff,
  CloudUpload,
  RefreshCw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"
import type { SyncRecord } from "./data/mock"

type BhwSyncPageProps = {
  records: SyncRecord[]
  isOnline: boolean
}

export function BhwSyncPage({ records, isOnline }: BhwSyncPageProps) {
  const returned = records.filter((r) => r.status === "returned")
  const pending = records.filter((r) => r.status === "pending_sync")

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Sync Queue"
        description="Records waiting to sync or needing correction."
      />

      <div
        className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
          isOnline
            ? "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100"
            : "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
        }`}
      >
        {isOnline ? (
          <CheckCircle2 className="size-4 shrink-0" />
        ) : (
          <CloudOff className="size-4 shrink-0" />
        )}
        <span className="font-medium">{isOnline ? "Online" : "Offline — working locally"}</span>
        {pending.length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {pending.length} pending
          </Badge>
        )}
      </div>

      {returned.length > 0 && (
        <Card>
          <CardHeader className="border-b pb-3 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base text-destructive">
                <AlertTriangle className="size-4" />
                Returned — Needs Correction
              </CardTitle>
              <Badge variant="destructive">{returned.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="flex flex-col gap-3">
              {returned.map((record, index) => (
                <div key={record.id}>
                  {index > 0 && <Separator className="mb-3" />}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{record.respondentName}</p>
                        <p className="text-xs text-muted-foreground">{record.householdNumber}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{record.ageLabel}</span>
                    </div>
                    {record.returnedReason && (
                      <div className="rounded-md bg-destructive/5 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                        <span className="font-medium">Reason: </span>
                        {record.returnedReason}
                      </div>
                    )}
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link href={`/bhw/households/${record.id}/edit`}>
                        Fix and Resubmit
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pending.length > 0 && (
        <Card>
          <CardHeader className="border-b pb-3 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <CloudUpload className="size-4" />
                Pending Sync
              </CardTitle>
              <Badge variant="secondary">{pending.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="flex flex-col gap-0">
              {pending.map((record, index) => (
                <div key={record.id}>
                  {index > 0 && <Separator />}
                  <div className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <Clock className="size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{record.respondentName}</p>
                        <p className="text-xs text-muted-foreground">{record.householdNumber}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{record.ageLabel}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full gap-2"
              disabled={!isOnline}
            >
              <RefreshCw className="size-4" />
              {isOnline ? "Retry Sync" : "Sync unavailable offline"}
            </Button>
          </CardContent>
        </Card>
      )}

      {returned.length === 0 && pending.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
          <CheckCircle2 className="size-8 text-muted-foreground" />
          <p className="font-medium">All records synced</p>
          <p className="text-sm text-muted-foreground">No pending or returned records.</p>
        </div>
      )}
    </section>
  )
}
