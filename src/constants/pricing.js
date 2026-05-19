// Preços da carta em centavos. Calculados no servidor — nunca confiar no cliente.
//
// Carta base (digital, sem foto física): R$ 9,90
// Carta com foto física impressa: R$ 19,90 + frete (varia por região)

export const BASE_PRICE_CENTS = 990
export const WITH_PHOTO_PRICE_CENTS = 1990
export const PAYMENT_EXPIRY_MINUTES = 20

export function computeAmountCents({ physicalPhotoEnabled, shippingCostCents }) {
  if (!physicalPhotoEnabled) return BASE_PRICE_CENTS
  const shipping = Number.isFinite(shippingCostCents) ? Math.max(0, shippingCostCents) : 0
  return WITH_PHOTO_PRICE_CENTS + shipping
}

export function formatBRL(cents) {
  const n = Number(cents)
  if (!Number.isFinite(n)) return 'R$ 0,00'
  return `R$ ${(n / 100).toFixed(2).replace('.', ',')}`
}
