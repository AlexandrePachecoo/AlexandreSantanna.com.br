'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OrderActions({ order }) {
  const router = useRouter()
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)

  async function patch(payload, label) {
    setBusy(label)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError(json?.error || 'Falha ao atualizar.')
        return
      }
      router.refresh()
    } catch {
      setError('Erro de rede.')
    } finally {
      setBusy(null)
    }
  }

  const canMarkPaid = order.paymentStatus !== 'paid'
  const canMarkShipped =
    order.physicalPhotoEnabled &&
    order.paymentStatus === 'paid' &&
    order.shippingStatus === 'paid'
  const canMarkDelivered =
    order.physicalPhotoEnabled && order.shippingStatus === 'shipped'

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Ações
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {canMarkPaid && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => patch({ paymentStatus: 'paid' }, 'paid')}
            disabled={!!busy}
          >
            {busy === 'paid' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Marcar como pago manualmente
          </Button>
        )}
        {canMarkShipped && (
          <Button
            size="sm"
            onClick={() => patch({ shippingStatus: 'shipped' }, 'shipped')}
            disabled={!!busy}
          >
            {busy === 'shipped' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
            Marcar como enviado
          </Button>
        )}
        {canMarkDelivered && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => patch({ shippingStatus: 'delivered' }, 'delivered')}
            disabled={!!busy}
          >
            {busy === 'delivered' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Marcar como entregue
          </Button>
        )}
        {!canMarkPaid && !canMarkShipped && !canMarkDelivered && (
          <p className="text-sm text-muted-foreground">Nada para fazer agora.</p>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </section>
  )
}
