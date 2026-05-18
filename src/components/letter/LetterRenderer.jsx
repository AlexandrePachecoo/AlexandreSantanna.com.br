'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { getTheme } from '@/constants/themes'
import { ThemeDecorations } from '@/components/letter/ThemeDecorations'
import { EnvelopeOpen } from '@/components/letter/EnvelopeOpen'
import { MusicPlayer } from '@/components/letter/MusicPlayer'
import { ShareButtons } from '@/components/shared/ShareButtons'
import { formatDate } from '@/utils/format'

export function LetterRenderer({ letter, shareUrl }) {
  const theme = getTheme(letter.theme)

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        ...theme.vars,
        background: 'var(--letter-bg)',
        color: 'var(--letter-ink)',
        fontFamily: 'var(--letter-body-font)',
      }}
    >
      <ThemeDecorations kind={theme.decoration} />

      <div className="container relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-16 sm:py-24">
        <EnvelopeOpen
          recipient={letter.recipientName}
          sender={letter.senderName}
          theme={theme}
        >
          <LetterBody letter={letter} theme={theme} shareUrl={shareUrl} />
        </EnvelopeOpen>
      </div>
    </div>
  )
}

function LetterBody({ letter, theme, shareUrl }) {
  return (
    <article
      className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] p-8 shadow-2xl sm:p-12"
      style={{
        background: 'var(--letter-surface)',
        border: '1px solid var(--letter-border)',
      }}
    >
      {letter.coverImage && (
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative -mx-8 -mt-8 mb-8 aspect-[16/9] overflow-hidden sm:-mx-12 sm:-mt-12 sm:mb-10"
        >
          <Image
            src={letter.coverImage}
            alt="Capa"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 700px"
            priority
          />
        </motion.div>
      )}

      <header className="text-center">
        {letter.recipientName && (
          <p
            className="text-xs uppercase tracking-[0.2em]"
            style={{ color: 'var(--letter-ink-soft)' }}
          >
            para {letter.recipientName}
          </p>
        )}
        <h1
          className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl"
          style={{
            fontFamily: 'var(--letter-heading-font)',
            color: 'var(--letter-ink)',
          }}
        >
          {letter.title}
        </h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="prose-letter mt-10 text-lg leading-[1.85] whitespace-pre-wrap"
        style={{ color: 'var(--letter-ink)' }}
      >
        {letter.content}
      </motion.div>

      {letter.senderName && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 text-right text-base italic"
          style={{ color: 'var(--letter-ink-soft)' }}
        >
          com carinho, {letter.senderName}
        </motion.p>
      )}

      <footer
        className="mt-10 flex flex-col gap-4 border-t pt-6 text-xs"
        style={{ borderColor: 'var(--letter-border)', color: 'var(--letter-ink-soft)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>{formatDate(letter.createdAt)}</span>
          <span>{letter.views ?? 0} {letter.views === 1 ? 'visualização' : 'visualizações'}</span>
        </div>

        {letter.musicUrl && <MusicPlayer url={letter.musicUrl} />}

        <ShareButtons url={shareUrl} title={letter.title} />
      </footer>
    </article>
  )
}
