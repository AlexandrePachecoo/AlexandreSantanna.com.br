'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { TEMPLATES } from '@/constants/templates'
import { THEMES } from '@/constants/themes'
import { SectionHeader } from '@/components/sections/SectionHeader'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const card = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export function Templates() {
  return (
    <section
      id="templates"
      className="relative border-t border-border/50 bg-gradient-to-b from-secondary/50 via-secondary/20 to-background py-28"
    >
      <div className="container">
        <SectionHeader
          eyebrow="Templates"
          title="Comece de"
          highlight="algum lugar."
          subtitle="Pontos de partida emocionais. Personalize com suas palavras, escolha o tema, e mande pra quem precisa receber."
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TEMPLATES.map((t) => {
            const theme = THEMES[t.theme] || THEMES.romantic
            const bg = theme.vars['--letter-bg']
            const accent = theme.vars['--letter-accent']
            const ink = theme.vars['--letter-ink']

            return (
              <motion.div key={t.id} variants={card}>
                <motion.div
                  whileHover={{ y: -6, rotate: -0.4 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`/create?template=${t.id}`}
                    className="group block overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft transition-all hover:border-primary/30 hover:shadow-xl"
                  >
                    {/* preview do tema */}
                    <div
                      className="relative h-36 overflow-hidden"
                      style={{ background: bg }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.4),transparent_60%)]" />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -bottom-2 -right-1 select-none text-7xl opacity-90 drop-shadow-sm"
                      >
                        {t.emoji}
                      </span>
                      <div className="relative flex items-start justify-between p-5">
                        <span
                          className="rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] backdrop-blur-sm"
                          style={{
                            background: 'rgba(255,255,255,0.65)',
                            color: ink,
                          }}
                        >
                          {theme.name}
                        </span>
                        <span
                          className="grid h-8 w-8 place-items-center rounded-full bg-white/80 backdrop-blur transition-transform group-hover:rotate-[8deg]"
                          style={{ color: accent }}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* conteúdo */}
                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-foreground">
                        {t.label}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {t.description}
                      </p>
                      <p className="mt-4 line-clamp-2 border-l-2 border-primary/30 pl-3 text-xs italic leading-relaxed text-muted-foreground/80">
                        “{t.sample.content.slice(0, 120)}…”
                      </p>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
