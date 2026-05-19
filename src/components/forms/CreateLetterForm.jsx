'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Clock,
  History,
  Loader2,
  Lock,
  MailPlus,
  Music,
  Package,
  Palette,
  PenLine,
  Settings2,
  Slash,
  Sparkles,
  Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ThemePicker } from '@/components/forms/ThemePicker'
import { CoverUploader } from '@/components/forms/CoverUploader'
import { MomentsUploader } from '@/components/forms/MomentsUploader'
import { PhysicalPhotoCard } from '@/components/forms/PhysicalPhotoCard'
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
  timerType: '',
  timerLabel: '',
  timerDate: '',
  physicalPhotoEnabled: false,
  physicalPhotoUrl: null,
  shippingAddress: {
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    uf: '',
    recipient: '',
  },
}

const TIMER_OPTIONS = [
  { value: '', label: 'Nenhum', desc: null, icon: Slash },
  { value: 'countdown', label: 'Regressivo', desc: 'quanto falta', icon: Clock },
  { value: 'countup', label: 'Cronômetro', desc: 'quanto tempo faz', icon: History },
]

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
        physicalOrder={result.physicalOrder}
        onReset={() => {
          setValues(INITIAL)
          setResult(null)
          router.replace('/create', { scroll: true })
        }}
      />
    )
  }

  return (
    <form onSubmit={submit} className="space-y-14">
      {/* STEP 1 — Sua mensagem */}
      <Step number="01" icon={PenLine} label="Sua mensagem">
        <Field
          label="Título"
          hint="Um chamado curto. Ex: 'Para o amor da minha vida'."
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
            placeholder="Comece a escrever sua carta…"
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">
              {contentLength} / {LIMITS.content}
            </span>
            <div className="h-1 w-20 overflow-hidden rounded-full bg-secondary sm:w-32">
              <div
                className="h-full bg-gradient-to-r from-primary to-rose-400 transition-all"
                style={{ width: `${contentPct}%` }}
              />
            </div>
          </div>
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="De" hint="Como você se assina.">
            <Input
              value={values.senderName}
              onChange={(e) => update('senderName', e.target.value)}
              maxLength={LIMITS.name}
              placeholder="Seu nome"
            />
          </Field>
          <Field label="Para" hint="Quem vai abrir a carta.">
            <Input
              value={values.recipientName}
              onChange={(e) => update('recipientName', e.target.value)}
              maxLength={LIMITS.name}
              placeholder="Nome da pessoa"
            />
          </Field>
        </div>
      </Step>

      {/* STEP 2 — Visual */}
      <Step number="02" icon={Palette} label="Visual">
        <Field
          label="Tema"
          hint="Cada tema muda cores, tipografia e decorações."
          error={errors.theme}
        >
          <ThemePicker
            value={values.theme}
            onChange={(t) => update('theme', t)}
          />
        </Field>

        <Field
          label="Capa"
          optional
          hint="Uma foto que conte o início da história. Arraste no preview para enquadrar."
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
          label="Momentos"
          optional
          hint={`Até ${LIMITS.moments} fotos com uma legenda em cada — viram um carrossel na carta.`}
          error={errors.moments}
        >
          <MomentsUploader
            value={values.moments}
            onChange={(next) => update('moments', next)}
          />
        </Field>
      </Step>

      {/* STEP 3 — Toque especial */}
      <Step number="03" icon={Sparkles} label="Toque especial">
        <Field
          label="Música"
          optional
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

        <Card icon={Timer} title="Timer">
          <Field
            label="Tipo"
            hint="Adicione um contador animado na carta."
          >
            <div className="grid grid-cols-3 gap-2">
              {TIMER_OPTIONS.map((opt) => {
                const active = values.timerType === opt.value
                const Icon = opt.icon
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update('timerType', opt.value)}
                    className={[
                      'group relative flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-sm transition-all',
                      active
                        ? 'border-primary bg-primary/10 text-primary shadow-soft'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium leading-none">{opt.label}</span>
                    {opt.desc && (
                      <span className="text-[0.65rem] leading-none opacity-70">
                        {opt.desc}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </Field>

          {values.timerType && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Field
                label="Título do timer"
                hint='Ex: "Falta para o nosso aniversário" ou "Namorando há".'
                error={errors.timerLabel}
              >
                <Input
                  value={values.timerLabel}
                  onChange={(e) => update('timerLabel', e.target.value)}
                  maxLength={80}
                  placeholder={
                    values.timerType === 'countdown'
                      ? 'Falta para o nosso aniversário'
                      : 'Namorando há'
                  }
                />
              </Field>

              <Field
                label={
                  values.timerType === 'countdown'
                    ? 'Data alvo'
                    : 'Data de início'
                }
                hint={
                  values.timerType === 'countdown'
                    ? 'Data futura para a contagem regressiva.'
                    : 'Data passada a partir de quando contar.'
                }
                error={errors.timerDate}
              >
                <Input
                  type="datetime-local"
                  value={values.timerDate}
                  onChange={(e) => update('timerDate', e.target.value)}
                />
              </Field>
            </motion.div>
          )}
        </Card>
      </Step>

      {/* STEP 4 — Avançado */}
      <Step number="04" icon={Settings2} label="Avançado">
        <Card icon={Lock} title="Privacidade e agenda">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label className="text-base">Carta privada</Label>
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
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
          )}

          <Field
            label="Data de desbloqueio"
            optional
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
            label="Link personalizado"
            optional
            hint="Letras, números e hífens. Ex: para-meu-amor."
            error={errors.customSlug}
          >
            <div className="flex items-center overflow-hidden rounded-xl border border-input bg-background pl-3 text-sm shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring/40">
              <span className="select-none whitespace-nowrap text-muted-foreground">
                specialday.com/c/
              </span>
              <input
                value={values.customSlug}
                onChange={(e) => update('customSlug', e.target.value)}
                placeholder="para-meu-amor"
                className="h-11 min-w-0 flex-1 bg-transparent px-1 outline-none placeholder:text-muted-foreground"
              />
            </div>
          </Field>
        </Card>
      </Step>

      {/* STEP 5 — Foto física */}
      <Step number="05" icon={Package} label="Foto física">
        <PhysicalPhotoCard values={values} update={update} errors={errors} />
      </Step>

      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {submitError}
        </motion.div>
      )}

      {/* Submit — sticky em mobile com fade, relative em desktop */}
      <div className="sticky bottom-0 z-20 -mx-6 bg-gradient-to-t from-background via-background/95 to-transparent px-6 pb-4 pt-8 sm:relative sm:bottom-auto sm:mx-0 sm:bg-none sm:p-0">
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="group w-full rounded-full shadow-soft transition-all hover:shadow-glow disabled:hover:shadow-soft"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Criando sua carta…</span>
            </>
          ) : (
            <>
              <MailPlus className="h-4 w-4 transition-transform group-hover:rotate-[-6deg]" />
              <span>Gerar carta e link</span>
            </>
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground sm:mt-4">
          Sem cadastro · Sem cartão · Edita depois com o token secreto
        </p>
      </div>
    </form>
  )
}

function Step({ number, icon: Icon, label, children }) {
  return (
    <section className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-rose-200/40 text-primary ring-1 ring-primary/15">
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xs font-medium tracking-wider text-primary/70">
            {number}
          </span>
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {label}
          </h2>
        </div>
        <span className="ml-2 h-px flex-1 bg-border/60" />
      </header>
      <div className="space-y-8 pl-0 sm:pl-12">{children}</div>
    </section>
  )
}

function Card({ icon: Icon, title, children }) {
  return (
    <section className="relative rounded-3xl border border-border/60 bg-secondary/30 p-6 pt-9">
      <header className="absolute -top-3.5 left-6 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium shadow-sm">
        <Icon className="h-3 w-3 text-primary" />
        <span>{title}</span>
      </header>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

function Field({ label, hint, error, optional, children }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Label className="block text-foreground">
          {label}
          {optional && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              (opcional)
            </span>
          )}
        </Label>
        {hint && (
          <p className="text-xs leading-snug text-muted-foreground sm:max-w-[60%] sm:text-right">
            {hint}
          </p>
        )}
      </div>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

export { Field as CreateLetterField }
