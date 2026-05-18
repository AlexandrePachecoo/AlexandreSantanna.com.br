'use client'

import { motion } from 'framer-motion'

const COUNT = 14

function FloatingItem({ index, content, className }) {
  const left = (index * 37) % 100
  const top = (index * 53) % 100
  const delay = (index * 0.4) % 5
  const duration = 6 + (index % 5)
  return (
    <motion.span
      className={`pointer-events-none absolute select-none opacity-60 ${className || ''}`}
      style={{ left: `${left}%`, top: `${top}%` }}
      animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {content}
    </motion.span>
  )
}

export function ThemeDecorations({ kind }) {
  if (!kind || kind === 'none') return null

  const items = []
  let content = '💖'
  let className = 'text-2xl'

  if (kind === 'hearts') {
    content = '💖'
  } else if (kind === 'stars') {
    content = '✨'
    className = 'text-xl text-white/80'
  } else if (kind === 'sakura') {
    content = '🌸'
  } else if (kind === 'confetti') {
    content = '🎊'
  } else if (kind === 'paper') {
    return (
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(122,92,57,0.18) 0, transparent 60%), radial-gradient(circle at 80% 70%, rgba(122,92,57,0.14) 0, transparent 60%)',
        }}
      />
    )
  }

  for (let i = 0; i < COUNT; i++) {
    items.push(<FloatingItem key={i} index={i} content={content} className={className} />)
  }

  return <div className="pointer-events-none absolute inset-0 overflow-hidden">{items}</div>
}
