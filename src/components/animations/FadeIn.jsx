'use client'

import { motion } from 'framer-motion'

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  y = 16,
  className,
  once = true,
  as = 'div',
}) {
  const MotionTag = motion[as] || motion.div
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-50px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  )
}
