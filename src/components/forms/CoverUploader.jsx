'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MAX_BYTES = 8 * 1024 * 1024

export function CoverUploader({ value, onChange }) {
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function pick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Imagem maior que 8MB.')
      return
    }

    setLoading(true)
    try {
      const compressed = await compressImage(file)
      const sigRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType: compressed.type, size: compressed.size }),
      })
      const sig = await sigRes.json()
      if (!sigRes.ok) throw new Error(sig.error || 'Falha ao gerar upload URL.')

      const up = await fetch(sig.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': compressed.type },
        body: compressed,
      })
      if (!up.ok) throw new Error('Falha no upload.')

      onChange?.(sig.publicUrl)
    } catch (err) {
      setError(err.message || 'Não consegui enviar a imagem.')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={pick}
        className="sr-only"
      />

      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-border/60">
          <div className="relative aspect-[16/9] w-full bg-secondary">
            <Image src={value} alt="Capa" fill className="object-cover" sizes="700px" />
          </div>
          <button
            type="button"
            onClick={() => onChange?.(null)}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            aria-label="Remover capa"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/40 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-secondary',
            loading && 'opacity-60'
          )}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          )}
          <p className="text-sm font-medium">
            {loading ? 'Enviando...' : 'Adicionar imagem de capa'}
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP até 8MB</p>
        </button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          Trocar imagem
        </Button>
      )}
    </div>
  )
}

async function compressImage(file, maxDim = 1600, quality = 0.85) {
  if (typeof window === 'undefined') return file
  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })

  const img = await new Promise((resolve, reject) => {
    const i = new window.Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = dataUrl
  })

  let { width, height } = img
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width)
      width = maxDim
    } else {
      width = Math.round((width * maxDim) / height)
      height = maxDim
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  )
  return new File([blob], 'cover.jpg', { type: 'image/jpeg' })
}
