'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Pagos' },
  { value: 'awaiting_payment', label: 'Aguardando' },
  { value: 'expired', label: 'Expirados' },
  { value: 'all', label: 'Todos' },
]

const PHOTO_OPTIONS = [
  { value: '', label: 'Foto: todas' },
  { value: '1', label: 'Com foto física' },
  { value: '0', label: 'Só digital' },
]

export function FilterBar({ status, photo }) {
  const router = useRouter()
  const params = useSearchParams()

  function setParam(key, value) {
    const next = new URLSearchParams(params)
    if (!value) next.delete(key)
    else next.set(key, value)
    router.push(`/admin?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status || 'paid'}
        onChange={(e) => setParam('status', e.target.value)}
        className="h-9 rounded-full border border-input bg-background px-3 text-sm shadow-sm"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select
        value={photo || ''}
        onChange={(e) => setParam('photo', e.target.value)}
        className="h-9 rounded-full border border-input bg-background px-3 text-sm shadow-sm"
      >
        {PHOTO_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
