'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Lock, MailPlus, Music, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ThemePicker } from '@/components/forms/ThemePicker'
import { CoverUploader } from '@/components/forms/CoverUploader'
import { MomentsUploader } from '@/components/forms/MomentsUploader'
import { TEMPLATES } from '@/constants/templates'
import { LIMITS } from '@/lib/validators'
import { SuccessScreen } from '@/components/shared/SuccessScreen'

const INITIAL = {
  title: '',
  content: '',
  senderName: '',
  recipientName: '',
  theme: 'romantic',
  coverImage: null,
  coverPosition: '50% 50%',
  moments: [],
  musicUrl: '',
  visibility: 'public',
  password: '',
  unlockDate: '',
  customSlug: '',
}

export function CreateLetterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const templateId = params.get('template')

  const [values, setValues] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!templateId) return
    const t = TEMPLATES.find((x) => x.id === templateId)
    if (!t) return
    setValues((v) => ({
      ...v,
      title: v.title || t.sample.title,
      content: v.content || t.sample.content,
      theme: t.theme,
    }))
  }, [templateId])

  const contentLength = values.content.length
  const contentPct = Math.min(100, (contentLength / LIMITS.content) * 100)

  const isPrivate = values.visibility === 'private'

  function update(key, val) {
    setValues((v) => ({ ...v, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    setErrors({})
    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json?.errors) setErrors(json.errors)
        setSubmitError(json?.error || 'Não consegui criar a carta. Tente de novo.')
        return
      }
      setResult(json)
    } catch {
      setSubmitError('Erro de rede. Verifique sua conexão.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <SuccessScreen
        slug={result.slug}
        editToken={result.editToken}
        onReset={() => {
          setValues(INITIAL)
          setResult(null)
          router.replace('/create', { scroll: true })
        }}
      />
    )
  }

  return (
    <form onSubmit={submit} className="space-y-12">
      <Field
        label="Título"
        hint="Um chamado curto. Ex: 'Para o amor da minha vida'"
        error={errors.title}
      >
        <Input
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          maxLength={LIMITS.title}
          placeholder="Para você"
          autoFocus
        />
      </Field>

      <Field
        label="Mensagem"
        hint="Escreva sem pressa. O que precisa ser dito?"
        error={errors.content}
      >
        <Textarea
          value={values.content}
          onChange={(e) => update('content', e.target.value)}
          maxLength={LIMITS.content}
          rows={10}
          placeholder="Comece a escrever sua carta..."
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{contentLength} / {LIMITS.content}</span>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${contentPct}%` }}
            />
          </div>
        </div>
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="De" hint="Como você se assina">
          <Input
            value={values.senderName}
            onChange={(e) => update('senderName', e.target.value)}
            maxLength={LIMITS.name}
            placeholder="Seu nome"
          />
        </Field>
        <Field label="Para" hint="Para quem é a carta">
          <Input
            value={values.recipientName}
            onChange={(e) => update('recipientName', e.target.value)}
            maxLength={LIMITS.name}
            placeholder="Nome da pessoa"
          />
        </Field>
      </div>

      <Field
        label="Tema visual"
        hint="Cada tema muda cores, tipografia e decorações."
        error={errors.theme}
      >
        <ThemePicker
          value={values.theme}
          onChange={(t) => update('theme', t)}
        />
      </Field>

      <Field
        label="Capa (opcional)"
        hint="Uma foto que conte o início da história. Depois de enviar, arraste dentro do preview para enquadrar."
        error={errors.coverImage}
      >
        <CoverUploader
          value={values.coverImage}
          onChange={(url) => update('coverImage', url)}
          position={values.coverPosition}
          onPositionChange={(pos) => update('coverPosition', pos)}
        />
      </Field>

      <Field
        label="Momentos (opcional)"
        hint={`Até ${LIMITS.moments} fotos com uma legenda em cada — viram um carrossel na carta.`}
        error={errors.moments}
      >
        <MomentsUploader
          value={values.moments}
          onChange={(next) => update('moments', next)}
        />
      </Field>

      <Field
        label="Música (opcional)"
        hint="Cole um link do YouTube — toca automaticamente quando a carta abrir."
        error={errors.musicUrl}
      >
        <div className="relative">
          <Music className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={values.musicUrl}
            onChange={(e) => update('musicUrl', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="pl-11"
          />
        </div>
      </Field>

      <fieldset className="rounded-3xl border border-border/60 bg-secondary/30 p-6">
        <legend className="-mt-9 inline-flex items-center gap-2 rounded-full bg-background px-4 py-1 text-sm font-medium">
          <Sparkles className="h-3 w-3" /> Avançado
        </legend>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Carta privada</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Exige senha para ser aberta.
              </p>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={(c) =>
                update('visibility', c ? 'private' : 'public')
              }
            />
          </div>

          {isPrivate && (
            <Field label="Senha" hint="Mínimo 4 caracteres." error={errors.password}>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={values.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="••••••••"
                  className="pl-11"
                />
              </div>
            </Field>
          )}

          <Field
            label="Data de desbloqueio (opcional)"
            hint="A carta só abre a partir dessa data."
            error={errors.unlockDate}
          >
            <Input
              type="datetime-local"
              value={values.unlockDate}
              onChange={(e) => update('unlockDate', e.target.value)}
            />
          </Field>

          <Field
            label="Link personalizado (opcional)"
            hint="Letras, números e hífens. Ex: para-meu-amor"
            error={errors.customSlug}
          >
            <div className="flex items-center rounded-xl border border-input bg-background pl-3 text-sm shadow-sm">
              <span className="text-muted-foreground">specialday.com/c/</span>
              <input
                value={values.customSlug}
                onChange={(e) => update('customSlug', e.target.value)}
                placeholder="para-meu-amor"
                className="h-11 flex-1 bg-transparent px-1 outline-none placeholder:text-muted-foreground"
              />
            </div>
          </Field>
        </div>
      </fieldset>

      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {submitError}
        </motion.div>
      )}

      <div className="sticky bottom-4 z-20 -mx-2 sm:relative sm:bottom-auto sm:mx-0">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Criando sua carta...
            </>
          ) : (
            <>
              <MailPlus className="h-4 w-4" />
              Gerar carta e link
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function Field({ label, hint, error, children }) {
  return (
    <div className="space-y-2">
      <div>
        <Label className="block">{label}</Label>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

export { Field as CreateLetterField }
