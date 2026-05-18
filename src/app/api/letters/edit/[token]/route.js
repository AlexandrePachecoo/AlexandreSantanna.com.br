import { NextResponse } from 'next/server'
import {
  getLetterByEditToken,
  toEditableLetter,
  updateLetterByEditToken,
} from '@/services/letters'
import { validateLetterPayload, sanitizeText } from '@/lib/validators'
import { getClientIp, rateLimit, tickGC } from '@/lib/ratelimit'
import { serverErrorResponse } from '@/lib/errors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  const { token } = await params
  if (!token || token.length < 12) {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 400 })
  }
  const row = await getLetterByEditToken(token).catch(() => null)
  if (!row) {
    return NextResponse.json({ error: 'Não encontrada.' }, { status: 404 })
  }
  return NextResponse.json({ letter: toEditableLetter(row) })
}

export async function PUT(req, { params }) {
  tickGC()
  const { token } = await params
  if (!token || token.length < 12) {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 400 })
  }

  const ip = getClientIp(req)
  const rl = rateLimit({ ip, scope: 'edit-letter', max: 20, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Muitas requisições. Espere um pouco.' },
      { status: 429 }
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const { valid, errors, data } = validateLetterPayload(body, { partial: true })
  if (!valid) {
    return NextResponse.json({ error: 'Dados inválidos.', errors }, { status: 422 })
  }

  // Sanitização
  const patch = {
    title: data.title ? sanitizeText(data.title) : data.title,
    content: data.content ? sanitizeText(data.content) : data.content,
    senderName: sanitizeText(data.senderName),
    recipientName: sanitizeText(data.recipientName),
    theme: data.theme,
    coverImage: data.coverImage,
    musicUrl: data.musicUrl,
    visibility: data.visibility,
    unlockDate: data.unlockDate,
  }
  if (body?.coverPosition !== undefined) {
    patch.coverPosition = data.coverPosition
  }
  if (body?.moments !== undefined) {
    patch.moments = (data.moments || []).map((m) => ({
      url: m.url,
      caption: sanitizeText(m.caption),
    }))
  }
  if (body?.password !== undefined) {
    patch.password = data.password || null
  }

  try {
    const row = await updateLetterByEditToken(token, patch)
    return NextResponse.json({ letter: toEditableLetter(row) })
  } catch (err) {
    if (err?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Não encontrada.' }, { status: 404 })
    }
    return serverErrorResponse(
      'PUT /api/letters/edit',
      err,
      'Não consegui salvar. Tente novamente.'
    )
  }
}
