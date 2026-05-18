'use client'

import { motion } from 'framer-motion'
import { Lock, MailOpen, MusicIcon, Sparkles } from 'lucide-react'

const features = [
  { icon: Lock, label: 'Senha opcional' },
  { icon: MailOpen, label: 'Animação de abertura' },
  { icon: MusicIcon, label: 'Música de fundo' },
  { icon: Sparkles, label: 'Temas únicos' },
]

export function Demo() {
  return (
    <section className="border-t border-border/50 py-24">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Mais que texto.
            <br />
            <span className="text-primary">Uma experiência.</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Cada carta é uma micro-experiência. Animação de abertura, tipografia escolhida
            com carinho, capa, música, e detalhes que tornam o momento único.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-4"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{f.label}</span>
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
    <div className="relative mx-auto w-full max-w-md">
      <motion.div
        whileHover={{ rotate: -1, y: -4 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-rose-50 p-10 shadow-2xl ring-1 ring-border/60"
      >
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          para Júlia, com amor
        </p>
        <h3 className="mt-3 font-display text-3xl text-foreground">
          “Você é o melhor capítulo da minha vida.”
        </h3>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Não importa onde a gente esteja, no fim do dia eu sempre quero voltar pra
          conversa que a gente começou e nunca termina. Esse é o nosso lugar, e ele é
          meu lugar favorito do mundo.
        </p>

        <div className="mt-8 flex items-center justify-between rounded-2xl bg-card/80 p-3 ring-1 ring-border/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-primary/30" />
            <div className="text-left">
              <p className="text-sm font-medium">A trilha de nós dois</p>
              <p className="text-xs text-muted-foreground">spotify ♥</p>
            </div>
          </div>
          <MusicIcon className="h-4 w-4 text-primary" />
        </div>
      </motion.div>
    </div>
  )
}
