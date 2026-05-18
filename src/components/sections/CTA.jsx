import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section className="border-t border-border/50 py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-rose-500 to-orange-400 p-12 text-center text-white sm:p-20">
          <div className="absolute inset-0 -z-10 opacity-20">
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
            <div className="absolute -right-10 bottom-10 h-60 w-60 rounded-full bg-white/30 blur-3xl" />
          </div>

          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Tem alguém para quem você precisa escrever?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            Não deixe pra depois. Comece agora — é grátis, leva 2 minutos e dura para
            sempre.
          </p>

          <Button
            asChild
            size="lg"
            className="mt-10 bg-white text-foreground hover:bg-white/90"
          >
            <Link href="/create">
              Criar minha carta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
