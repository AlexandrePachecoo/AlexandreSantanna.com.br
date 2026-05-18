'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Timer } from 'lucide-react'

function calcCountdown(target) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now())
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: ms <= 0,
  }
}

function calcCountup(from) {
  const ms = Math.max(0, Date.now() - new Date(from).getTime())
  const s = Math.floor(ms / 1000)
  const years = Math.floor(s / (365.25 * 86400))
  const rem = s - Math.floor(years * 365.25 * 86400)
  return {
    years,
    days: Math.floor(rem / 86400),
    hours: Math.floor((rem % 86400) / 3600),
    minutes: Math.floor((rem % 3600) / 60),
    seconds: rem % 60,
  }
}

export function TimerDisplay({ type, label, date }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  if (!date || !type) return null

  const isCountdown = type === 'countdown'
  const t = isCountdown ? calcCountdown(date) : calcCountup(date)

  const units =
    isCountdown
      ? [
          { label: 'dias', value: t.days },
          { label: 'horas', value: t.hours },
          { label: 'min', value: t.minutes },
          { label: 'seg', value: t.seconds },
        ]
      : t.years > 0
      ? [
          { label: 'anos', value: t.years },
          { label: 'dias', value: t.days },
          { label: 'horas', value: t.hours },
          { label: 'min', value: t.minutes },
        ]
      : [
          { label: 'dias', value: t.days },
          { label: 'horas', value: t.hours },
          { label: 'min', value: t.minutes },
          { label: 'seg', value: t.seconds },
        ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35 }}
      className="my-10 text-center"
    >
      <div
        className="mb-4 flex items-center justify-center gap-2 text-sm font-medium"
        style={{ color: 'var(--letter-ink-soft)' }}
      >
        {isCountdown ? (
          <Timer className="h-4 w-4 shrink-0" />
        ) : (
          <Clock className="h-4 w-4 shrink-0" />
        )}
        <span>{label || (isCountdown ? 'Contagem regressiva' : 'Cronômetro')}</span>
      </div>

      <div className="flex items-end justify-center gap-2 sm:gap-3">
        {units.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div
              className="flex h-16 w-14 items-center justify-center rounded-2xl text-2xl font-bold tabular-nums sm:h-20 sm:w-18 sm:text-3xl"
              style={{
                background: 'color-mix(in srgb, var(--letter-surface) 80%, transparent)',
                border: '1px solid var(--letter-border)',
                color: 'var(--letter-ink)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {String(value).padStart(2, '0')}
            </div>
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: 'var(--letter-ink-soft)' }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {isCountdown && t.done && (
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 text-sm font-semibold"
          style={{ color: 'var(--letter-ink)' }}
        >
          O momento chegou! ✨
        </motion.p>
      )}
    </motion.div>
  )
}
