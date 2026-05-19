'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Move, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadImage } from '@/lib/uploadImage'
import { cn } from '@/lib/utils'

export function CoverUploader({ value, onChange, position, onPositionChange }) {
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const dragState = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)

  const safePosition = isValidPosition(position) ? position : '50% 50%'

  async function pick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setLoading(true)
    try {
      const { publicUrl } = await uploadImage(file)
      onChange?.(publicUrl)
      onPositionChange?.('50% 50%')
    } catch (err) {
      setError(err.message || 'Não consegui enviar a imagem.')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function onPointerDown(e) {
    if (!onPositionChange) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const [x, y] = parsePosition(safePosition)
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: x,
      baseY: y,
      width: rect.width,
      height: rect.height,
    }
    setDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  function onPointerMove(e) {
    const s = dragState.current
    if (!s) return
    const dx = ((e.clientX - s.startX) / s.width) * 100
    const dy = ((e.clientY - s.startY) / s.height) * 100
    const nx = clamp(s.baseX - dx, 0, 100)
    const ny = clamp(s.baseY - dy, 0, 100)
    onPositionChange?.(`${Math.round(nx)}% ${Math.round(ny)}%`)
  }

  function onPointerUp(e) {
    if (!dragState.current) return
    dragState.current = null
    setDragging(false)
    e.currentTarget.releasePointerCapture?.(e.pointerId)
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
        <div className="space-y-2">
          <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className={cn(
              'relative aspect-[16/9] w-full select-none overflow-hidden rounded-2xl border border-border/60 bg-secondary touch-none',
              onPositionChange && (dragging ? 'cursor-grabbing' : 'cursor-grab')
            )}
            style={{
              backgroundImage: `url(${value})`,
              backgroundSize: 'cover',
              backgroundPosition: safePosition,
              backgroundRepeat: 'no-repeat',
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange?.(null)
              }}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              aria-label="Remover capa"
            >
              <X className="h-4 w-4" />
            </button>
            {onPositionChange && (
              <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
                <Move className="h-3 w-3" /> arraste para enquadrar
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Trocar imagem
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className={cn(
            'group flex min-h-[160px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/30 px-6 py-8 text-center transition-all hover:border-primary/50 hover:bg-secondary/60 sm:min-h-[180px] sm:py-10',
            loading && 'opacity-60'
          )}
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-rose-200/40 text-primary ring-1 ring-primary/15 transition-transform group-hover:rotate-[-6deg]">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {loading ? 'Enviando…' : 'Adicionar imagem de capa'}
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP · até 8MB</p>
          </div>
        </button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function parsePosition(pos) {
  const m = String(pos).match(/^(\d{1,3})% (\d{1,3})%$/)
  if (!m) return [50, 50]
  return [Number(m[1]), Number(m[2])]
}

function isValidPosition(pos) {
  return typeof pos === 'string' && /^\d{1,3}% \d{1,3}%$/.test(pos)
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}
