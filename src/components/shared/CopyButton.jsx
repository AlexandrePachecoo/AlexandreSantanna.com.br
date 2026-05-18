'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClipboard } from '@/hooks/useClipboard'
import { cn } from '@/lib/utils'

export function CopyButton({ value, label = 'Copiar', size = 'sm', variant = 'outline', className }) {
  const { copied, copy } = useClipboard()

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={() => copy(value)}
      className={cn('relative', className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="ok"
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 6, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="inline-flex items-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5" /> Copiado
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 6, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="inline-flex items-center gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" /> {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )
}
