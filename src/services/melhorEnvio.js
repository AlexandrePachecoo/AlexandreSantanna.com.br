// Cliente da API do Melhor Envio (server-side apenas — usa token bearer).
// Modelo: token de acesso pessoal gerado no painel deles
// (https://melhorenvio.com.br → Configurações → Tokens).
// Se MELHOR_ENVIO_TOKEN não estiver setada, isMelhorEnvioConfigured() retorna false
// e o caller usa o fallback da tabela fixa em lib/shipping.js.

const PROD_BASE = 'https://www.melhorenvio.com.br/api/v2'
const SANDBOX_BASE = 'https://sandbox.melhorenvio.com.br/api/v2'

// Foto impressa pequena tipo 13x18 cm, ~50g, valor declarado simbólico.
const DEFAULT_PRODUCT = {
  id: 'foto-fisica',
  width: 13,
  height: 18,
  length: 1,
  weight: 0.05,
  insurance_value: 20,
  quantity: 1,
}

function getConfig() {
  const token = process.env.MELHOR_ENVIO_TOKEN
  if (!token) return null
  return {
    token,
    base: process.env.MELHOR_ENVIO_ENV === 'production' ? PROD_BASE : SANDBOX_BASE,
    fromCep: (process.env.MELHOR_ENVIO_FROM_CEP || '90040000').replace(/\D/g, ''),
    userAgent: process.env.MELHOR_ENVIO_USER_AGENT || 'specialDay (contato@specialday.app)',
  }
}

export function isMelhorEnvioConfigured() {
  return !!process.env.MELHOR_ENVIO_TOKEN
}

export async function quoteShipping({ toCep, product = DEFAULT_PRODUCT, timeoutMs = 5000 } = {}) {
  const config = getConfig()
  if (!config) return { ok: false, reason: 'not_configured' }

  const cep = String(toCep || '').replace(/\D/g, '')
  if (cep.length !== 8) return { ok: false, reason: 'invalid_cep' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${config.base}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': config.userAgent,
      },
      body: JSON.stringify({
        from: { postal_code: config.fromCep },
        to: { postal_code: cep },
        products: [product],
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      return { ok: false, reason: 'api_error', status: res.status }
    }

    const data = await res.json()
    if (!Array.isArray(data)) return { ok: false, reason: 'invalid_response' }

    const options = data
      .filter((o) => o && !o.error && o.price)
      .map((o) => ({
        id: o.id,
        name: o.name,
        company: o.company?.name || '',
        priceCents: Math.round(Number(o.price) * 100),
        days: o.delivery_time ?? null,
      }))
      .filter((o) => Number.isFinite(o.priceCents) && o.priceCents > 0)

    if (!options.length) return { ok: false, reason: 'no_services' }
    return { ok: true, options }
  } catch (err) {
    return {
      ok: false,
      reason: err?.name === 'AbortError' ? 'timeout' : 'fetch_error',
    }
  } finally {
    clearTimeout(timer)
  }
}

export function pickCheapest(options) {
  if (!options?.length) return null
  return [...options].sort((a, b) => a.priceCents - b.priceCents)[0]
}
