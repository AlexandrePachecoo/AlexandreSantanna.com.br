'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { THEME_LIST } from '@/constants/themes'
import { cn } from '@/lib/utils'

export function ThemePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {THEME_LIST.map((t) => {
        const selected = value === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange?.(t.id)}
            className={cn(
              'group relative overflow-hidden rounded-2xl border p-4 text-left transition-all',
              selected
                ? 'border-primary shadow-md ring-2 ring-primary/30'
                : 'border-border hover:border-foreground/30'
            )}
          >
            <div
              className="absolute inset-0 -z-10 opacity-70"
              style={{ background: t.vars['--letter-bg'] }}
            />
            <div className="flex items-center justify-between">
              <span className="text-2xl">{t.emoji}</span>
              {selected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground"
                >
                  <Check className="h-3 w-3" />
                </motion.span>
              )}
            </div>
            <p
              className="mt-4 text-sm font-semibold"
              style={{ color: t.vars['--letter-ink'] }}
            >
              {t.name}
            </p>
            <p
              className="mt-1 text-xs"
              style={{ color: t.vars['--letter-ink-soft'] }}
            >
              {t.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
