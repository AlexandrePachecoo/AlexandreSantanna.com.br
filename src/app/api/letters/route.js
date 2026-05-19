import { NextResponse } from 'next/server'
import { createLetter } from '@/services/letters'
import { validateLetterPayload, sanitizeText } from '@/lib/validators'
import { getClientIp, rateLimit, tickGC } from '@/lib/ratelimit'
import { serverErrorResponse } from '@/lib/errors'

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

  try {
    const row = await createLetter(data)
    return NextResponse.json({
      slug: row.slug,
      editToken: row.edit_token,
      physicalOrder: row.physical_photo_enabled
        ? {
            status: row.shipping_status,
            costCents: row.shipping_cost_cents,
            region: row.shipping_region,
            address: row.shipping_address,
          }
        : null,
    })
  } catch (err) {
    return serverErrorResponse(
      'POST /api/letters',
      err,
      'Não consegui criar a carta. Tente novamente.'
    )
  }
}
