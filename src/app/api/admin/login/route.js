import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  SESSION_TTL_MS,
  createSessionToken,
  isPasswordCorrect,
} from '@/lib/adminAuth'
import { getClientIp, rateLimit, tickGC } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req) {
  tickGC()

  const ip = getClientIp(req)
  const rl = rateLimit({ ip, scope: 'admin-login', max: 5, windowMs: 60_000 })
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

  if (!isPasswordCorrect(body?.password)) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 })
  }

  let token
  try {
    token = createSessionToken()
  } catch {
    return NextResponse.json(
      { error: 'Servidor sem ADMIN_SESSION_SECRET configurado.' },
      { status: 500 }
    )
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  })
  return res
}
