// Cliente da API do AbacatePay (server-side apenas — usa API key bearer).
// Docs: https://docs.abacatepay.com/
//
// Fluxo:
//   1. createBilling() → cria cobrança PIX, devolve { id, url } pro front redirecionar.
//   2. usuário paga.
//   3. AbacatePay chama nosso webhook (/api/webhooks/abacatepay).
//   4. Validamos o webhookSecret e marcamos a carta como paga.

const BASE_URL = 'https://api.abacatepay.com'

function getConfig() {
  const apiKey = process.env.ABACATEPAY_API_KEY
  if (!apiKey) return null
  return {
    apiKey,
    webhookSecret: process.env.ABACATEPAY_WEBHOOK_SECRET || '',
    env: process.env.ABACATEPAY_ENV || 'dev',
  }
}

export function isAbacatePayConfigured() {
  return !!process.env.ABACATEPAY_API_KEY
}

export function getWebhookSecret() {
  return process.env.ABACATEPAY_WEBHOOK_SECRET || ''
}

// Cria uma cobrança PIX no AbacatePay.
// amount em centavos. externalId é o slug da carta (usado no webhook para
// localizar o pedido — alternativa ao payment_id retornado).
//
// returnUrl: para onde o checkout do AbacatePay redireciona após pagamento.
// completionUrl: usuário cai aqui ao concluir o pagamento.
export async function createBilling({
  amountCents,
  description,
  externalId,
  customer,
  returnUrl,
  completionUrl,
  timeoutMs = 8000,
} = {}) {
  const config = getConfig()
  if (!config) return { ok: false, reason: 'not_configured' }

  if (!Number.isFinite(amountCents) || amountCents < 100) {
    return { ok: false, reason: 'invalid_amount' }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${BASE_URL}/v1/billing/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        frequency: 'ONE_TIME',
        methods: ['PIX'],
        products: [
          {
            externalId,
            name: description || 'specialDay — Carta',
            description: description || 'specialDay — Carta',
            quantity: 1,
            price: amountCents,
          },
        ],
        returnUrl: returnUrl || undefined,
        completionUrl: completionUrl || undefined,
        customer: customer || undefined,
        externalId,
      }),
      signal: controller.signal,
    })

    const body = await res.json().catch(() => null)

    if (!res.ok || !body) {
      return {
        ok: false,
        reason: 'api_error',
        status: res.status,
        details: body,
      }
    }

    // AbacatePay devolve `{ data: { id, url, ... } }` (formato padrão da API v1).
    const data = body.data || body
    const id = data?.id || data?.billingId || null
    const url = data?.url || data?.checkoutUrl || data?.paymentUrl || null
    const expiresAt = data?.expiresAt || data?.expires_at || null

    if (!id || !url) {
      return { ok: false, reason: 'invalid_response', details: body }
    }

    return { ok: true, id, url, expiresAt }
  } catch (err) {
    return {
      ok: false,
      reason: err?.name === 'AbortError' ? 'timeout' : 'fetch_error',
      message: err?.message,
    }
  } finally {
    clearTimeout(timer)
  }
}

// Consulta status de uma cobrança específica (usado para reconciliar manualmente
// quando webhook não chega).
export async function getBilling(id, { timeoutMs = 5000 } = {}) {
  const config = getConfig()
  if (!config) return { ok: false, reason: 'not_configured' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${BASE_URL}/v1/billing/get?id=${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    const body = await res.json().catch(() => null)
    if (!res.ok || !body) return { ok: false, reason: 'api_error', status: res.status }

    const data = body.data || body
    return { ok: true, status: data?.status, raw: data }
  } catch (err) {
    return {
      ok: false,
      reason: err?.name === 'AbortError' ? 'timeout' : 'fetch_error',
    }
  } finally {
    clearTimeout(timer)
  }
}
