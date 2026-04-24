import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonFormPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-[1000px] flex-1 flex-col overflow-hidden">
        <div className="shrink-0 bg-background pb-4 sm:pb-6">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-56" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-28" />
            </div>
          </header>
        </div>

        <div className="flex flex-col gap-4 px-1 py-2 sm:gap-5 sm:pr-2">
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="shadow-none">
                  <CardHeader className="border-b">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="space-y-1.5">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <aside className="h-fit self-start rounded-2xl border border-dashed bg-card p-3">
              <div className="flex flex-col items-center gap-3 py-4">
                <Skeleton className="size-16 rounded-xl" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="mt-2 flex flex-col gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="shadow-none">
                    <CardHeader>
                      <Skeleton className="h-4 w-28" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="flex justify-between">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </aside>
          </section>
        </div>
      </section>
    </div>
  )
}
