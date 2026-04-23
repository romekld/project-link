'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type {
  CityBarangayGeometryVersion,
  CityBarangayRegistryRecord,
} from '../../data/schema'
import { formatDate } from '../../data/formatters'

type GeometryHistorySheetProps = {
  open: boolean
  record: CityBarangayRegistryRecord | null
  versions: CityBarangayGeometryVersion[]
  onOpenChange: (open: boolean) => void
}

export function GeometryHistorySheet({
  open,
  record,
  versions,
  onOpenChange,
}: GeometryHistorySheetProps) {
  const changeTypeLabel: Record<CityBarangayGeometryVersion['changeType'], string> = {
    create: 'Created from import',
    overwrite: 'Replaced geometry',
    manual_edit: 'Manual edit',
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-xl'>
        <SheetHeader>
          <SheetTitle>Boundary Version History</SheetTitle>
          <SheetDescription>
            Read-only change log for {record?.name ?? 'the selected barangay'}.
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 flex flex-col gap-4'>
          {versions.length ? (
            versions.map((version) => (
              <article className='rounded-md border p-4' key={version.id}>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='font-medium'>Version {version.versionNo}</p>
                    <p className='text-sm text-muted-foreground'>
                      {formatDate(version.changedAt)}
                    </p>
                  </div>
                  <Badge variant='secondary'>{changeTypeLabel[version.changeType]}</Badge>
                </div>
                <Separator className='my-3' />
                <dl className='grid gap-2 text-sm'>
                  <div className='flex items-center justify-between gap-3'>
                    <dt className='text-muted-foreground'>Change reason</dt>
                    <dd className='text-right'>{version.reason}</dd>
                  </div>
                  <div className='flex items-center justify-between gap-3'>
                    <dt className='text-muted-foreground'>Updated by</dt>
                    <dd>{version.changedBy}</dd>
                  </div>
                  <div className='flex items-center justify-between gap-3'>
                    <dt className='text-muted-foreground'>Source record ID</dt>
                    <dd className='font-mono tabular-nums'>
                      {version.sourcePayload.fid}
                    </dd>
                  </div>
                </dl>
              </article>
            ))
          ) : (
            <p className='text-sm text-muted-foreground'>
              No boundary history is available for this barangay yet.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

