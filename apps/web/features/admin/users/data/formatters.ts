export function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '')

  if (digits.length === 12 && digits.startsWith('63')) {
    const local = `0${digits.slice(2)}`
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7, 11)}`
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`
  }

  return value
}

export function formatLastLoginDateTime(lastLoginAt: string | null) {
  if (!lastLoginAt) return 'Never logged in'

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(lastLoginAt))
}
