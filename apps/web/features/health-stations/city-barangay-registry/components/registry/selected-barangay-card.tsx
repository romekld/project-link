import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { CityBarangayRegistryRecord } from '../../data/schema'
import { formatArea, formatDate } from '../../data/formatters'
import { ScopeBadge } from '../shared/scope-badge'

type SelectedBarangayCardProps = {
  record: CityBarangayRegistryRecord | null
}

export function SelectedBarangayCard({ record }: SelectedBarangayCardProps) {
  return (
    <Card className='shadow-none' size='sm'>
      <CardHeader>
        <CardTitle>Selected Barangay</CardTitle>
        <CardDescription>Current boundary selected from the map or table.</CardDescription>
      </CardHeader>
      <CardContent>
        {record ? (
          <div className='flex flex-col gap-3'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <p className='font-medium'>{record.name}</p>
                <p className='font-mono text-xs text-muted-foreground'>
                  {record.pcode} • {record.city}
                </p>
              </div>
              <ScopeBadge inCho2Scope={record.inCho2Scope} />
            </div>

            <Separator />

            <dl className='grid gap-2 sm:grid-cols-2'>
              <div className='py-1'>
                <dt className='text-xs text-muted-foreground'>Source record ID</dt>
                <dd className='mt-1 font-mono text-base font-medium tabular-nums leading-tight'>
                  {record.sourceFid}
                </dd>
              </div>
              <div className='py-1'>
                <dt className='text-xs text-muted-foreground'>Validity start</dt>
                <dd className='mt-1 text-base font-medium leading-tight'>
                  {formatDate(record.sourceValidOn)}
                </dd>
              </div>
              <div className='py-1 sm:col-span-2'>
                <dt className='text-xs text-muted-foreground'>Area</dt>
                <dd className='mt-1 font-mono text-base font-medium tabular-nums leading-tight'>
                  {formatArea(record.sourceAreaSqKm)}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <p className='text-sm text-muted-foreground'>
            Select a barangay from the map or table to view source metadata.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
