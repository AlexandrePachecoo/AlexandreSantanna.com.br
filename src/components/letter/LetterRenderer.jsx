'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { getTheme } from '@/constants/themes'
import { ThemeDecorations } from '@/components/letter/ThemeDecorations'
import { EnvelopeOpen } from '@/components/letter/EnvelopeOpen'
import { MomentsCarousel } from '@/components/letter/MomentsCarousel'
import { MusicPlayer } from '@/components/letter/MusicPlayer'
import { TimerDisplay } from '@/components/letter/TimerDisplay'
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
  const ornament = theme.ornament || '✦'

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2.2rem] p-8 sm:p-14"
      style={{
        background: 'var(--letter-surface)',
        boxShadow: 'var(--letter-shadow)',
        border: '1px solid var(--letter-border)',
      }}
    >
      {/* borda decorativa interna */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 rounded-[2rem]"
        style={{
          border: '1px dashed var(--letter-border)',
          opacity: 0.55,
        }}
      />

      {/* capa */}
      {letter.coverImage && (
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative -mx-8 -mt-8 mb-10 aspect-[16/9] overflow-hidden sm:-mx-14 sm:-mt-14 sm:mb-12"
        >
          <Image
            src={letter.coverImage}
            alt="Capa"
            fill
            className="object-cover"
            style={{ objectPosition: letter.coverPosition || '50% 50%' }}
            sizes="(max-width: 768px) 100vw, 700px"
            priority
          />
          {/* fade do topo da imagem pro corpo */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3"
            style={{
              background:
                'linear-gradient(to bottom, transparent, var(--letter-surface))',
            }}
          />
        </motion.div>
      )}

      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative text-center"
      >
        {letter.recipientName && (
          <p
            className="flex items-center justify-center gap-3 text-[0.65rem] uppercase tracking-[0.32em] opacity-80"
            style={{ color: 'var(--letter-ink-soft)' }}
          >
            <span className="h-px w-8" style={{ background: 'currentColor', opacity: 0.5 }} />
            para {letter.recipientName}
            <span className="h-px w-8" style={{ background: 'currentColor', opacity: 0.5 }} />
          </p>
        )}

        <h1
          className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]"
          style={{
            fontFamily: 'var(--letter-heading-font)',
            color: 'var(--letter-ink)',
          }}
        >
          {letter.title}
        </h1>

        {/* ornamento ornamental sob o título */}
        <div
          className="mt-7 flex items-center justify-center gap-4 opacity-70"
          style={{ color: 'var(--letter-accent)' }}
        >
          <span className="h-px w-12" style={{ background: 'currentColor', opacity: 0.6 }} />
          <span className="text-lg leading-none">{ornament}</span>
          <span className="h-px w-12" style={{ background: 'currentColor', opacity: 0.6 }} />
        </div>
      </motion.header>

      {/* CONTEÚDO com drop cap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="prose-letter mt-10 text-[1.05rem] leading-[1.95] sm:text-lg sm:leading-[2]"
        style={{ color: 'var(--letter-ink)' }}
      >
        <LetterContent content={letter.content} />
      </motion.div>

      {/* TIMER */}
      {letter.timerType && (
        <TimerDisplay
          type={letter.timerType}
          label={letter.timerLabel}
          date={letter.timerDate}
        />
      )}

      {/* MOMENTOS */}
      {letter.moments?.length > 0 && (
        <MomentsCarousel moments={letter.moments} />
      )}

      {/* ASSINATURA */}
      {letter.senderName && (
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-right"
        >
          <p
            className="text-sm italic opacity-70"
            style={{ color: 'var(--letter-ink-soft)' }}
          >
            com carinho,
          </p>
          <p
            className="mt-1 text-3xl italic leading-tight sm:text-4xl"
            style={{
              fontFamily: 'var(--letter-heading-font)',
              color: 'var(--letter-accent)',
              textShadow: '0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            {letter.senderName}
          </p>
          {/* flourish abaixo da assinatura */}
          <svg
            aria-hidden
            viewBox="0 0 120 16"
            className="ml-auto mt-1 h-3 w-32"
            style={{ color: 'var(--letter-accent)', opacity: 0.5 }}
          >
            <path
              d="M2 8 Q 25 2, 50 8 T 95 8 Q 105 8, 118 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </motion.div>
      )}

      {/* MÚSICA */}
      {letter.musicUrl && (
        <div className="mt-12">
          <p
            className="mb-3 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.32em] opacity-70"
            style={{ color: 'var(--letter-ink-soft)' }}
          >
            <span
              className="h-px w-8"
              style={{ background: 'currentColor', opacity: 0.5 }}
            />
            a trilha
            <span
              className="h-px flex-1"
              style={{ background: 'currentColor', opacity: 0.5 }}
            />
          </p>
          <MusicPlayer url={letter.musicUrl} />
        </div>
      )}

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12 space-y-6 pt-8"
        style={{ borderTop: '1px solid var(--letter-border)' }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{ color: 'var(--letter-ink-soft)' }}
        >
          <span
            className="font-display italic"
            style={{ fontFamily: 'var(--letter-heading-font)' }}
          >
            {formatDate(letter.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3 w-3" />
            <span className="tabular-nums">
              {letter.views ?? 0}{' '}
              {letter.views === 1 ? 'visualização' : 'visualizações'}
            </span>
          </span>
        </div>

        <ShareButtons url={shareUrl} title={letter.title} />

        {/* specialDay watermark */}
        <p
          className="text-center text-[0.6rem] uppercase tracking-[0.32em] opacity-50"
          style={{ color: 'var(--letter-ink-soft)' }}
        >
          <span className="opacity-60">{ornament}</span> feito em specialday{' '}
          <span className="opacity-60">{ornament}</span>
        </p>
      </motion.footer>
    </motion.article>
  )
}

/* renderiza o content com drop cap na primeira letra */
function LetterContent({ content }) {
  const text = String(content || '')
  const trimmed = text.trimStart()
  const lead = text.length - trimmed.length

  if (trimmed.length < 20) {
    return <p className="whitespace-pre-wrap">{text}</p>
  }

  const first = trimmed[0]
  const rest = trimmed.slice(1)

  return (
    <p className="whitespace-pre-wrap">
      {lead > 0 && text.slice(0, lead)}
      <span
        className="float-left mr-2.5 mt-1.5 inline-block leading-[0.85] sm:mr-3 sm:mt-2"
        style={{
          fontFamily: 'var(--letter-heading-font)',
          color: 'var(--letter-accent)',
          fontSize: '4.5rem',
          textShadow: '0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        {first}
      </span>
      {rest}
    </p>
  )
}
