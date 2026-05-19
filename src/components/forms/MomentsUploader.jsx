'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadImage } from '@/lib/uploadImage'
import { LIMITS } from '@/lib/validators'

export function MomentsUploader({ value, onChange }) {
  const items = Array.isArray(value) ? value : []
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const canAddMore = items.length < LIMITS.moments

  async function pick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setLoading(true)
    try {
      const { publicUrl } = await uploadImage(file)
      onChange?.([...items, { url: publicUrl, caption: '' }])
    } catch (err) {
      setError(err.message || 'Não consegui enviar a imagem.')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function updateCaption(index, caption) {
    const next = items.map((m, i) =>
      i === index ? { ...m, caption: caption.slice(0, LIMITS.momentCaption) } : m
    )
    onChange?.(next)
  }

  function remove(index) {
    onChange?.(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={pick}
        className="sr-only"
      />

      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((m, i) => (
            <li
              key={`${m.url}-${i}`}
              className="flex gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-3"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-24 sm:w-20">
                <Image
                  src={m.url}
                  alt={`Momento ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 640px) 80px, 64px"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <textarea
                  value={m.caption || ''}
                  onChange={(e) => updateCaption(i, e.target.value)}
                  maxLength={LIMITS.momentCaption}
                  placeholder="O que esse momento significa?"
                  rows={3}
                  className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/50"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{(m.caption || '').length} / {LIMITS.momentCaption}</span>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> remover
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading || !canAddMore}
        className="group flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-border bg-secondary/30 px-6 py-5 text-sm font-medium transition-all hover:border-primary/50 hover:bg-secondary/60 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" />
            {canAddMore
              ? `Adicionar momento (${items.length}/${LIMITS.moments})`
              : `Limite de ${LIMITS.moments} momentos atingido`}
          </>
        )}
      </button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
