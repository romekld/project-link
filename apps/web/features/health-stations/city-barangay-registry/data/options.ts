import type React from 'react'
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleIcon,
  ClipboardCheckIcon,
  FileWarningIcon,
  HistoryIcon,
  RotateCcwIcon,
} from 'lucide-react'
import type { CityBarangayImportAction } from './schema'

export const scopeOptions = [
  {
    label: 'In scope',
    value: 'in_scope',
    icon: CheckCircle2Icon,
  },
  {
    label: 'Out of scope',
    value: 'outside_scope',
    icon: CircleIcon,
  },
]

export const importActionOptions: {
  label: string
  value: CityBarangayImportAction
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    label: 'Ready to add',
    value: 'create',
    icon: ClipboardCheckIcon,
  },
  {
    label: 'Needs decision',
    value: 'review_required',
    icon: HistoryIcon,
  },
  {
    label: 'Ready to replace',
    value: 'overwrite',
    icon: RotateCcwIcon,
  },
  {
    label: 'Skipped',
    value: 'skip',
    icon: CircleIcon,
  },
  {
    label: 'Invalid feature',
    value: 'invalid',
    icon: FileWarningIcon,
  },
  {
    label: 'Committed',
    value: 'committed',
    icon: CheckCircle2Icon,
  },
]

export const validityOptions = [
  {
    label: 'Current boundary',
    value: 'current',
    icon: CheckCircle2Icon,
  },
  {
    label: 'Has validity end date',
    value: 'has_valid_to',
    icon: AlertTriangleIcon,
  },
]
