import { NextResponse } from 'next/server'
import { getClientIp, rateLimit, tickGC } from '@/lib/ratelimit'
import {
  isMelhorEnvioConfigured,
  pickCheapest,
  quoteShipping,
} from '@/services/melhorEnvio'
import { formatBRL, lookupShipping, normalizeCep } from '@/lib/shipping'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req) {
  tickGC()

  const ip = getClientIp(req)
  const rl = rateLimit({ ip, scope: 'shipping-quote', max: 30, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Muitas cotações em pouco tempo.' },
      { status: 429 }
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const cep = normalizeCep(body?.cep)
  if (cep.length !== 8) {
    return NextResponse.json({ error: 'CEP inválido.' }, { status: 400 })
  }

  if (isMelhorEnvioConfigured()) {
    const result = await quoteShipping({ toCep: cep })
    if (result.ok) {
      const best = pickCheapest(result.options)
      return NextResponse.json({
        ok: true,
        source: 'melhor-envio',
        cost: best.priceCents,
        costFormatted: formatBRL(best.priceCents),
        label: best.company ? `${best.name} · ${best.company}` : best.name,
        days: best.days ? `${best.days} dias úteis` : 'prazo a confirmar',
        region: best.name,
      })
    }
    // segue pro fallback se a API falhar
  }

  const fb = lookupShipping(cep)
  if (!fb.ok) {
    return NextResponse.json({ error: fb.error }, { status: 400 })
  }
  return NextResponse.json({
    ok: true,
    source: 'fallback',
    cost: fb.cost,
    costFormatted: fb.costFormatted,
    label: fb.label,
    days: fb.days,
    region: fb.region,
  })
}
