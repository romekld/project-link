import { Badge } from '@/components/ui/badge'
import type { CoveragePlannerRecord } from '../../data/coverage-schema'

type CoverageStatusBadgeProps = {
  record: Pick<CoveragePlannerRecord, 'currentScope' | 'stagedAction'>
}

export function CoverageStatusBadge({ record }: CoverageStatusBadgeProps) {
  if (record.stagedAction === 'add') {
    return <Badge variant='default'>Will add</Badge>
  }

  if (record.stagedAction === 'remove') {
    return <Badge variant='destructive'>Will remove</Badge>
  }

  return (
    <Badge variant={record.currentScope === 'in_scope' ? 'default' : 'secondary'}>
      {record.currentScope === 'in_scope' ? 'In CHO2 scope' : 'Outside scope'}
    </Badge>
  )
}

