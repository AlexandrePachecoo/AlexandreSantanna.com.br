import { NextResponse } from 'next/server'
import { attachPayment, createLetter } from '@/services/letters'
import { validateLetterPayload, sanitizeText } from '@/lib/validators'
import { getClientIp, rateLimit, tickGC } from '@/lib/ratelimit'
import { serverErrorResponse, logServerError } from '@/lib/errors'
import {
  isMelhorEnvioConfigured,
  pickCheapest,
  quoteShipping,
} from '@/services/melhorEnvio'
import { createBilling, isAbacatePayConfigured } from '@/services/abacatePay'
import { computeAmountCents } from '@/constants/pricing'
import { absoluteUrl } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req) {
  tickGC()

  const ip = getClientIp(req)
  const rl = rateLimit({ ip, scope: 'create-letter', max: 6, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Muitas cartas em pouco tempo. Espere um instante.' },
      { status: 429 }
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const { valid, errors, data } = validateLetterPayload(body)
  if (!valid) {
    return NextResponse.json({ error: 'Dados inválidos.', errors }, { status: 422 })
  }

  data.title = sanitizeText(data.title)
  data.content = sanitizeText(data.content)
  data.senderName = sanitizeText(data.senderName)
  data.recipientName = sanitizeText(data.recipientName)
  data.timerLabel = sanitizeText(data.timerLabel)
  data.moments = (data.moments || []).map((m) => ({
    url: m.url,
    caption: sanitizeText(m.caption),
  }))

  if (data.shippingAddress) {
    const a = data.shippingAddress
    data.shippingAddress = {
      ...a,
      street: sanitizeText(a.street),
      number: sanitizeText(a.number),
      complement: sanitizeText(a.complement),
      neighborhood: sanitizeText(a.neighborhood),
      city: sanitizeText(a.city),
      recipient: sanitizeText(a.recipient),
    }
  }

  // Recotação com Melhor Envio antes de persistir.
  // O validator já populou shippingCostCents/Region pela tabela fixa;
  // se a API responder, sobrescrevemos com o valor real.
  if (data.physicalPhotoEnabled && data.shippingAddress?.cep && isMelhorEnvioConfigured()) {
    const result = await quoteShipping({ toCep: data.shippingAddress.cep })
    if (result.ok) {
      const best = pickCheapest(result.options)
      data.shippingCostCents = best.priceCents
      data.shippingRegion = best.company
        ? `${best.name} · ${best.company}`
        : best.name
    }
  }

  // Calcula o total cobrado no servidor (não confiamos no client).
  const amountCents = computeAmountCents({
    physicalPhotoEnabled: data.physicalPhotoEnabled,
    shippingCostCents: data.shippingCostCents,
  })
  data.paymentAmountCents = amountCents

  let row
  try {
    row = await createLetter(data)
  } catch (err) {
    return serverErrorResponse(
      'POST /api/letters',
      err,
      'Não consegui criar a carta. Tente novamente.'
    )
  }

  // Cria a cobrança no AbacatePay. Se falhar, devolvemos a carta criada (em
  // awaiting_payment) sem URL de pagamento — admin pode marcar paid manualmente
  // ou recriar a cobrança.
  let paymentUrl = null
  if (isAbacatePayConfigured()) {
    const description = `specialDay — Carta "${row.title}"`
    const billing = await createBilling({
      amountCents,
      description,
      externalId: row.slug,
      returnUrl: absoluteUrl(`/c/${row.slug}`),
      completionUrl: absoluteUrl(`/c/${row.slug}?paid=1`),
    })
    if (billing.ok) {
      paymentUrl = billing.url
      try {
        await attachPayment(row.id, {
          paymentId: billing.id,
          paymentUrl: billing.url,
        })
      } catch (err) {
        logServerError('attachPayment', err, { letterId: row.id })
      }
    } else {
      logServerError('createBilling', new Error(billing.reason || 'unknown'), {
        details: billing.details,
        status: billing.status,
        letterId: row.id,
      })
    }
  }

  return NextResponse.json({
    slug: row.slug,
    editToken: row.edit_token,
    paymentUrl,
    amountCents,
    paymentExpiresAt: row.payment_expires_at,
    physicalOrder: row.physical_photo_enabled
      ? {
          status: row.shipping_status,
          costCents: row.shipping_cost_cents,
          region: row.shipping_region,
          address: row.shipping_address,
        }
      : null,
  })
}
