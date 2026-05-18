import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { TEMPLATES } from '@/constants/templates'
import { Reveal, RevealItem } from '@/components/animations/Reveal'

export function Templates() {
  return (
    <section id="templates" className="border-t border-border/50 bg-secondary/40 py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Comece de algum lugar.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Templates emocionais prontos. Personalize com suas palavras.
          </p>
        </div>

        <Reveal className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <RevealItem key={t.id}>
              <Link
                href={`/create?template=${t.id}`}
                className="group relative block overflow-hidden rounded-3xl border border-border/60 bg-background p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{t.emoji}</span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <h3 className="mt-6 font-display text-lg">{t.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                <p className="mt-4 line-clamp-2 text-xs italic text-muted-foreground/80">
                  “{t.sample.content.slice(0, 110)}...”
                </p>
              </Link>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
