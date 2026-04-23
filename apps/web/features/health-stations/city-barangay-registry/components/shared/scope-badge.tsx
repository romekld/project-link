import { Badge } from '@/components/ui/badge'
import { formatScope } from '../../data/formatters'

type ScopeBadgeProps = {
  inCho2Scope: boolean
}

export function ScopeBadge({ inCho2Scope }: ScopeBadgeProps) {
  return (
    <Badge variant={inCho2Scope ? 'default' : 'secondary'}>
      {formatScope(inCho2Scope)}
    </Badge>
  )
}

