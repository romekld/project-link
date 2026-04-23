import { Badge } from '@/components/ui/badge'
import { formatImportAction } from '../../data/formatters'
import type { CityBarangayImportAction } from '../../data/schema'

type ImportStatusBadgeProps = {
  action: CityBarangayImportAction
}

export function ImportStatusBadge({ action }: ImportStatusBadgeProps) {
  if (action === 'invalid') {
    return <Badge variant='destructive'>{formatImportAction(action)}</Badge>
  }

  if (action === 'overwrite' || action === 'review_required') {
    return <Badge variant='outline'>{formatImportAction(action)}</Badge>
  }

  if (action === 'skip') {
    return <Badge variant='secondary'>{formatImportAction(action)}</Badge>
  }

  return <Badge variant='default'>{formatImportAction(action)}</Badge>
}

