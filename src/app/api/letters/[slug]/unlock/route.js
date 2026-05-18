import { NextResponse } from 'next/server'
import { getLetterBySlug, toPublicLetter } from '@/services/letters'
import { verifyPassword } from '@/lib/password'
import { getClientIp, rateLimit, tickGC } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req, { params }) {
  tickGC()
  const { slug } = await params
  const ip = getClientIp(req)

  // 10 tentativas por minuto por IP por slug — protege contra brute force.
  const rl = rateLimit({
    ip,
    scope: `unlock:${slug}`,
    max: 10,
    windowMs: 60_000,
  })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Espere um instante.' },
      { status: 429 }
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const password = String(body?.password || '')
  if (!password) {
    return NextResponse.json({ error: 'Senha obrigatória.' }, { status: 400 })
  }

  const row = await getLetterBySlug(slug).catch(() => null)
  if (!row) {
    return NextResponse.json({ error: 'Carta não encontrada.' }, { status: 404 })
  }

  if (row.unlock_date && new Date(row.unlock_date).getTime() > Date.now()) {
    return NextResponse.json(
      { error: 'Essa carta ainda não está disponível.' },
      { status: 423 }
    )
  }

  if (row.visibility !== 'private' || !row.password_hash) {
    // não exige senha → devolve direto
    return NextResponse.json({ letter: toPublicLetter(row) })
  }

  const ok = await verifyPassword(password, row.password_hash)
  if (!ok) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 })
  }

  return NextResponse.json({ letter: toPublicLetter(row) })
}
