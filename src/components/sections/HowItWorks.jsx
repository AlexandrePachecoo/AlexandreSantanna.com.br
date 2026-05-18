import { PenLine, Palette, Share2 } from 'lucide-react'
import { Reveal, RevealItem } from '@/components/animations/Reveal'

const steps = [
  {
    icon: PenLine,
    title: '1. Escreva',
    description:
      'Conte o que quer dizer. Sem pressa. Sem login. Apenas você e o que merece ser dito.',
  },
  {
    icon: Palette,
    title: '2. Personalize',
    description:
      'Escolha um tema, adicione uma foto de capa, uma música. Faça a carta parecer com você.',
  },
  {
    icon: Share2,
    title: '3. Compartilhe',
    description:
      'Ganhe um link único. Envie no WhatsApp, no Instagram, ou guarde para um momento certo.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-border/50 py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Três passos. Uma lembrança eterna.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Da ideia à carta entregue em menos de 3 minutos.
          </p>
        </div>

        <Reveal className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <RevealItem
              key={step.title}
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-display text-xl">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
