'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function SectionHeader({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = 'center',
  className,
}) {
  const alignClasses =
    align === 'center'
      ? 'mx-auto text-center items-center'
      : 'text-left items-start'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex max-w-2xl flex-col gap-4', alignClasses, className)}
    >
      {eyebrow && (
        <span
          className={cn(
            'ornament-rule font-display text-xs uppercase tracking-[0.32em] text-primary/70',
            align === 'center' ? 'self-center' : 'self-start'
          )}
        >
          {eyebrow}
        </span>
      )}

      <h2 className="text-balance font-display text-3xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
        {highlight && (
          <>
            {' '}
            <span className="text-gradient-romantic italic">{highlight}</span>
          </>
        )}
      </h2>

      {subtitle && (
        <p className="text-pretty max-w-xl text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
