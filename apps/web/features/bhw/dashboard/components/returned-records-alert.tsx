import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

type ReturnedRecordsAlertProps = {
  count: number
}

export function ReturnedRecordsAlert({ count }: ReturnedRecordsAlertProps) {
  if (count === 0) return null

  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex-1">
        <p className="font-medium text-destructive">
          {count} record{count !== 1 ? "s" : ""} returned for correction
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          The Midwife has reviewed and returned these records. Check the correction reason and resubmit.
        </p>
      </div>
      <Button asChild size="sm" variant="destructive" className="shrink-0 text-xs">
        <Link href="/bhw/sync">Fix Now</Link>
      </Button>
    </div>
  )
}
