'use client'

import { motion } from 'framer-motion'

// Decorações por tema. Cada `kind` renderiza uma camada de fundo
// (atrás do conteúdo) com elementos animados. Posicionamento é
// determinístico (não usa Math.random), pra evitar mismatch SSR/CSR.

const COUNT = 14

function seeded(i, mod = 100) {
  return ((i * 1297 + 31) % mod) / mod
}

export function ThemeDecorations({ kind }) {
  if (!kind || kind === 'none') {
    return <CornerFlourish />
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {kind === 'hearts' && <Hearts />}
      {kind === 'stars' && <Stars />}
      {kind === 'sakura' && <Sakura />}
      {kind === 'confetti' && <Confetti />}
      {kind === 'paper' && <Paper />}
      <CornerFlourish />
    </div>
  )
}

/* ----- corner ornaments (todos os temas) ----- */

function CornerFlourish() {
  return (
    <>
      {[
        { pos: 'left-0 top-0', rotate: 0 },
        { pos: 'right-0 top-0', rotate: 90 },
        { pos: 'right-0 bottom-0', rotate: 180 },
        { pos: 'left-0 bottom-0', rotate: 270 },
      ].map((c) => (
        <svg
          key={c.pos}
          aria-hidden
          viewBox="0 0 120 120"
          className={`pointer-events-none absolute h-24 w-24 sm:h-32 sm:w-32 ${c.pos}`}
          style={{
            color: 'var(--letter-accent-soft, currentColor)',
            opacity: 0.35,
            transform: `rotate(${c.rotate}deg)`,
          }}
        >
          <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <path d="M10 10 Q 38 14, 50 32 T 80 52" />
            <path d="M10 10 Q 22 38, 32 50 T 52 80" />
            <circle cx="50" cy="32" r="2" fill="currentColor" />
            <circle cx="32" cy="50" r="2" fill="currentColor" />
            <circle cx="80" cy="52" r="1.5" fill="currentColor" />
            <circle cx="52" cy="80" r="1.5" fill="currentColor" />
          </g>
        </svg>
      ))}
    </>
  )
}

/* ----- hearts (romantic) ----- */

function Hearts() {
  return (
    <>
      {Array.from({ length: COUNT }).map((_, i) => {
        const x = seeded(i, 100) * 100
        const y = seeded(i + 9, 100) * 100
        const size = 10 + (i % 4) * 6
        const delay = (i * 0.4) % 5
        const duration = 7 + (i % 4)
        return (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              color: 'var(--letter-accent, #e11d74)',
              opacity: 0.18 + (i % 3) * 0.08,
            }}
            animate={{
              y: [0, -16, 0],
              rotate: [0, 8, -6, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              fill="currentColor"
              d="M12 21s-7-4.5-9.5-9C.5 7.5 4 3 8 3c2 0 3.5 1 4 2 .5-1 2-2 4-2 4 0 7.5 4.5 5.5 9-2.5 4.5-9.5 9-9.5 9z"
            />
          </motion.svg>
        )
      })}
    </>
  )
}

/* ----- stars (dark) ----- */

function Stars() {
  // pontos pra constelação
  const constellation = [
    { x: 15, y: 20 },
    { x: 25, y: 30 },
    { x: 38, y: 28 },
    { x: 48, y: 38 },
    { x: 70, y: 22 },
    { x: 82, y: 35 },
    { x: 72, y: 70 },
    { x: 60, y: 78 },
    { x: 45, y: 72 },
    { x: 25, y: 75 },
    { x: 15, y: 60 },
  ]
  const lines = [
    [0, 1],
    [1, 2],
    [2, 3],
    [4, 5],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
  ]

  return (
    <>
      {/* linhas das constelações */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {lines.map(([a, b], i) => (
          <line
            key={i}
            x1={constellation[a].x}
            y1={constellation[a].y}
            x2={constellation[b].x}
            y2={constellation[b].y}
            stroke="var(--letter-accent-soft, #c4b5fd)"
            strokeWidth="0.08"
            strokeDasharray="0.4 0.8"
            opacity="0.5"
          />
        ))}
      </svg>

      {/* estrelas grandes da constelação */}
      {constellation.map((p, i) => (
        <motion.div
          key={`c-${i}`}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 3 + (i % 3),
            delay: (i * 0.3) % 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg
            viewBox="0 0 16 16"
            width={i % 3 === 0 ? 18 : 12}
            height={i % 3 === 0 ? 18 : 12}
            style={{ filter: 'drop-shadow(0 0 6px var(--letter-accent-glow))' }}
          >
            <path
              d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z"
              fill="var(--letter-accent, #fbbf24)"
            />
          </svg>
        </motion.div>
      ))}

      {/* dust de estrelas pequenas */}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = seeded(i + 100, 100) * 100
        const y = seeded(i + 200, 100) * 100
        const size = 1 + (i % 3)
        return (
          <motion.span
            key={`d-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              background: 'var(--letter-accent-soft, white)',
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 2 + (i % 4),
              delay: (i * 0.1) % 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </>
  )
}

/* ----- sakura (anime) ----- */

function Sakura() {
  const PETAL_PATH =
    'M12 2 C 8 6, 6 10, 8 14 C 10 18, 14 18, 16 14 C 18 10, 16 6, 12 2 Z'

  return (
    <>
      {Array.from({ length: 18 }).map((_, i) => {
        const x = seeded(i, 100) * 100
        const startY = -10 - seeded(i + 33, 100) * 30
        const endY = 100 + seeded(i + 77, 100) * 20
        const size = 14 + (i % 5) * 4
        const duration = 14 + (i % 6) * 2
        const delay = (i * 0.5) % 8
        const rotateDir = i % 2 === 0 ? 1 : -1
        return (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute"
            style={{ left: `${x}%`, width: size, height: size }}
            initial={{ top: `${startY}%`, rotate: 0, opacity: 0 }}
            animate={{
              top: `${endY}%`,
              rotate: rotateDir * 720,
              opacity: [0, 0.85, 0.85, 0],
              x: [0, 18, -14, 22, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.1, 0.9, 1],
            }}
          >
            <path
              fill="var(--letter-accent-soft, #fbcfe8)"
              d={PETAL_PATH}
            />
            <circle cx="12" cy="10" r="1.5" fill="var(--letter-accent, #ec4899)" opacity="0.6" />
          </motion.svg>
        )
      })}
    </>
  )
}

/* ----- confetti (birthday) ----- */

function Confetti() {
  const colors = ['#dc2626', '#fbbf24', '#10b981', '#3b82f6', '#a855f7', '#fb7185']
  const shapes = ['rect', 'circle', 'triangle', 'rect']

  return (
    <>
      {Array.from({ length: 24 }).map((_, i) => {
        const x = seeded(i, 100) * 100
        const startY = -15 - seeded(i + 17, 100) * 20
        const endY = 100 + seeded(i + 41, 100) * 15
        const size = 6 + (i % 4) * 3
        const duration = 10 + (i % 5) * 2
        const delay = (i * 0.3) % 6
        const color = colors[i % colors.length]
        const shape = shapes[i % shapes.length]
        const rotateDir = i % 2 === 0 ? 1 : -1

        return (
          <motion.svg
            key={i}
            viewBox="0 0 12 12"
            className="absolute"
            style={{ left: `${x}%`, width: size, height: size }}
            initial={{ top: `${startY}%`, rotate: 0, opacity: 0 }}
            animate={{
              top: `${endY}%`,
              rotate: rotateDir * 540,
              opacity: [0, 0.9, 0.9, 0],
              x: [0, 14, -10, 18, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.1, 0.9, 1],
            }}
          >
            {shape === 'rect' && <rect width="12" height="6" y="3" fill={color} rx="1" />}
            {shape === 'circle' && <circle cx="6" cy="6" r="5" fill={color} />}
            {shape === 'triangle' && (
              <polygon points="6,1 11,11 1,11" fill={color} />
            )}
          </motion.svg>
        )
      })}
    </>
  )
}

/* ----- paper (vintage) ----- */

function Paper() {
  return (
    <>
      {/* grain de papel */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.35,
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(122,92,57,0.22) 0, transparent 55%), radial-gradient(circle at 80% 70%, rgba(122,92,57,0.18) 0, transparent 55%), radial-gradient(circle at 50% 90%, rgba(122,92,57,0.15) 0, transparent 50%)',
        }}
      />
      {/* manchas de tempo */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = seeded(i + 5, 100) * 100
        const y = seeded(i + 11, 100) * 100
        const size = 30 + (i % 4) * 20
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              background:
                'radial-gradient(circle, rgba(122,92,57,0.12) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}
    </>
  )
}
