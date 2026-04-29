import { Badge } from '@/components/ui/badge'
import type { ChoAlertPreview } from '../data/schema'

type RailAlertFeedProps = {
  alerts: ChoAlertPreview[]
}

export function RailAlertFeed({ alerts }: RailAlertFeedProps) {
  return (
    <section className='rounded-xl border bg-background p-4 shadow-sm'>
      <div className='mb-3'>
        <h3 className='text-sm font-semibold text-foreground'>Recent alerts</h3>
        <p className='text-xs text-muted-foreground'>
          Compact feed of the most urgent current watch items.
        </p>
      </div>

      <div className='space-y-3'>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className='rounded-lg border bg-muted/10 px-3 py-3'
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='space-y-1'>
                <p className='text-sm font-medium text-foreground'>
                  {alert.barangayName}
                </p>
                <p className='text-xs text-muted-foreground'>{alert.title}</p>
              </div>
              <Badge variant={toSeverityVariant(alert.severity)}>
                {alert.severity}
              </Badge>
            </div>
            <div className='mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground'>
              <span>{alert.category}</span>
              <span>{formatAlertTimestamp(alert.recordedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function toSeverityVariant(severity: ChoAlertPreview['severity']) {
  if (severity === 'high') return 'default'
  if (severity === 'medium') return 'secondary'
  return 'outline'
}

function formatAlertTimestamp(recordedAt: string) {
  return new Date(recordedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
