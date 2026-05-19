// Cálculo de frete por prefixo de CEP.
// Origem: Porto Alegre/RS. Pacote leve (foto impressa, ~50g).
// Sem rede — tabela fixa. Valores em centavos.

const RANGES = [
  { start: 90000000, end: 99999999, region: 'RS', label: 'Rio Grande do Sul', cost: 1000, days: '2–3 dias úteis' },
  { start: 80000000, end: 89999999, region: 'SC/PR', label: 'Sul (SC/PR)',     cost: 1300, days: '3–5 dias úteis' },
  { start:  1000000, end: 39999999, region: 'SP/RJ/MG/ES', label: 'Sudeste',   cost: 1500, days: '4–6 dias úteis' },
  { start: 66000000, end: 69999999, region: 'N',  label: 'Norte',              cost: 2500, days: '8–12 dias úteis' },
  { start: 76800000, end: 76999999, region: 'N',  label: 'Norte',              cost: 2500, days: '8–12 dias úteis' },
  { start: 40000000, end: 65999999, region: 'NE', label: 'Nordeste',           cost: 2000, days: '6–10 dias úteis' },
  { start: 70000000, end: 76799999, region: 'CO', label: 'Centro-Oeste',       cost: 2000, days: '6–10 dias úteis' },
  { start: 77000000, end: 79999999, region: 'CO', label: 'Centro-Oeste',       cost: 2000, days: '6–10 dias úteis' },
]

export function normalizeCep(raw) {
  return String(raw || '').replace(/\D/g, '').slice(0, 8)
}

export function formatBRL(cents) {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
}

export function lookupShipping(cep) {
  const digits = normalizeCep(cep)
  if (digits.length !== 8) {
    return { ok: false, error: 'CEP inválido.' }
  }
  const n = Number(digits)
  const hit = RANGES.find((r) => n >= r.start && n <= r.end)
  if (!hit) {
    return { ok: false, error: 'Ainda não entregamos nesse CEP.' }
  }
  return {
    ok: true,
    cost: hit.cost,
    costFormatted: formatBRL(hit.cost),
    region: hit.region,
    label: hit.label,
    days: hit.days,
  }
}
