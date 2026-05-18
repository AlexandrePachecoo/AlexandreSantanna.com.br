'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export function EnvelopeOpen({ recipient, sender, theme, onOpen, children }) {
  const [opened, setOpened] = useState(false)

  function open() {
    setOpened(true)
    onOpen?.()
  }

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex max-w-md flex-col items-center gap-8 px-4"
          >
            <motion.button
              onClick={open}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="group relative aspect-[4/3] w-full"
              aria-label="Abrir carta"
            >
              <div
                className="absolute inset-0 rounded-3xl shadow-2xl"
                style={{
                  background:
                    'linear-gradient(160deg, var(--letter-accent-soft, #f9a8d4) 0%, var(--letter-accent, #e11d74) 100%)',
                }}
              />
              <div
                className="absolute inset-x-0 bottom-0 h-2/3 rounded-b-3xl"
                style={{
                  background:
                    'linear-gradient(180deg, var(--letter-surface, white) 0%, var(--letter-surface-soft, #fff7fa) 100%)',
                }}
              />
              <div
                className="absolute inset-x-0 top-0 h-2/3"
                style={{
                  clipPath: 'polygon(0 0, 50% 70%, 100% 0)',
                  background: 'var(--letter-accent, #e11d74)',
                }}
              />
              <div className="absolute inset-0 grid place-items-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="grid h-16 w-16 place-items-center rounded-full bg-white/95 shadow-xl"
                >
                  <Heart className="h-7 w-7 fill-rose-500 text-rose-500" />
                </motion.div>
              </div>
              <div className="absolute inset-x-0 -bottom-12 text-center">
                <p className="text-sm uppercase tracking-widest opacity-70">
                  toque para abrir
                </p>
              </div>
            </motion.button>

            <div className="text-center">
              {recipient && (
                <p
                  className="font-display text-2xl"
                  style={{ color: 'var(--letter-ink, currentColor)' }}
                >
                  Para {recipient}
                </p>
              )}
              {sender && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: 'var(--letter-ink-soft, currentColor)' }}
                >
                  de {sender}
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
