'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { FAQ_ITEMS } from '@/constants/site'
import { cn } from '@/lib/utils'

export function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="border-t border-border/50 py-24">
      <div className="container max-w-3xl">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Perguntas frequentes
          </h2>
          <p className="mt-4 text-muted-foreground">Sem fricção. Sem letra miúda.</p>
        </div>

        <div className="mt-12 divide-y divide-border/60 rounded-3xl border border-border/60 bg-card">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <button
                key={item.q}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="block w-full text-left"
              >
                <div className="flex items-center justify-between gap-6 p-6">
                  <p className="font-medium">{item.q}</p>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-sm text-muted-foreground">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
