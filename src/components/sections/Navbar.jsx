'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-rose-200/40 text-primary ring-1 ring-primary/10 transition-all group-hover:rotate-[-6deg] group-hover:from-primary/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            special<span className="italic text-primary">Day</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 text-sm text-muted-foreground sm:flex">
          <Link
            href="/#como-funciona"
            className="relative transition-colors hover:text-foreground"
          >
            Como funciona
          </Link>
          <Link
            href="/#templates"
            className="relative transition-colors hover:text-foreground"
          >
            Templates
          </Link>
          <Link
            href="/#faq"
            className="relative transition-colors hover:text-foreground"
          >
            FAQ
          </Link>
        </nav>

        <Button asChild size="sm" className="group rounded-full">
          <Link href="/create">
            Criar carta
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
    </motion.header>
  )
}
