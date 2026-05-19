import { notFound } from 'next/navigation'
import {
  expireOldLetters,
  getLetterBySlug,
  incrementViews,
  toPublicLetter,
} from '@/services/letters'
import { LetterRenderer } from '@/components/letter/LetterRenderer'
import { LockedCountdown } from '@/components/letter/LockedCountdown'
import { LetterClient } from './LetterClient'
import { AwaitingPayment } from './AwaitingPayment'
import { absoluteUrl } from '@/lib/utils'
import { truncate } from '@/utils/format'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }) {
  const { slug } = await params
  const row = await getLetterBySlug(slug).catch(() => null)
  if (!row) return { title: 'Carta não encontrada' }

  // Antes do pagamento confirmar, não vazamos detalhes da carta.
  if (row.payment_status !== 'paid') {
    return { title: 'Carta aguardando pagamento', robots: 'noindex' }
  }

  const desc = row.recipient_name
    ? `Uma carta para ${row.recipient_name}.`
    : 'Uma carta especial para você.'

  return {
    title: row.title,
    description: truncate(desc, 160),
    openGraph: {
      title: row.title,
      description: desc,
      url: absoluteUrl(`/c/${slug}`),
      images: row.cover_image ? [{ url: row.cover_image }] : undefined,
    },
  }
}

export default async function LetterPage({ params }) {
  const { slug } = await params

  // Marca cartas vencidas (fire-and-forget, antes de buscar a atual).
  expireOldLetters().catch(() => {})

  const row = await getLetterBySlug(slug).catch((err) => {
    console.error('[c/slug] erro ao buscar carta', err)
    return null
  })

  if (!row) notFound()

  if (row.payment_status === 'expired' || row.payment_status === 'refunded') {
    notFound()
  }

  if (row.payment_status === 'awaiting_payment') {
    return (
      <AwaitingPayment
        title={row.title}
        paymentUrl={row.payment_url}
        expiresAt={row.payment_expires_at}
      />
    )
  }

  // Conta visualização (não bloqueia render se falhar).
  incrementViews(slug).catch(() => {})

  const isLocked =
    row.unlock_date && new Date(row.unlock_date).getTime() > Date.now()
  if (isLocked) {
    return <LockedCountdown unlockDate={row.unlock_date} title={row.title} />
  }

  const requiresPassword = row.visibility === 'private' && !!row.password_hash
  if (requiresPassword) {
    // Renderiza shell client que primeiro mostra PasswordGate e, ao desbloquear, swap pra LetterRenderer.
    const publicShell = toPublicLetter(row, { includeContent: false })
    return <LetterClient slug={slug} initial={publicShell} requiresPassword />
  }

  const letter = toPublicLetter(row)
  const shareUrl = absoluteUrl(`/c/${slug}`)
  return <LetterRenderer letter={letter} shareUrl={shareUrl} />
}
