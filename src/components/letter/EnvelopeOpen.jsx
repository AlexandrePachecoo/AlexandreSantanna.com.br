'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart } from 'lucide-react'

const OPENING_MS = 1100

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function EnvelopeOpen({ recipient, sender, onOpen, children }) {
  const [phase, setPhase] = useState('closed') // closed | opening | opened

  useEffect(() => {
    if (phase !== 'opening') return
    const ms = prefersReducedMotion() ? 200 : OPENING_MS
    const t = setTimeout(() => setPhase('opened'), ms)
    return () => clearTimeout(t)
  }, [phase])

  function open() {
    if (phase !== 'closed') return
    setPhase('opening')
    onOpen?.()
  }

  if (phase === 'opened') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    )
  }

  const opening = phase === 'opening'

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key="envelope"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex max-w-md flex-col items-center gap-8 px-4"
          style={{ perspective: 1000 }}
        >
          <motion.button
            onClick={open}
            disabled={opening}
            whileHover={opening ? undefined : { y: -4 }}
            whileTap={opening ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="group relative aspect-[4/3] w-full"
            aria-label="Abrir carta"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* corpo do envelope */}
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

            {/* papel emergindo de dentro do envelope */}
            <motion.div
              initial={{ y: '20%', opacity: 0 }}
              animate={
                opening
                  ? { y: '-58%', opacity: 1 }
                  : { y: '20%', opacity: 0 }
              }
              transition={{
                duration: 0.9,
                delay: opening ? 0.35 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-x-6 top-1/3 h-2/3 rounded-lg bg-white shadow-xl"
              style={{
                zIndex: 1,
                border: '1px solid rgba(0,0,0,0.05)',
                backgroundImage:
                  'repeating-linear-gradient(180deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 14px)',
              }}
            >
              <div className="grid h-full place-items-center">
                <Heart className="h-8 w-8 fill-rose-400 text-rose-400" />
              </div>
            </motion.div>

            {/* aba superior que gira ao abrir */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={opening ? { rotateX: -180 } : { rotateX: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-0 h-2/3"
              style={{
                clipPath: 'polygon(0 0, 50% 70%, 100% 0)',
                background: 'var(--letter-accent, #e11d74)',
                transformOrigin: 'top center',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                zIndex: 2,
              }}
            />

            {/* coração no centro (só visível enquanto fechado) */}
            {!opening && (
              <div className="absolute inset-0 grid place-items-center" style={{ zIndex: 3 }}>
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="grid h-16 w-16 place-items-center rounded-full bg-white/95 shadow-xl"
                >
                  <Heart className="h-7 w-7 fill-rose-500 text-rose-500" />
                </motion.div>
              </div>
            )}

            <div className="absolute inset-x-0 -bottom-12 text-center">
              <p className="text-sm uppercase tracking-widest opacity-70">
                {opening ? 'abrindo...' : 'toque para abrir'}
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
      </AnimatePresence>
    </div>
  )
}
