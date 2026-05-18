'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            special<span className="text-primary">Day</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
          <Link href="/#como-funciona" className="hover:text-foreground transition-colors">
            Como funciona
          </Link>
          <Link href="/#templates" className="hover:text-foreground transition-colors">
            Templates
          </Link>
          <Link href="/#faq" className="hover:text-foreground transition-colors">
            FAQ
          </Link>
        </nav>

        <Button asChild size="sm" className="rounded-full">
          <Link href="/create">Criar carta</Link>
        </Button>
      </div>
    </motion.header>
  )
}
