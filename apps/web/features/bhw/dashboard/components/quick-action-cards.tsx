import Link from "next/link"
import { ClipboardList, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

type QuickActionCardsProps = {
  draftCount: number
}

export function QuickActionCards({ draftCount }: QuickActionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button
        asChild
        className="justify-start gap-3 py-3 text-left"
      >
        <Link href="/bhw/households/new">
          <Plus className="size-5 shrink-0" />
          <span>
            <span className="block text-sm font-semibold">New HH Profile</span>
            <span className="block text-xs font-normal opacity-80">Start a new household record</span>
          </span>
        </Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className="justify-start gap-3 py-3 text-left"
        disabled={draftCount === 0}
      >
        <Link href="/bhw/households?status=draft">
          <ClipboardList className="size-5 shrink-0" />
          <span>
            <span className="block text-sm font-semibold">
              Continue Drafts
              {draftCount > 0 && (
                <span className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {draftCount}
                </span>
              )}
            </span>
            <span className="block text-xs font-normal text-muted-foreground">
              {draftCount > 0 ? `${draftCount} saved locally` : "No drafts"}
            </span>
          </span>
        </Link>
      </Button>
    </div>
  )
}
