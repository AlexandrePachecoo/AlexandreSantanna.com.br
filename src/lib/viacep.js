import { normalizeCep } from './shipping'

const TIMEOUT_MS = 5000

export async function fetchViaCep(rawCep, { signal } = {}) {
  const cep = normalizeCep(rawCep)
  if (cep.length !== 8) {
    return { ok: false, error: 'CEP inválido.' }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const onOuterAbort = () => controller.abort()
  signal?.addEventListener('abort', onOuterAbort)

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: controller.signal,
    })
    if (!res.ok) return { ok: false, error: 'Falha ao consultar CEP.' }
    const json = await res.json()
    if (json?.erro) return { ok: false, error: 'CEP não encontrado.' }
    return {
      ok: true,
      address: {
        cep,
        street: json.logradouro || '',
        neighborhood: json.bairro || '',
        city: json.localidade || '',
        uf: json.uf || '',
      },
    }
  } catch (err) {
    if (err?.name === 'AbortError') return { ok: false, error: 'Tempo esgotado.' }
    return { ok: false, error: 'Erro de rede.' }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onOuterAbort)
  }
}
