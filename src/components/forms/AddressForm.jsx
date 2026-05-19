'use client'

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useViaCep } from '@/hooks/useViaCep'
import { normalizeCep } from '@/lib/shipping'

const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export function AddressForm({ value, onChange, errors = {} }) {
  const cepInputRef = useRef(null)
  const numberInputRef = useRef(null)
  const { loading, error: cepLookupError, address } = useViaCep(value.cep)

  function set(field, v) {
    onChange({ ...value, [field]: v })
  }

  useEffect(() => {
    if (!address) return
    const next = { ...value }
    let changed = false
    if (!next.street && address.street) {
      next.street = address.street
      changed = true
    }
    if (!next.neighborhood && address.neighborhood) {
      next.neighborhood = address.neighborhood
      changed = true
    }
    if (!next.city && address.city) {
      next.city = address.city
      changed = true
    }
    if (!next.uf && address.uf) {
      next.uf = address.uf
      changed = true
    }
    if (changed) {
      onChange(next)
      requestAnimationFrame(() => numberInputRef.current?.focus())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const formattedCep = formatCepDisplay(value.cep)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <FieldRow label="CEP" error={errors.shippingCep || (value.cep && cepLookupError)}>
          <div className="relative">
            <Input
              ref={cepInputRef}
              inputMode="numeric"
              value={formattedCep}
              onChange={(e) => set('cep', normalizeCep(e.target.value))}
              placeholder="90040-000"
              maxLength={9}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        </FieldRow>
        <FieldRow label="Para (nome do destinatário)" error={errors.shippingRecipient}>
          <Input
            value={value.recipient}
            onChange={(e) => set('recipient', e.target.value)}
            maxLength={80}
            placeholder="Quem vai receber"
          />
        </FieldRow>
      </div>

      <FieldRow label="Rua" error={errors.shippingStreet}>
        <Input
          value={value.street}
          onChange={(e) => set('street', e.target.value)}
          maxLength={120}
          placeholder="Av. Exemplo"
        />
      </FieldRow>

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <FieldRow label="Número" error={errors.shippingNumber}>
          <Input
            ref={numberInputRef}
            value={value.number}
            onChange={(e) => set('number', e.target.value)}
            maxLength={20}
            placeholder="123"
          />
        </FieldRow>
        <FieldRow label="Complemento" optional error={errors.shippingComplement}>
          <Input
            value={value.complement}
            onChange={(e) => set('complement', e.target.value)}
            maxLength={80}
            placeholder="Apto 42, bloco B"
          />
        </FieldRow>
      </div>

      <FieldRow label="Bairro" error={errors.shippingNeighborhood}>
        <Input
          value={value.neighborhood}
          onChange={(e) => set('neighborhood', e.target.value)}
          maxLength={80}
          placeholder="Centro"
        />
      </FieldRow>

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <FieldRow label="Cidade" error={errors.shippingCity}>
          <Input
            value={value.city}
            onChange={(e) => set('city', e.target.value)}
            maxLength={80}
            placeholder="Porto Alegre"
          />
        </FieldRow>
        <FieldRow label="UF" error={errors.shippingUf}>
          <select
            value={value.uf}
            onChange={(e) => set('uf', e.target.value)}
            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/40"
          >
            <option value="">—</option>
            {UF_LIST.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </FieldRow>
      </div>
    </div>
  )
}

function FieldRow({ label, optional, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}
        {optional && (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">(opcional)</span>
        )}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function formatCepDisplay(raw) {
  const d = normalizeCep(raw)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}
