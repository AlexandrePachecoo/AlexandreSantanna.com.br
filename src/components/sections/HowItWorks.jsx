import { PenLine, Palette, Share2 } from 'lucide-react'
import { Reveal, RevealItem } from '@/components/animations/Reveal'
import { SectionHeader } from '@/components/sections/SectionHeader'

const steps = [
  {
    n: '01',
    icon: PenLine,
    title: 'Escreva',
    description:
      'Conte o que precisa ser dito. Sem pressa, sem login. Só você e as palavras certas.',
  },
  {
    n: '02',
    icon: Palette,
    title: 'Personalize',
    description:
      'Tema, capa, momentos, música e timer. Camadas que fazem a carta parecer com vocês.',
  },
  {
    n: '03',
    icon: Share2,
    title: 'Compartilhe',
    description:
      'Um link único, pronto pra WhatsApp ou um momento certo. Edita depois com o token secreto.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="relative border-t border-border/50 py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-rose-50/40 to-transparent" />

      <div className="container">
        <SectionHeader
          eyebrow="Como funciona"
          title="Três passos."
          highlight="Uma lembrança eterna."
          subtitle="Da primeira palavra ao link entregue — em menos de três minutos."
        />

        <div className="relative mt-20">
          {/* linha conectora desktop */}
          <div
            aria-hidden
            className="absolute left-[15%] right-[15%] top-12 hidden h-px lg:block"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, hsl(var(--primary) / 0.25) 0 6px, transparent 6px 14px)',
            }}
          />

          <Reveal className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <RevealItem
                key={step.n}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl"
              >
                {/* número fantasma */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[7rem] font-semibold leading-none text-primary/[0.07] transition-all duration-500 group-hover:text-primary/[0.12]"
                >
                  {step.n}
                </span>

                {/* highlight superior on hover */}
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 via-rose-200/40 to-orange-100/40 text-primary ring-1 ring-primary/10 transition-transform duration-500 group-hover:rotate-[-4deg]">
                    <step.icon className="h-5 w-5" />
                  </div>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="font-display text-xs font-medium uppercase tracking-[0.25em] text-primary/70">
                      passo {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
