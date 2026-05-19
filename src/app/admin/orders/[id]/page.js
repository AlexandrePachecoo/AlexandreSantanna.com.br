import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, MapPin, Package, Receipt } from 'lucide-react'
import { getOrderById, toAdminOrder } from '@/services/letters'
import { Badge } from '@/components/ui/badge'
import { formatBRL } from '@/constants/pricing'
import { OrderActions } from './OrderActions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PAYMENT_LABEL = {
  awaiting_payment: 'Aguardando',
  paid: 'Pago',
  expired: 'Expirado',
  refunded: 'Reembolsado',
}

const SHIPPING_LABEL = {
  pending: 'A confirmar',
  paid: 'Pago — imprimir',
  shipped: 'Enviado',
  delivered: 'Entregue',
  canceled: 'Cancelado',
}

export default async function OrderDetailPage({ params }) {
  const { id } = await params
  const row = await getOrderById(id).catch(() => null)
  if (!row) notFound()

  const order = toAdminOrder(row)
  const photoUrl = order.physicalPhotoUrl || order.coverImage
  const a = order.shippingAddress

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> voltar
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{order.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            de <span className="font-medium text-foreground">{order.senderName || 'anônimo'}</span> para{' '}
            <span className="font-medium text-foreground">{order.recipientName || '—'}</span>
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            /c/{order.slug} · criado em {new Date(order.createdAt).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{PAYMENT_LABEL[order.paymentStatus]}</Badge>
          {order.physicalPhotoEnabled && (
            <Badge variant="default" className="bg-rose-100 text-rose-700">
              <Package className="mr-1 h-3 w-3" /> {SHIPPING_LABEL[order.shippingStatus] || '—'}
            </Badge>
          )}
        </div>
      </div>

      {/* Pagamento */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Receipt className="h-4 w-4" /> Pagamento
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Info label="Total" value={formatBRL(order.paymentAmountCents)} mono />
          <Info
            label="Pago em"
            value={
              order.paymentPaidAt
                ? new Date(order.paymentPaidAt).toLocaleString('pt-BR')
                : '—'
            }
          />
          <Info
            label="ID AbacatePay"
            value={order.paymentId || '—'}
            mono
            small
          />
        </div>
        {order.paymentUrl && (
          <a
            href={order.paymentUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            checkout <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </section>

      {/* Foto física + endereço */}
      {order.physicalPhotoEnabled && (
        <section className="rounded-2xl border border-rose-200/60 bg-rose-50/60 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-rose-800">
            <Package className="h-4 w-4" /> Foto física — imprimir e enviar
          </h2>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              {photoUrl ? (
                <a
                  href={photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block aspect-[4/5] w-full overflow-hidden rounded-xl border border-border bg-secondary"
                  title="Abrir em alta resolução"
                >
                  <Image
                    src={photoUrl}
                    alt="Foto para impressão"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform group-hover:scale-[1.02]"
                  />
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
                    abrir em alta
                  </span>
                </a>
              ) : (
                <div className="grid aspect-[4/5] place-items-center rounded-xl border border-dashed border-border bg-secondary/40 text-xs text-muted-foreground">
                  Sem foto anexada
                </div>
              )}
              {photoUrl && (
                <a
                  href={photoUrl}
                  download
                  className="mt-3 inline-flex items-center gap-1 text-xs text-rose-800 hover:underline"
                >
                  baixar arquivo original
                </a>
              )}
            </div>

            <div>
              <div className="rounded-xl bg-white/70 p-4 text-sm">
                <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Endereço
                </p>
                {a ? (
                  <div className="mt-2 space-y-1">
                    <p className="font-medium text-foreground">{a.recipient}</p>
                    <p>
                      {a.street}, {a.number}
                      {a.complement ? ` — ${a.complement}` : ''}
                    </p>
                    <p>{a.neighborhood}</p>
                    <p>
                      {a.city}/{a.uf} — CEP {formatCep(a.cep)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-muted-foreground">Endereço não informado.</p>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <Info label="Frete" value={formatBRL(order.shippingCostCents)} mono />
                <Info label="Região" value={order.shippingRegion || '—'} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Conteúdo da carta */}
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Mensagem
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {order.content}
        </p>
        <div className="mt-4">
          <Link
            href={`/c/${order.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            abrir carta pública <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </section>

      <OrderActions order={order} />
    </div>
  )
}

function Info({ label, value, mono, small }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={[
          'mt-1 truncate font-medium text-foreground',
          mono && 'font-mono',
          small && 'text-xs',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </p>
    </div>
  )
}

function formatCep(raw) {
  const d = String(raw || '').replace(/\D/g, '')
  if (d.length !== 8) return raw || '—'
  return `${d.slice(0, 5)}-${d.slice(5)}`
}
