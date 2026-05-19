import Link from 'next/link'
import { ArrowRight, ImagePlus, Package } from 'lucide-react'
import { listOrders, toAdminOrder } from '@/services/letters'
import { formatBRL } from '@/constants/pricing'
import { Badge } from '@/components/ui/badge'
import { FilterBar } from './FilterBar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PAYMENT_LABEL = {
  awaiting_payment: { label: 'Aguardando', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  paid: { label: 'Pago', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  expired: { label: 'Expirado', className: 'bg-zinc-100 text-zinc-600 border-zinc-300' },
  refunded: { label: 'Reembolsado', className: 'bg-rose-100 text-rose-800 border-rose-300' },
}

const SHIPPING_LABEL = {
  pending: 'A confirmar',
  paid: 'Pago — imprimir',
  shipped: 'Enviado',
  delivered: 'Entregue',
  canceled: 'Cancelado',
}

export default async function AdminHomePage({ searchParams }) {
  const sp = await searchParams
  const status = typeof sp?.status === 'string' ? sp.status : 'paid'
  const photo = sp?.photo
  const hasPhoto = photo === '1' ? true : photo === '0' ? false : undefined

  const rows = await listOrders({ status, hasPhoto })
  const orders = rows.map(toAdminOrder)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Pedidos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length} pedido{orders.length === 1 ? '' : 's'} encontrado{orders.length === 1 ? '' : 's'}.
          </p>
        </div>
        <FilterBar status={status} photo={photo} />
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-12 text-center text-sm text-muted-foreground">
          Nenhum pedido com esses filtros.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Quando</th>
                <th className="px-4 py-3 font-medium">Carta</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Pagamento</th>
                <th className="px-4 py-3 font-medium">Foto física</th>
                <th className="px-4 py-3 font-medium">Envio</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const pay = PAYMENT_LABEL[o.paymentStatus] || PAYMENT_LABEL.awaiting_payment
                return (
                  <tr key={o.id} className="border-t border-border/40 hover:bg-secondary/30">
                    <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                      {formatRelative(o.paymentPaidAt || o.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                        {o.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {o.senderName || 'Anônimo'} → {o.recipientName || 'sem destinatário'}
                      </p>
                      <p className="mt-0.5 font-mono text-[0.65rem] text-muted-foreground">/c/{o.slug}</p>
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-xs tabular-nums">
                      {formatBRL(o.paymentAmountCents)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge className={`border ${pay.className}`}>{pay.label}</Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {o.physicalPhotoEnabled ? (
                        <span className="inline-flex items-center gap-1 text-rose-700">
                          <ImagePlus className="h-3 w-3" />
                          sim
                        </span>
                      ) : (
                        <span className="text-muted-foreground">não</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs">
                      {o.physicalPhotoEnabled
                        ? SHIPPING_LABEL[o.shippingStatus] || '—'
                        : '—'}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        ver <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        <Package className="mr-1 inline h-3 w-3" />
        Foto física é só impressa após pagamento confirmado. Marque como enviado quando despachar.
      </p>
    </div>
  )
}

function formatRelative(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const now = Date.now()
  const diff = now - d.getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min}min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `há ${hr}h`
  const day = Math.floor(hr / 24)
  if (day < 7) return `há ${day}d`
  return d.toLocaleDateString('pt-BR')
}
