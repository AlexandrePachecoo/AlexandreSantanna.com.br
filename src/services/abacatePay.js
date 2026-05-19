// Cliente da API do AbacatePay (server-side apenas — usa API key bearer).
// Docs: https://docs.abacatepay.com/
//
// Fluxo PIX:
//   1. createPixCharge() → cria PIX, devolve { id, brCode, brCodeBase64, expiresAt }.
//   2. Front exibe QR Code + copia-cola na nossa página de aguardando pagamento.
//   3. Usuário paga.
//   4. AbacatePay chama nosso webhook (/api/webhooks/abacatepay).
//   5. Validamos o webhookSecret e marcamos a carta como paga.

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

// Cria uma cobrança PIX inline via /v1/transparents/create.
// amountCents é o valor total em centavos. externalId é o slug — usado pelo
// webhook para localizar o pedido. expiresInSeconds default 20min.
//
// Retorna o brCode (PIX copia-e-cola) e a imagem base64 do QR.
export async function createPixCharge({
  amountCents,
  description,
  externalId,
  expiresInSeconds = 20 * 60,
  customer,
  timeoutMs = 8000,
} = {}) {
  const config = getConfig()
  if (!config) return { ok: false, reason: 'not_configured' }

  if (!Number.isFinite(amountCents) || amountCents < 100) {
    return { ok: false, reason: 'invalid_amount' }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const endpoint = '/v1/pixQrCode/create'

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountCents,
        expiresIn: expiresInSeconds,
        description: description || 'specialDay — Carta',
        // externalId é entregue no webhook em payload.data.metadata.externalId.
        metadata: { externalId },
        // customer é opcional para PIX. Só inclui se foi passado completo.
        ...(customer && customer.email && customer.name ? { customer } : {}),
      }),
      signal: controller.signal,
    })

    // Lê como texto primeiro para conseguir logar respostas não-JSON.
    const raw = await res.text()
    let body = null
    try {
      body = raw ? JSON.parse(raw) : null
    } catch {
      body = { raw: raw.slice(0, 500) }
    }

    if (!res.ok || !body) {
      return {
        ok: false,
        reason: 'api_error',
        status: res.status,
        endpoint,
        details: body,
      }
    }

    const data = body.data || body
    const id = data?.id || null
    const brCode = data?.brCode || data?.br_code || null
    const brCodeBase64 = data?.brCodeBase64 || data?.br_code_base64 || null
    const expiresAt = data?.expiresAt || data?.expires_at || null
    const amount = data?.amount

    if (!id || !brCode) {
      return { ok: false, reason: 'invalid_response', details: body }
    }

    return { ok: true, id, brCode, brCodeBase64, expiresAt, amount }
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

// Consulta status de um PIX específico (reconciliação manual).
export async function getPixCharge(id, { timeoutMs = 5000 } = {}) {
  const config = getConfig()
  if (!config) return { ok: false, reason: 'not_configured' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(
      `${BASE_URL}/v1/pixQrCode/check?id=${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    )

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
