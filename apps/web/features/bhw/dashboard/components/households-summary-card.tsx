import Link from "next/link"
import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

type HouseholdsSummaryCardProps = {
  assigned: number
  profiled: number
  overdueUpdate: number
  quarter: string
  year: number
}

export function HouseholdsSummaryCard({
  assigned,
  profiled,
  overdueUpdate,
  quarter,
  year,
}: HouseholdsSummaryCardProps) {
  const pct = assigned > 0 ? Math.round((profiled / assigned) * 100) : 0
  const remaining = assigned - profiled

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">My Households</CardTitle>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {quarter} {year}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="font-medium">{profiled} profiled</span>
            <span className="text-muted-foreground">of {assigned} assigned</span>
          </div>
          <Progress value={pct} className="h-2" />
          <p className="mt-1 text-xs text-muted-foreground">
            {remaining > 0 ? `${remaining} remaining` : "All households profiled"}
          </p>
        </div>

        {overdueUpdate > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs dark:border-yellow-800 dark:bg-yellow-950">
            <Clock className="size-3.5 shrink-0 text-yellow-600 dark:text-yellow-400" />
            <span className="text-yellow-800 dark:text-yellow-200">
              {overdueUpdate} household{overdueUpdate !== 1 ? "s" : ""} overdue for {quarter} update
            </span>
          </div>
        )}

        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/bhw/households">View All Households</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
