'use client'

import { motion } from 'framer-motion'
import { Lock, MailOpen, MusicIcon, Sparkles, Pause } from 'lucide-react'
import { SectionHeader } from '@/components/sections/SectionHeader'

const features = [
  {
    icon: Lock,
    label: 'Senha opcional',
    sub: 'Só quem você quiser abre.',
    tone: 'from-rose-100 to-pink-50 text-rose-600 ring-rose-200/60',
  },
  {
    icon: MailOpen,
    label: 'Abertura animada',
    sub: 'Envelope que se abre como filme.',
    tone: 'from-orange-100 to-amber-50 text-orange-600 ring-orange-200/60',
  },
  {
    icon: MusicIcon,
    label: 'Trilha sonora',
    sub: 'YouTube, autoplay na abertura.',
    tone: 'from-indigo-100 to-violet-50 text-indigo-600 ring-indigo-200/60',
  },
  {
    icon: Sparkles,
    label: '6 temas únicos',
    sub: 'Vintage, dark, anime, e mais.',
    tone: 'from-fuchsia-100 to-purple-50 text-fuchsia-600 ring-fuchsia-200/60',
  },
]

export function Demo() {
  return (
    <section className="border-t border-border/50 py-28">
      <div className="container grid items-start gap-16 lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col gap-8">
          <SectionHeader
            eyebrow="Vitrine"
            title="Mais que texto."
            highlight="Uma experiência."
            subtitle="Cada carta é uma micro-experiência. Tipografia escolhida com carinho, capa, música, timer, e detalhes que tornam o momento único."
            align="left"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.label}
                className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ring-1 transition-transform group-hover:rotate-[-4deg] ${f.tone}`}
                >
                  <f.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight text-foreground">
                    {f.label}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {f.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DemoPreview />
      </div>
    </section>
  )
}

function DemoPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* sombra de papel atrás */}
      <div
        aria-hidden
        className="absolute inset-x-4 -bottom-4 top-4 -rotate-1 rounded-[2rem] bg-gradient-to-br from-rose-100 to-orange-50 opacity-60 blur-sm"
      />

      <motion.div
        whileHover={{ rotate: -0.6, y: -6 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#fff1f5_0%,#ffe4ec_60%,#ffd6e8_100%)] p-10 shadow-2xl ring-1 ring-rose-200/70 sm:p-12"
      >
        {/* corações decorativos */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 select-none text-7xl text-primary/10"
        >
          ♡
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute -left-2 bottom-8 select-none text-5xl text-primary/10"
        >
          ♡
        </span>

        <header className="flex items-center justify-between">
          <p className="font-display text-[0.7rem] uppercase tracking-[0.3em] text-rose-500/80">
            para Júlia · com amor
          </p>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/70 text-rose-500 ring-1 ring-rose-200/60 backdrop-blur">
            <MailOpen className="h-3.5 w-3.5" />
          </span>
        </header>

        <h3 className="mt-8 font-display text-[2rem] italic leading-[1.05] tracking-tight text-rose-950 sm:text-4xl">
          Você é o melhor capítulo da minha vida.
        </h3>

        <p className="mt-5 text-[0.95rem] leading-relaxed text-rose-900/70">
          No fim de cada dia eu sempre quero voltar pra conversa que a gente começou e
          nunca termina. Esse é o nosso lugar, e ele é o meu lugar favorito do mundo.
        </p>

        {/* player de música */}
        <div className="mt-10 flex items-center gap-4 rounded-2xl border border-rose-200/60 bg-white/80 p-3 shadow-sm backdrop-blur">
          <button
            type="button"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-rose-500 text-white shadow-md"
            aria-label="Pausar música"
          >
            <Pause className="h-4 w-4 fill-current" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[0.78rem] font-semibold text-rose-950">
                A trilha de nós dois
              </p>
              <span className="font-mono text-[0.65rem] text-rose-500">1:24</span>
            </div>
            <div className="mt-2 flex h-5 items-end gap-[2px]">
              {[3, 6, 9, 5, 11, 7, 13, 9, 14, 8, 12, 6, 10, 5, 9, 7, 11, 6, 4, 8].map(
                (h, i) => (
                  <motion.span
                    key={i}
                    initial={{ scaleY: 0.4 }}
                    animate={{ scaleY: [0.4, 1, 0.6, 0.9, 0.4] }}
                    transition={{
                      duration: 1.4 + (i % 4) * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.05,
                    }}
                    className="block w-[3px] origin-bottom rounded-full bg-gradient-to-t from-primary/80 to-rose-400/80"
                    style={{ height: `${h * 1.1}px` }}
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* footer ornament */}
        <div className="mt-8 flex items-center gap-3 text-rose-300">
          <span className="h-px flex-1 bg-current opacity-50" />
          <span className="font-display text-xs italic">com carinho</span>
          <span className="h-px flex-1 bg-current opacity-50" />
        </div>
      </motion.div>
    </div>
  )
}
