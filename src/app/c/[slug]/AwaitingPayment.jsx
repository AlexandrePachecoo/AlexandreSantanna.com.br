'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Clock, Copy, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AwaitingPayment({ slug, title, brCode, qrBase64, expiresAt }) {
  const router = useRouter()
  const target = expiresAt ? new Date(expiresAt).getTime() : null
  const [remaining, setRemaining] = useState(() => diff(target))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!target) return
    const t = setInterval(() => setRemaining(diff(target)), 1000)
    return () => clearInterval(t)
  }, [target])

  // Polling leve do status — quando webhook chegar e a carta virar 'paid',
  // a próxima reload via router.refresh() troca essa tela pela carta.
  useEffect(() => {
    if (!slug) return
    const t = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(t)
  }, [slug, router])

  async function copyBrCode() {
    if (!brCode) return
    try {
      await navigator.clipboard.writeText(brCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const expired = remaining != null && remaining <= 0

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700">
        <Mail className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {expired ? 'Pagamento expirado' : 'Pague para publicar sua carta'}
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        {title ? <>“{title}” </> : 'A carta '}
        {expired
          ? 'não foi paga a tempo. Crie outra carta para tentar de novo.'
          : 'fica disponível assim que o PIX cair (poucos segundos).'}
      </p>

      {!expired && remaining != null && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
          <Clock className="h-4 w-4" />
          expira em <span className="font-mono tabular-nums">{format(remaining)}</span>
        </div>
      )}

      {!expired && qrBase64 && (
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <img
            src={qrBase64}
            alt="QR Code PIX"
            className="mx-auto h-64 w-64 rounded-lg"
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Abra o app do seu banco e aponte a câmera no QR Code.
          </p>
        </div>
      )}

      {!expired && brCode && (
        <div className="mt-6 w-full max-w-md">
          <p className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
            ou cole o código no app do banco
          </p>
          <div className="mt-2 flex items-stretch gap-2">
            <code className="flex-1 truncate rounded-lg border border-border bg-secondary/40 px-3 py-2 text-left font-mono text-xs">
              {brCode}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyBrCode}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> copiar
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {!expired && !brCode && !qrBase64 && (
        <p className="mt-6 text-xs text-muted-foreground">
          Pagamento ainda não disponível. Tente recarregar em alguns segundos.
        </p>
      )}
    </div>
  )
}

function diff(target) {
  if (!target) return null
  return Math.max(0, target - Date.now())
}

function format(ms) {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
