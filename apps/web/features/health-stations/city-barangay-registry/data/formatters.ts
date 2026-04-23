import type {
  CityBarangayImportAction,
  CityBarangayImportStatus,
} from './schema'

export function formatDate(value: string | null | undefined) {
  if (!value) return 'Not set'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatArea(value: number | null | undefined) {
  if (typeof value !== 'number') return 'Not set'

  return `${value.toLocaleString('en', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
  })} sq km`
}

export function formatCompactNumber(value: number) {
  return value.toLocaleString('en')
}

export function formatImportAction(action: CityBarangayImportAction) {
  const labels: Record<CityBarangayImportAction, string> = {
    create: 'Ready to add',
    review_required: 'Needs decision',
    overwrite: 'Ready to replace',
    skip: 'Skipped',
    invalid: 'Invalid feature',
    committed: 'Committed',
  }

  return labels[action]
}

export function formatImportStatus(status: CityBarangayImportStatus) {
  const labels: Record<CityBarangayImportStatus, string> = {
    uploaded: 'Uploaded',
    validated: 'Validated',
    committed: 'Committed',
    failed: 'Failed',
    cancelled: 'Cancelled',
  }

  return labels[status]
}

export function formatScope(inCho2Scope: boolean) {
  return inCho2Scope ? 'In scope' : 'Out of scope'
}

