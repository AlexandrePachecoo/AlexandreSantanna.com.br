// Rate limit em memória — suficiente para MVP em Vercel.
// Trocar por Upstash Redis quando precisar de consistência entre instâncias.

const buckets = new Map()

function getKey(ip, scope) {
  return `${scope}:${ip || 'anon'}`
}

export function rateLimit({ ip, scope, max = 10, windowMs = 60_000 }) {
  const key = getKey(ip, scope)
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now - bucket.start > windowMs) {
    buckets.set(key, { start: now, count: 1 })
    return { ok: true, remaining: max - 1 }
  }

  if (bucket.count >= max) {
    const retryAfterMs = bucket.start + windowMs - now
    return { ok: false, retryAfterMs, remaining: 0 }
  }

  bucket.count += 1
  return { ok: true, remaining: max - bucket.count }
}

// Limpeza preguiçosa: a cada 1000 requests, varre buckets velhos.
let ticks = 0
export function tickGC() {
  ticks++
  if (ticks % 1000 !== 0) return
  const now = Date.now()
  for (const [k, b] of buckets) {
    if (now - b.start > 10 * 60_000) buckets.delete(k)
  }
}

export function getClientIp(request) {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'anon'
}
