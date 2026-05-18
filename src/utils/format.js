export function formatDate(value, opts = {}) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...opts,
  }).format(d)
}

export function formatDateShort(value) {
  return formatDate(value, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatNumber(n) {
  return new Intl.NumberFormat('pt-BR').format(n || 0)
}

export function truncate(s, max = 120) {
  if (!s) return ''
  if (s.length <= max) return s
  return s.slice(0, max - 1).trimEnd() + '…'
}
