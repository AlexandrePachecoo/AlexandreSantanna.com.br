// Server-only (Node runtime). Sessão de admin via cookie httpOnly assinado com HMAC-SHA256.
//
// NÃO importar deste arquivo no middleware (Edge runtime). Para constantes
// compartilháveis com Edge, use src/lib/adminCookie.js.

import crypto from 'node:crypto'
import { ADMIN_COOKIE_NAME } from '@/lib/adminCookie'

export { ADMIN_COOKIE_NAME }
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000 // 12h

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('ADMIN_SESSION_SECRET ausente ou muito curto (mínimo 16 chars).')
  }
  return secret
}

function base64UrlEncode(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  return Buffer.from(padded + pad, 'base64').toString('utf8')
}

function sign(payload) {
  const secret = getSecret()
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function isPasswordCorrect(input) {
  const expected = process.env.ADMIN_PASSWORD || ''
  if (!expected) return false
  const a = Buffer.from(String(input || ''))
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function createSessionToken({ ttlMs = SESSION_TTL_MS } = {}) {
  const payload = { exp: Date.now() + ttlMs }
  const encoded = base64UrlEncode(JSON.stringify(payload))
  const sig = sign(encoded)
  return `${encoded}.${sig}`
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null
  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return null

  let expected
  try {
    expected = sign(encoded)
  } catch {
    return null
  }
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return null
  if (!crypto.timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(base64UrlDecode(encoded))
    if (!payload?.exp || Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}
