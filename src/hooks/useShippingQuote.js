'use client'

import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { normalizeCep } from '@/lib/shipping'

export function useShippingQuote(cep) {
  const debounced = useDebounce(cep, 500)
  const [state, setState] = useState({ loading: false, error: null, quote: null })
  const abortRef = useRef(null)

  useEffect(() => {
    const digits = normalizeCep(debounced)
    if (digits.length !== 8) {
      setState({ loading: false, error: null, quote: null })
      return
    }

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setState((s) => ({ ...s, loading: true, error: null }))

    fetch('/api/shipping/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cep: digits }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (ctrl.signal.aborted) return
        const json = await res.json().catch(() => ({}))
        if (!res.ok || !json.ok) {
          setState({
            loading: false,
            error: json?.error || 'Não consegui calcular o frete.',
            quote: null,
          })
        } else {
          setState({ loading: false, error: null, quote: json })
        }
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setState({ loading: false, error: 'Erro de rede.', quote: null })
      })

    return () => ctrl.abort()
  }, [debounced])

  return state
}
