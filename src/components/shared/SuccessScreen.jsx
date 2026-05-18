'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Key, Link as LinkIcon, MailPlus, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/shared/CopyButton'
import { ShareButtons } from '@/components/shared/ShareButtons'
import { absoluteUrl } from '@/lib/utils'

export function SuccessScreen({ slug, editToken, onReset }) {
  const shareUrl = absoluteUrl(`/c/${slug}`)
  const editUrl = absoluteUrl(`/edit/${editToken}`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <MailPlus className="h-6 w-6" />
        </div>
        <Badge variant="default" className="mt-6">
          Carta criada ✨
        </Badge>
        <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
          Sua carta está pronta.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Compartilhe o link da carta. Guarde o link de edição.
        </p>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <LinkIcon className="h-4 w-4 text-primary" /> Link público
        </div>
        <p className="mt-2 break-all rounded-xl bg-secondary/60 px-3 py-2 font-mono text-sm">
          {shareUrl}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href={`/c/${slug}`}>
              Abrir carta <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <ShareButtons url={shareUrl} />
        </div>
      </div>

      <div className="rounded-3xl border border-amber-200/60 bg-amber-50 p-6 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
          <Key className="h-4 w-4" /> Link de edição (secreto)
        </div>
        <p className="mt-2 break-all rounded-xl bg-white/70 px-3 py-2 font-mono text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {editUrl}
        </p>
        <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            Salve este link. Ele é a única forma de editar a carta depois — nem nós
            conseguimos recuperar.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <CopyButton value={editUrl} label="Copiar link de edição" />
          <Button asChild variant="ghost" size="sm">
            <Link href={`/edit/${editToken}`}>Abrir edição</Link>
          </Button>
        </div>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Criar outra carta
        </button>
      </div>
    </motion.div>
  )
}
