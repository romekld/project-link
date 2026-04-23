import {
  CheckCircle2Icon,
  CircleIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from 'lucide-react'

export const coverageScopeOptions = [
  {
    label: 'In CHO2 scope',
    value: 'in_scope',
    icon: CheckCircle2Icon,
  },
  {
    label: 'Outside scope',
    value: 'outside_scope',
    icon: CircleIcon,
  },
]

export const stagedActionOptions = [
  {
    label: 'No change',
    value: 'none',
    icon: CircleIcon,
  },
  {
    label: 'Will add',
    value: 'add',
    icon: PlusCircleIcon,
  },
  {
    label: 'Will remove',
    value: 'remove',
    icon: MinusCircleIcon,
  },
]

