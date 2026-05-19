'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section className="border-t border-border/50 py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.75rem] bg-[radial-gradient(ellipse_at_top_left,#fb923c_0%,#f43f5e_45%,hsl(var(--primary))_100%)] p-12 text-center text-white sm:p-20">
          {/* blobs decorativos */}
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
            <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-white/50 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
          </div>

          {/* emojis flutuantes */}
          <motion.span
            animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute left-[8%] top-12 select-none text-4xl opacity-80 sm:text-5xl"
          >
            💌
          </motion.span>
          <motion.span
            animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="pointer-events-none absolute right-[10%] top-16 select-none text-3xl opacity-75 sm:text-4xl"
          >
            ✨
          </motion.span>
          <motion.span
            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="pointer-events-none absolute bottom-12 left-[12%] hidden select-none text-3xl opacity-70 sm:block sm:text-4xl"
          >
            🌸
          </motion.span>
          <motion.span
            animate={{ y: [0, 8, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className="pointer-events-none absolute bottom-14 right-[14%] hidden select-none text-3xl opacity-70 sm:block sm:text-4xl"
          >
            🕰️
          </motion.span>

          {/* ornamento topo */}
          <div className="ornament-rule mx-auto font-display text-xs uppercase tracking-[0.32em] text-white/80">
            <Heart className="h-3 w-3 fill-current" />
          </div>

          <h2 className="mt-6 text-balance font-display text-[2.4rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.4rem] lg:text-6xl">
            Tem alguém que precisa{' '}
            <span className="italic text-white/95">ouvir isso?</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/85 sm:text-lg">
            Não deixe pra depois. Comece agora — é grátis, leva dois minutos, e o link
            dura pra sempre.
          </p>

          <Button
            asChild
            size="lg"
            className="group mt-10 rounded-full bg-white text-foreground shadow-xl transition-all hover:scale-[1.02] hover:bg-white hover:shadow-2xl"
          >
            <Link href="/create">
              Escrever minha carta
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>

          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-white/70">
            sem cadastro · sem cartão · sem prazo
          </p>
        </div>
      </div>
    </section>
  )
}
