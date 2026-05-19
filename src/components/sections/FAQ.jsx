'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { FAQ_ITEMS } from '@/constants/site'
import { SectionHeader } from '@/components/sections/SectionHeader'

export function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="border-t border-border/50 py-28">
      <div className="container max-w-3xl">
        <SectionHeader
          eyebrow="Dúvidas"
          title="Perguntas"
          highlight="frequentes."
          subtitle="Sem fricção. Sem letra miúda. Sem pegadinha."
        />

        <div className="mt-16 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={item.q}
                className={i > 0 ? 'border-t border-border/50' : ''}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-7 py-6 text-left transition-colors hover:bg-secondary/40"
                >
                  <p className="font-display text-base font-medium text-foreground sm:text-lg">
                    {item.q}
                  </p>
                  <span
                    className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 transition-all ${
                      isOpen
                        ? 'bg-primary text-primary-foreground ring-primary'
                        : 'bg-background text-muted-foreground ring-border/60'
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isOpen ? (
                        <motion.span
                          key="minus"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 grid place-items-center"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="plus"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 grid place-items-center"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-7 pb-7 pr-14 text-[0.95rem] leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
