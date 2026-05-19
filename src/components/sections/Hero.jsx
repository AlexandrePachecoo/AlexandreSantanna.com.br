'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Heart, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const proofs = ['Sem cadastro', 'Link permanente', 'Pronto em minutos']

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-6rem] top-32 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute -bottom-44 left-4 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-44 w-44 rounded-full bg-amber-100/40 blur-3xl" />
      </div>

      <div className="container relative grid items-center gap-16 pb-28 pt-20 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-7"
        >
          <Badge variant="default" className="gap-1.5 rounded-full px-3 py-1">
            <Sparkles className="h-3 w-3" />
            <span className="font-medium tracking-wide">Sem cadastro · sem fricção</span>
          </Badge>

          <h1 className="text-balance font-display text-[2.6rem] font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Transforme sentimentos em algo{' '}
            <span className="relative inline-block">
              <span className="text-gradient-romantic italic">inesquecível</span>
              <svg
                aria-hidden
                viewBox="0 0 220 14"
                className="absolute -bottom-3 left-0 h-3 w-full text-primary/40"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 9 Q 55 1, 110 7 T 218 5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
            .
          </h1>

          <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Uma cartinha digital com a sua voz. Escreva, escolha um tema, adicione foto e
            música — e compartilhe um link que vai durar mais que qualquer print.
          </p>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="group rounded-full shadow-soft transition-all hover:shadow-glow"
            >
              <Link href="/create">
                Criar minha carta
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full">
              <Link href="#como-funciona">Ver como funciona</Link>
            </Button>
          </div>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-sm text-muted-foreground">
            {proofs.map((p) => (
              <li key={p} className="inline-flex items-center gap-1.5">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md"
        >
          <HeroEnvelope />
        </motion.div>
      </div>
    </section>
  )
}

function HeroEnvelope() {
  return (
    <div className="relative pb-8">
      {/* carta atrás (sombra/papel duplo) */}
      <div
        aria-hidden
        className="absolute inset-x-3 top-3 h-full -rotate-[3deg] rounded-3xl bg-gradient-to-br from-rose-100/80 to-rose-200/60 opacity-70 shadow-xl ring-1 ring-rose-200/50"
      />

      <motion.article
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative rounded-3xl bg-gradient-to-br from-[#fff8f6] via-white to-[#fff0f3] p-8 shadow-2xl ring-1 ring-rose-200/70"
      >
        {/* fita decorativa superior */}
        <div className="absolute inset-x-10 top-0 h-1 rounded-b-full bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

        <header className="flex items-center justify-between">
          <span className="font-display text-[0.65rem] uppercase tracking-[0.3em] text-rose-400">
            specialDay · vol. 01
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-rose-500 text-white shadow-md ring-2 ring-white">
            <Heart className="h-3.5 w-3.5 fill-current" />
          </span>
        </header>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.25em] text-rose-400/70">
            para você
          </p>
          <p className="mt-3 font-display text-3xl italic leading-tight text-rose-950">
            “tem dias em que eu fecho os olhos e percebo…”
          </p>
          <p className="mt-4 text-[0.92rem] leading-relaxed text-rose-900/65">
            que você virou a parte mais bonita da minha rotina. Os pequenos detalhes —
            seu jeito, sua voz, o silêncio que cabe entre a gente. Tudo conta.
          </p>
        </div>

        {/* linha decorativa ornamental */}
        <div className="my-7 flex items-center gap-3 text-rose-300/80">
          <span className="h-px flex-1 bg-current opacity-50" />
          <Star className="h-3 w-3 fill-current" />
          <span className="h-px flex-1 bg-current opacity-50" />
        </div>

        <footer className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.25em] text-rose-400">
          <span className="font-display italic normal-case tracking-normal text-rose-500/80">
            com carinho,
          </span>
          <span className="font-mono text-[0.65rem]">specialday.com/c/···</span>
        </footer>
      </motion.article>

      {/* ornamentos flutuantes */}
      <motion.span
        animate={{ rotate: [0, 12, 0], y: [0, -4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-4 -top-6 select-none text-4xl drop-shadow-sm"
      >
        💌
      </motion.span>
      <motion.span
        animate={{ rotate: [0, -10, 0], y: [0, 4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-2 -left-6 select-none text-3xl drop-shadow-sm"
      >
        ✨
      </motion.span>
      <motion.span
        aria-hidden
        animate={{ rotate: [0, 6, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-8 top-1/2 hidden text-rose-300 sm:block"
      >
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <path
            d="M22 4 L24 18 L38 20 L24 22 L22 36 L20 22 L6 20 L20 18 Z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      </motion.span>
    </div>
  )
}
