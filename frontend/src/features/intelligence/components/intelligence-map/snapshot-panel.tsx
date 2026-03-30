import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import type { BarangaySnapshot, MapRoleView } from '@/features/intelligence/types'
import { DetailPanel } from './detail-panel'
import { mapViewportHeightClass } from './constants'

interface SnapshotPanelProps {
  isMobile: boolean
  roleView: MapRoleView
  snapshot: BarangaySnapshot | null
  onClose: () => void
}

export function SnapshotPanel({ isMobile, roleView, snapshot, onClose }: SnapshotPanelProps) {
  if (isMobile) {
    return (
      <Drawer open={Boolean(snapshot)} onOpenChange={(open) => (!open ? onClose() : null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Barangay snapshot</DrawerTitle>
            <DrawerDescription>Tap outside the drawer to return to the full map canvas.</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <DetailPanel roleView={roleView} snapshot={snapshot} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Card className={`${mapViewportHeightClass} overflow-hidden border-primary/10`}>
      <CardHeader className="border-b bg-muted/20">
        <CardTitle>Barangay snapshot</CardTitle>
        <CardDescription>Focused operational context for the currently selected polygon.</CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-5.25rem)] overflow-y-auto p-5">
        <DetailPanel roleView={roleView} snapshot={snapshot} />
      </CardContent>
    </Card>
  )
}
