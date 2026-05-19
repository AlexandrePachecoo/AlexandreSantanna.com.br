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
import { createPixCharge, isAbacatePayConfigured } from '@/services/abacatePay'
import { computeAmountCents, PAYMENT_EXPIRY_MINUTES } from '@/constants/pricing'

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

  // Cria a cobrança PIX no AbacatePay. Se falhar, a carta fica em awaiting_payment
  // sem QR e o admin pode marcar como paga manualmente.
  let pixData = null
  if (isAbacatePayConfigured()) {
    const description = `specialDay — Carta "${row.title}"`
    const charge = await createPixCharge({
      amountCents,
      description,
      externalId: row.slug,
      expiresInSeconds: PAYMENT_EXPIRY_MINUTES * 60,
    })
    if (charge.ok) {
      pixData = {
        brCode: charge.brCode,
        brCodeBase64: charge.brCodeBase64,
        expiresAt: charge.expiresAt,
      }
      try {
        await attachPayment(row.id, {
          paymentId: charge.id,
          pixBrCode: charge.brCode,
          pixQrBase64: charge.brCodeBase64,
        })
      } catch (err) {
        logServerError('attachPayment', err, { letterId: row.id })
      }
    } else {
      logServerError('createPixCharge', new Error(charge.reason || 'unknown'), {
        details: charge.details,
        status: charge.status,
        letterId: row.id,
      })
    }
  }

  return NextResponse.json({
    slug: row.slug,
    editToken: row.edit_token,
    pix: pixData,
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
