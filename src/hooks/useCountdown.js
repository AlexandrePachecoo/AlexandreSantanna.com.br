'use client'

import { useEffect, useState } from 'react'

function diff(target) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now())
  const totalSeconds = Math.floor(ms / 1000)
  return {
    ms,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: ms <= 0,
  }
}

export function useCountdown(target) {
  const [state, setState] = useState(() => (target ? diff(target) : null))

  useEffect(() => {
    if (!target) return
    setState(diff(target))
    const t = setInterval(() => setState(diff(target)), 1000)
    return () => clearInterval(t)
  }, [target])

  return state
}
