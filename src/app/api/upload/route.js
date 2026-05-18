import { NextResponse } from 'next/server'
import { createCoverUploadUrl } from '@/services/storage'
import { getClientIp, rateLimit, tickGC } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req) {
  tickGC()
  const ip = getClientIp(req)
  const rl = rateLimit({ ip, scope: 'upload', max: 20, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json({ error: 'Muitos uploads.' }, { status: 429 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  try {
    const result = await createCoverUploadUrl({
      mimeType: body?.mimeType,
      size: body?.size,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[POST /api/upload] erro', err)
    return NextResponse.json(
      { error: err.message || 'Falha ao gerar upload URL.' },
      { status: 400 }
    )
  }
}
