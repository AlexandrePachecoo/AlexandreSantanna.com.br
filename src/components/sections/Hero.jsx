'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Heart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-40 left-10 h-72 w-72 rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div className="container relative grid items-center gap-16 pb-24 pt-20 sm:pt-28 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-6"
        >
          <Badge variant="default" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Crie sem cadastro
          </Badge>

          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Transforme sentimentos
            <br />
            em algo{' '}
            <span className="bg-gradient-to-r from-primary via-rose-500 to-orange-400 bg-clip-text text-transparent">
              inesquecível.
            </span>
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground">
            Crie uma cartinha digital emocional e compartilhe por link. Para o amor da sua
            vida, para um amigo, para o seu eu do futuro — ou para qualquer pessoa que
            mereça um momento especial.
          </p>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/create">
                Criar minha carta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="#como-funciona">Ver como funciona</Link>
            </Button>
          </div>

          <div className="flex items-center gap-3 pt-2 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {['💖', '🌙', '🌸', '🎉'].map((e, i) => (
                <span
                  key={i}
                  className="grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-card text-sm shadow-sm"
                >
                  {e}
                </span>
              ))}
            </div>
            <span>6 temas únicos. Mais chegando em breve.</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
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
    <div className="relative">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative rounded-3xl bg-gradient-to-br from-rose-50 via-white to-rose-100 p-8 shadow-2xl ring-1 ring-rose-200/60"
      >
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-rose-400">
          <span>specialDay</span>
          <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
        </div>
        <div className="mt-8 space-y-3">
          <p className="font-display text-2xl text-rose-950">Para você</p>
          <p className="text-sm leading-relaxed text-rose-900/70">
            Tem dias em que eu fecho os olhos e percebo: você virou a parte mais bonita da
            minha rotina...
          </p>
        </div>
        <div className="mt-10 flex items-center justify-between text-xs text-rose-400">
          <span>com carinho</span>
          <span>specialday.com/c/...</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ rotate: [0, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-6 -top-6 text-4xl"
      >
        💌
      </motion.div>
      <motion.div
        animate={{ rotate: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-6 -left-4 text-4xl"
      >
        ✨
      </motion.div>
    </div>
  )
}
