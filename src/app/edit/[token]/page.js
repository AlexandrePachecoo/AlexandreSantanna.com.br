import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/sections/Navbar'
import { Footer } from '@/components/sections/Footer'
import { EditLetterForm } from '@/components/forms/EditLetterForm'
import { getLetterByEditToken, toEditableLetter } from '@/services/letters'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Editar carta',
  robots: { index: false, follow: false },
}

export default async function EditPage({ params }) {
  const { token } = await params
  if (!token || token.length < 12) notFound()

  const row = await getLetterByEditToken(token).catch(() => null)
  if (!row) notFound()

  const initial = toEditableLetter(row)

  return (
    <>
      <Navbar />
      <main className="container max-w-2xl py-12 sm:py-20">
        <Link
          href={`/c/${initial.slug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Voltar para a carta
        </Link>

        <div className="mt-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Editar carta
          </h1>
          <p className="mt-3 text-muted-foreground">
            Altere o que quiser. As mudanças aparecem no link público na hora.
          </p>
        </div>

        <div className="mt-12">
          <EditLetterForm token={token} initial={initial} />
        </div>
      </main>
      <Footer />
    </>
  )
}
