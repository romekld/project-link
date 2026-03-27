import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Construction } from 'lucide-react'

export function PlaceholderPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-10">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Construction className="size-6 text-muted-foreground" />
          </div>
          <p className="font-heading text-lg font-semibold">Coming in Phase 2</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This feature is being built. Check back in the next release.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-6"
            nativeButton={false}
            render={<Link to=".." />}
          >
            Go back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
