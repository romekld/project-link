import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { mapViewportHeightClass } from './constants'

export function LoadingState() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.25fr]">
      <Card className={`overflow-hidden border-primary/10 ${mapViewportHeightClass}`}>
        <CardContent className="h-full p-0">
          <Skeleton className="h-full w-full rounded-none" />
        </CardContent>
      </Card>
      <Card className={`hidden overflow-hidden border-primary/10 xl:block ${mapViewportHeightClass}`}>
        <CardHeader className="border-b bg-muted/20">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-5">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
