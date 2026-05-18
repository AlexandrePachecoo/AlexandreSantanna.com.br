'use client'

import { useState } from 'react'
import { MessageCircle, Share2 } from 'lucide-react'
import { CopyButton } from '@/components/shared/CopyButton'
import { Button } from '@/components/ui/button'

export function ShareButtons({ url, title }) {
  const [error, setError] = useState(null)

  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ url, title: title || 'Para você' })
      }
    } catch (e) {
      if (e?.name !== 'AbortError') setError('Não consegui abrir o compartilhar nativo.')
    }
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `${title ? `${title}\n` : ''}${url}`
  )}`

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton value={url} label="Copiar link" variant="outline" size="sm" />
      <Button asChild variant="outline" size="sm">
        <a href={whatsappHref} target="_blank" rel="noreferrer">
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
      </Button>
      {typeof window !== 'undefined' && 'share' in navigator && (
        <Button type="button" variant="outline" size="sm" onClick={nativeShare}>
          <Share2 className="h-3.5 w-3.5" /> Compartilhar
        </Button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
