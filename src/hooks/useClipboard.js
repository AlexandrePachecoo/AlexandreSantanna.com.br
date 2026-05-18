'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useClipboard(timeout = 1500) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  const copy = useCallback(
    async (value) => {
      try {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), timeout)
        return true
      } catch {
        return false
      }
    },
    [timeout]
  )

  useEffect(() => () => timer.current && clearTimeout(timer.current), [])

  return { copied, copy }
}
