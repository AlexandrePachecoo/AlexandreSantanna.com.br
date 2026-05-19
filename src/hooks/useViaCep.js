'use client'

import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { fetchViaCep } from '@/lib/viacep'
import { normalizeCep } from '@/lib/shipping'

export function useViaCep(cep) {
  const debounced = useDebounce(cep, 400)
  const [state, setState] = useState({ loading: false, error: null, address: null })
  const abortRef = useRef(null)

  useEffect(() => {
    const digits = normalizeCep(debounced)
    if (digits.length !== 8) {
      setState({ loading: false, error: null, address: null })
      return
    }

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setState({ loading: true, error: null, address: null })

    fetchViaCep(digits, { signal: ctrl.signal }).then((r) => {
      if (ctrl.signal.aborted) return
      if (r.ok) setState({ loading: false, error: null, address: r.address })
      else setState({ loading: false, error: r.error, address: null })
    })

    return () => ctrl.abort()
  }, [debounced])

  return state
}
