import { NextResponse } from 'next/server'
import { markAsPaid } from '@/services/letters'
import { getWebhookSecret } from '@/services/abacatePay'
import { logServerError, serverErrorResponse } from '@/lib/errors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// AbacatePay → POST com evento de cobrança.
// Validação por shared secret: o secret pode vir tanto na query string
// (?webhookSecret=...) quanto em um header. Aceitamos os dois pra ser tolerante.

export async function POST(req) {
  const expected = getWebhookSecret()
  if (!expected) {
    logServerError('webhook/abacatepay', new Error('ABACATEPAY_WEBHOOK_SECRET ausente'))
    return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 500 })
  }

  const url = new URL(req.url)
  const provided =
    url.searchParams.get('webhookSecret') ||
    req.headers.get('webhook-secret') ||
    req.headers.get('x-webhook-secret') ||
    req.headers.get('x-abacate-secret') ||
    ''

  if (provided !== expected) {
    return NextResponse.json({ error: 'Segredo inválido.' }, { status: 401 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const event = body?.event || body?.type || ''
  const payload = body?.data || body

  // Eventos esperados: billing.paid (cobrança paga). Variações de nomenclatura
  // toleradas para reduzir acoplamento com formato exato do gateway.
  const isPaid = /paid|approved|completed/i.test(event || payload?.status || '')

  if (!isPaid) {
    // Evento que não exige ação. 200 pra confirmar recebimento.
    return NextResponse.json({ ok: true, ignored: true, event })
  }

  const billing = payload?.billing || payload?.pixQrCode || payload
  const paymentId = billing?.id || billing?.billingId || null
  const externalSlug =
    billing?.externalId || billing?.metadata?.externalId || null

  try {
    const result = await markAsPaid({ paymentId, externalSlug })
    if (!result.ok) {
      logServerError('webhook/abacatepay markAsPaid', new Error(result.reason), {
        paymentId,
        externalSlug,
      })
      return NextResponse.json({ ok: false, reason: result.reason }, { status: 404 })
    }
    return NextResponse.json({ ok: true, alreadyPaid: !!result.alreadyPaid })
  } catch (err) {
    return serverErrorResponse('webhook/abacatepay', err, 'Falha ao processar webhook.')
  }
}
