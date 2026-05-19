'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const OPENING_MS = 1600

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function EnvelopeOpen({ recipient, sender, onOpen, children }) {
  const [phase, setPhase] = useState('closed') // closed | opening | opened

  useEffect(() => {
    if (phase !== 'opening') return
    const ms = prefersReducedMotion() ? 250 : OPENING_MS
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
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex max-w-md flex-col items-center gap-12 px-4"
          style={{ perspective: 1400 }}
        >
          {/* selo "para X" no topo */}
          {recipient && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
              style={{ color: 'var(--letter-ink, currentColor)' }}
            >
              <p className="text-xs uppercase tracking-[0.3em] opacity-70">
                <span className="mr-2 opacity-60">✦</span>
                uma carta para você
                <span className="ml-2 opacity-60">✦</span>
              </p>
              <p
                className="mt-3 text-3xl italic"
                style={{ fontFamily: 'var(--letter-heading-font, serif)' }}
              >
                {recipient}
              </p>
              {sender && (
                <p
                  className="mt-1 text-sm opacity-70"
                  style={{ color: 'var(--letter-ink-soft, currentColor)' }}
                >
                  de <em>{sender}</em>
                </p>
              )}
            </motion.div>
          )}

          {/* envelope */}
          <motion.button
            onClick={open}
            disabled={opening}
            whileHover={opening ? undefined : { y: -6, scale: 1.01 }}
            whileTap={opening ? undefined : { scale: 0.98 }}
            animate={
              opening
                ? {}
                : { y: [0, -4, 0], scale: [1, 1.005, 1] }
            }
            transition={
              opening
                ? { duration: 0.3 }
                : {
                    y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
                    scale: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
                  }
            }
            className="group relative aspect-[5/3.4] w-full"
            aria-label="Abrir carta"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* sombra projetada no "chão" */}
            <motion.div
              aria-hidden
              animate={opening ? { scaleX: 1.15, opacity: 0.5 } : { scaleX: 1, opacity: 0.35 }}
              transition={{ duration: 0.8 }}
              className="absolute -bottom-6 left-1/2 h-6 w-3/4 -translate-x-1/2 rounded-[50%] blur-md"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)',
              }}
            />

            {/* corpo do envelope - parte de trás */}
            <div
              className="absolute inset-0 overflow-hidden rounded-[1.5rem] shadow-2xl"
              style={{
                background:
                  'linear-gradient(160deg, var(--letter-accent-soft, #f9a8d4) 0%, var(--letter-accent, #e11d74) 100%)',
                boxShadow:
                  '0 30px 60px -20px rgba(0,0,0,0.4), inset 0 -8px 20px rgba(0,0,0,0.15)',
              }}
            >
              {/* textura sutil de papel */}
              <div
                className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
              />
            </div>

            {/* bolso inferior (frente do envelope) */}
            <div
              className="absolute inset-x-0 bottom-0 h-[60%] overflow-hidden rounded-b-[1.5rem]"
              style={{
                background:
                  'linear-gradient(180deg, var(--letter-surface-soft, #fff7fa) 0%, var(--letter-surface, white) 100%)',
                clipPath:
                  'polygon(0% 0%, 50% 60%, 100% 0%, 100% 100%, 0% 100%)',
                boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.06)',
              }}
            />

            {/* selo postal canto superior direito */}
            <motion.div
              aria-hidden
              initial={false}
              animate={opening ? { opacity: 0, scale: 0.7 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute right-4 top-4 flex h-12 w-9 flex-col items-center justify-center rounded-[2px] text-[7px] uppercase tracking-wider"
              style={{
                background:
                  'repeating-linear-gradient(45deg, var(--letter-surface, white) 0px, var(--letter-surface, white) 3px, var(--letter-surface-soft, #fff7fa) 3px, var(--letter-surface-soft, #fff7fa) 6px)',
                color: 'var(--letter-accent, #e11d74)',
                border: '1px dashed var(--letter-accent, #e11d74)',
                outline: '2px solid var(--letter-surface, white)',
                outlineOffset: '-3px',
                fontFamily: 'var(--letter-heading-font, serif)',
              }}
            >
              <span className="text-[8px] leading-none">SD</span>
              <span className="mt-0.5 text-[5px] leading-none">2025</span>
            </motion.div>

            {/* papel emergindo de dentro */}
            <motion.div
              initial={{ y: '15%', opacity: 0, rotateX: 0 }}
              animate={
                opening
                  ? { y: '-65%', opacity: 1, rotateX: -2 }
                  : { y: '15%', opacity: 0, rotateX: 0 }
              }
              transition={{
                duration: 1,
                delay: opening ? 0.4 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-x-7 top-1/3 h-2/3 rounded-md shadow-2xl"
              style={{
                background: 'var(--letter-surface, white)',
                border: '1px solid var(--letter-border, rgba(0,0,0,0.08))',
                backgroundImage:
                  'repeating-linear-gradient(180deg, transparent 0px, transparent 16px, var(--letter-border, rgba(0,0,0,0.06)) 16px, var(--letter-border, rgba(0,0,0,0.06)) 17px)',
                zIndex: 1,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="grid h-full place-items-center">
                <span
                  className="text-3xl"
                  style={{
                    color: 'var(--letter-accent, currentColor)',
                    fontFamily: 'var(--letter-heading-font, serif)',
                  }}
                >
                  {' '}
                </span>
              </div>
            </motion.div>

            {/* aba superior (vira ao abrir) */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={opening ? { rotateX: -185 } : { rotateX: 0 }}
              transition={{
                duration: 0.85,
                ease: [0.22, 1, 0.36, 1],
                delay: opening ? 0.05 : 0,
              }}
              className="absolute inset-x-0 top-0 h-3/5"
              style={{
                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                background:
                  'linear-gradient(180deg, var(--letter-accent, #e11d74) 0%, var(--letter-accent-soft, #f9a8d4) 100%)',
                transformOrigin: 'top center',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                zIndex: 3,
                boxShadow: 'inset 0 -8px 20px rgba(0,0,0,0.1)',
              }}
            />

            {/* forro interno da aba (visível quando vira) */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={opening ? { rotateX: -185 } : { rotateX: 0 }}
              transition={{
                duration: 0.85,
                ease: [0.22, 1, 0.36, 1],
                delay: opening ? 0.05 : 0,
              }}
              className="absolute inset-x-0 top-0 h-3/5"
              style={{
                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                background: 'var(--letter-surface-soft, #fff7fa)',
                transformOrigin: 'top center',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                transform: 'rotateX(180deg)',
                zIndex: 3,
              }}
            />

            {/* selo de cera no centro (cobre a aba) */}
            <WaxSeal opening={opening} />

            {/* sparkles ao abrir */}
            <Sparkles opening={opening} />
          </motion.button>

          {/* CTA "toque para abrir" */}
          <motion.div
            animate={
              opening
                ? { opacity: 0 }
                : { opacity: [0.7, 1, 0.7] }
            }
            transition={
              opening
                ? { duration: 0.3 }
                : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
            }
            className="text-center"
            style={{ color: 'var(--letter-ink-soft, currentColor)' }}
          >
            <p className="flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em]">
              <span className="h-px w-8 bg-current opacity-40" />
              {opening ? 'abrindo' : 'toque para abrir'}
              <span className="h-px w-8 bg-current opacity-40" />
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function WaxSeal({ opening }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 grid place-items-center"
      style={{ zIndex: 4 }}
    >
      <motion.div
        initial={false}
        animate={
          opening
            ? { scale: [1, 1.2, 0.4], rotate: [0, 8, 45], opacity: [1, 1, 0] }
            : { scale: [1, 1.04, 1], rotate: [0, 1.5, 0] }
        }
        transition={
          opening
            ? { duration: 0.7, delay: 0.15, ease: [0.5, 0, 0.5, 1] }
            : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
        }
        className="relative grid h-20 w-20 place-items-center rounded-full"
        style={{
          background:
            'radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--letter-wax-color, #e11d74) 60%, white 0%), var(--letter-wax-color, #e11d74) 50%, color-mix(in srgb, var(--letter-wax-color, #e11d74) 80%, black 20%) 100%)',
          boxShadow:
            '0 6px 12px rgba(0,0,0,0.3), inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -3px 8px rgba(0,0,0,0.25)',
        }}
      >
        {/* highlight da cera */}
        <span
          aria-hidden
          className="absolute h-3 w-3 rounded-full"
          style={{
            top: '20%',
            left: '25%',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)',
          }}
        />

        {/* monograma */}
        <span
          className="font-display text-2xl italic text-white/95 drop-shadow"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
        >
          SD
        </span>

        {/* borda decorativa serrilhada */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        </svg>
      </motion.div>
    </div>
  )
}

function Sparkles({ opening }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-visible"
      style={{ zIndex: 5 }}
    >
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2
        const distance = 80 + (i % 3) * 25
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        const size = 8 + (i % 3) * 4
        return (
          <motion.svg
            key={i}
            viewBox="0 0 16 16"
            className="absolute left-1/2 top-1/2"
            width={size}
            height={size}
            style={{
              marginLeft: -size / 2,
              marginTop: -size / 2,
              color: 'var(--letter-accent, #e11d74)',
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
            animate={
              opening
                ? {
                    x: [0, x * 0.5, x],
                    y: [0, y * 0.5, y],
                    scale: [0, 1.2, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }
                : { scale: 0, opacity: 0 }
            }
            transition={{
              duration: 1.1,
              delay: 0.25 + i * 0.025,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <path
              d="M8 0 L9.2 6.8 L16 8 L9.2 9.2 L8 16 L6.8 9.2 L0 8 L6.8 6.8 Z"
              fill="currentColor"
            />
          </motion.svg>
        )
      })}
    </div>
  )
}
