import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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
      <main className="container max-w-2xl py-12 sm:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Voltar
        </Link>

        <div className="mt-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Escreva sua carta.
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Sem login. Sem fricção. Crie, personalize e compartilhe em minutos.
          </p>
        </div>

        <div className="mt-12">
          <Suspense fallback={null}>
            <CreateLetterForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
