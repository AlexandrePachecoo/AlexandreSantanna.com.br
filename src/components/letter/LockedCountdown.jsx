'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { useCountdown } from '@/hooks/useCountdown'
import { formatDate } from '@/utils/format'

export function LockedCountdown({ unlockDate, title }) {
  const router = useRouter()
  const c = useCountdown(unlockDate)

  useEffect(() => {
    if (c?.done) {
      const t = setTimeout(() => router.refresh(), 600)
      return () => clearTimeout(t)
    }
  }, [c?.done, router])

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-indigo-50 via-white to-rose-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl border border-border/40 bg-card p-10 text-center shadow-2xl"
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Clock className="h-5 w-5" />
        </div>
        <h1 className="mt-6 font-display text-3xl">Quase lá</h1>
        {title && <p className="mt-2 text-muted-foreground">“{title}”</p>}
        <p className="mt-4 text-sm text-muted-foreground">
          Essa carta abre em <strong>{formatDate(unlockDate)}</strong>.
        </p>

        {c && !c.done && (
          <div className="mt-8 grid grid-cols-4 gap-3">
            {[
              { label: 'dias', value: c.days },
              { label: 'horas', value: c.hours },
              { label: 'min', value: c.minutes },
              { label: 'seg', value: c.seconds },
            ].map((u) => (
              <div
                key={u.label}
                className="rounded-2xl border border-border/60 bg-secondary/50 px-2 py-4"
              >
                <p className="font-display text-3xl tabular-nums">
                  {String(u.value).padStart(2, '0')}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {u.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
