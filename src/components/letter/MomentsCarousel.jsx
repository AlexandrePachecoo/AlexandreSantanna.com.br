'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DRAG_THRESHOLD = 80
const VELOCITY_THRESHOLD = 500
const STACK_DEPTH = 3

export function MomentsCarousel({ moments }) {
  const items = Array.isArray(moments) ? moments : []
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const tilts = useMemo(
    () => items.map((_, i) => (i % 2 === 0 ? -4 : 4) + ((i * 7) % 5) - 2),
    [items]
  )

  if (items.length === 0) return null

  const total = items.length
  const current = ((index % total) + total) % total

  function go(dir) {
    setDirection(dir)
    setIndex((i) => (((i + dir) % total) + total) % total)
  }

  function onDragEnd(_, info) {
    const offX = info.offset.x
    const velX = info.velocity.x
    if (offX < -DRAG_THRESHOLD || velX < -VELOCITY_THRESHOLD) go(1)
    else if (offX > DRAG_THRESHOLD || velX > VELOCITY_THRESHOLD) go(-1)
  }

  return (
    <div className="my-10">
      <h3
        className="mb-6 text-center text-xs uppercase tracking-[0.25em]"
        style={{ color: 'var(--letter-ink-soft)' }}
      >
        momentos
      </h3>

      <div className="relative mx-auto h-[420px] w-full max-w-[18rem] select-none sm:h-[460px] sm:max-w-sm">
        {/* cards de baixo (pilha visual) */}
        {Array.from({ length: Math.min(STACK_DEPTH - 1, total - 1) }).map((_, i) => {
          const offset = i + 1
          const stackIndex = (current + offset) % total
          const tilt = tilts[stackIndex] || 0
          const xShift = (offset % 2 === 0 ? -1 : 1) * offset * 14
          const yShift = offset * 10
          return (
            <div
              key={`stack-${offset}`}
              className="pointer-events-none absolute inset-0"
              style={{
                transform: `translate(${xShift}px, ${yShift}px) scale(${1 - offset * 0.05}) rotate(${tilt}deg)`,
                zIndex: STACK_DEPTH - offset,
                opacity: 0.95 - offset * 0.18,
              }}
            >
              <PolaroidCard item={items[stackIndex]} />
            </div>
          )
        })}

        {/* card do topo (drag) */}
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            initial={{ x: direction > 0 ? 60 : direction < 0 ? -60 : 0, opacity: 0, scale: 0.96, rotate: 0 }}
            animate={{ x: 0, opacity: 1, scale: 1, rotate: tilts[current] || 0 }}
            exit={(d) => ({
              x: d > 0 ? -380 : 380,
              opacity: 0,
              rotate: d > 0 ? -12 : 12,
              transition: { duration: 0.35 },
            })}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            drag="x"
            dragElastic={0.2}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={onDragEnd}
            whileTap={{ cursor: 'grabbing' }}
            className="absolute inset-0 cursor-grab"
            style={{ zIndex: STACK_DEPTH + 1 }}
          >
            <PolaroidCard item={items[current]} priority />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={total < 2}
          className="grid h-9 w-9 place-items-center rounded-full border transition-colors hover:bg-black/5 disabled:opacity-40"
          style={{ borderColor: 'var(--letter-border)', color: 'var(--letter-ink-soft)' }}
          aria-label="Momento anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span
          className="text-xs tabular-nums"
          style={{ color: 'var(--letter-ink-soft)' }}
        >
          {current + 1} / {total}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={total < 2}
          className="grid h-9 w-9 place-items-center rounded-full border transition-colors hover:bg-black/5 disabled:opacity-40"
          style={{ borderColor: 'var(--letter-border)', color: 'var(--letter-ink-soft)' }}
          aria-label="Próximo momento"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function PolaroidCard({ item, priority = false }) {
  return (
    <div
      className="flex h-full w-full flex-col rounded-2xl bg-white p-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)] sm:p-4"
      style={{ border: '1px solid rgba(0,0,0,0.06)' }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={item.url}
          alt={item.caption || 'Momento'}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 80vw, 380px"
          priority={priority}
          draggable={false}
        />
      </div>
      <p
        className="mt-3 px-1 text-center text-sm leading-relaxed text-neutral-700 sm:mt-4 sm:text-base"
        style={{ fontFamily: 'var(--letter-body-font)' }}
      >
        {item.caption || ' '}
      </p>
    </div>
  )
}
