import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, PenLine } from 'lucide-react'
import { Navbar } from '@/components/sections/Navbar'
import { Footer } from '@/components/sections/Footer'
import { CreateLetterForm } from '@/components/forms/CreateLetterForm'

export const metadata = {
  title: 'Criar carta',
  description:
    'Crie uma carta virtual emocional e compartilhe por link. Sem cadastro, em minutos.',
}

export default function CreatePage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-rose-50/60 via-rose-50/20 to-transparent" />

        <div className="container max-w-3xl py-12 sm:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Link>

          <div className="mt-10">
            <span className="ornament-rule font-display text-xs uppercase tracking-[0.32em] text-primary/70">
              <PenLine className="h-3 w-3" />
              Nova carta
            </span>
            <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Escreva uma carta que{' '}
              <span className="text-gradient-romantic italic">fica.</span>
            </h1>
            <p className="mt-4 max-w-lg text-pretty text-base text-muted-foreground sm:text-lg">
              Sem login, sem fricção. Personalize com tema, capa, música e momentos —
              depois mande o link.
            </p>
          </div>

          <div className="mt-14">
            <Suspense fallback={null}>
              <CreateLetterForm />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
