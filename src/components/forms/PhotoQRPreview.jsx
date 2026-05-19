'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { ImageOff } from 'lucide-react'

export function PhotoQRPreview({ photoUrl, coverPosition, accentColor, letterUrl }) {
  const [qrDataUrl, setQrDataUrl] = useState(null)

  useEffect(() => {
    if (!letterUrl) {
      setQrDataUrl(null)
      return
    }
    let cancelled = false
    QRCode.toDataURL(letterUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
      color: { dark: accentColor || '#000000', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [letterUrl, accentColor])

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/60 bg-secondary">
      {photoUrl ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${photoUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: coverPosition || '50% 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2 text-center text-xs">
            <ImageOff className="h-6 w-6" />
            <p>Selecione uma capa ou foto para visualizar.</p>
          </div>
        </div>
      )}

      {photoUrl && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-black/15 via-transparent to-transparent" />
      )}

      {qrDataUrl && photoUrl && (
        <img
          src={qrDataUrl}
          alt="QR code"
          className="absolute bottom-3 right-3 h-20 w-20 rounded-lg bg-white p-1.5 shadow-md ring-1 ring-black/10 sm:h-24 sm:w-24"
        />
      )}
    </div>
  )
}
