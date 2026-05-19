'use client'

import { useEffect, useState } from 'react'
import { Clock, ExternalLink, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AwaitingPayment({ title, paymentUrl, expiresAt }) {
  const target = expiresAt ? new Date(expiresAt).getTime() : null
  const [remaining, setRemaining] = useState(() => diff(target))

  useEffect(() => {
    if (!target) return
    const t = setInterval(() => setRemaining(diff(target)), 1000)
    return () => clearInterval(t)
  }, [target])

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700">
        <Mail className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Sua carta está esperando o pagamento.
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        {title ? <>“{title}” </> : 'A carta '}
        ainda não foi publicada. Conclua o pagamento via PIX para liberar o link público.
      </p>

      {remaining != null && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
          <Clock className="h-4 w-4" />
          {remaining > 0
            ? <>expira em <span className="font-mono tabular-nums">{format(remaining)}</span></>
            : 'tempo esgotado'}
        </div>
      )}

      {paymentUrl && remaining > 0 && (
        <Button asChild size="lg" className="mt-8">
          <a href={paymentUrl} target="_blank" rel="noreferrer">
            Pagar agora <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}

      {(!paymentUrl || remaining <= 0) && (
        <p className="mt-6 text-xs text-muted-foreground">
          {remaining <= 0
            ? 'O link de pagamento expirou. Crie outra carta para tentar de novo.'
            : 'Link de pagamento ainda não disponível. Tente recarregar em alguns segundos.'}
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
