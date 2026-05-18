'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, Loader2, Lock, MailPlus, Music, Save, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ThemePicker } from '@/components/forms/ThemePicker'
import { CoverUploader } from '@/components/forms/CoverUploader'
import { MomentsUploader } from '@/components/forms/MomentsUploader'
import { CreateLetterField as Field } from '@/components/forms/CreateLetterForm'
import { LIMITS } from '@/lib/validators'
import { absoluteUrl } from '@/lib/utils'

function toLocalInput(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EditLetterForm({ token, initial }) {
  const [values, setValues] = useState({
    title: initial.title || '',
    content: initial.content || '',
    senderName: initial.senderName || '',
    recipientName: initial.recipientName || '',
    theme: initial.theme || 'romantic',
    coverImage: initial.coverImage || null,
    coverPosition: initial.coverPosition || '50% 50%',
    moments: Array.isArray(initial.moments) ? initial.moments : [],
    musicUrl: initial.musicUrl || '',
    visibility: initial.visibility || 'public',
    password: '',
    changePassword: false,
    unlockDate: toLocalInput(initial.unlockDate),
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const isPrivate = values.visibility === 'private'

  function update(key, val) {
    setValues((v) => ({ ...v, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
    setSaved(false)
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setSubmitError(null)
    setErrors({})
    try {
      const payload = {
        title: values.title,
        content: values.content,
        senderName: values.senderName,
        recipientName: values.recipientName,
        theme: values.theme,
        coverImage: values.coverImage,
        coverPosition: values.coverPosition,
        moments: values.moments,
        musicUrl: values.musicUrl,
        visibility: values.visibility,
        unlockDate: values.unlockDate || null,
      }
      if (values.changePassword) {
        payload.password = isPrivate ? values.password : null
      }
      const res = await fetch(`/api/letters/edit/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json?.errors) setErrors(json.errors)
        setSubmitError(json?.error || 'Não consegui salvar.')
        return
      }
      setSaved(true)
    } catch {
      setSubmitError('Erro de rede. Verifique sua conexão.')
    } finally {
      setSaving(false)
    }
  }

  const publicUrl = absoluteUrl(`/c/${initial.slug}`)

  return (
    <form onSubmit={submit} className="space-y-12">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <p className="font-medium">Editando carta</p>
          <p className="mt-1 text-muted-foreground">{publicUrl}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/c/${initial.slug}`} target="_blank">
            Ver carta <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <Field label="Título" error={errors.title}>
        <Input
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          maxLength={LIMITS.title}
        />
      </Field>

      <Field label="Mensagem" error={errors.content}>
        <Textarea
          value={values.content}
          onChange={(e) => update('content', e.target.value)}
          maxLength={LIMITS.content}
          rows={10}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="De">
          <Input
            value={values.senderName}
            onChange={(e) => update('senderName', e.target.value)}
            maxLength={LIMITS.name}
          />
        </Field>
        <Field label="Para">
          <Input
            value={values.recipientName}
            onChange={(e) => update('recipientName', e.target.value)}
            maxLength={LIMITS.name}
          />
        </Field>
      </div>

      <Field label="Tema visual">
        <ThemePicker value={values.theme} onChange={(t) => update('theme', t)} />
      </Field>

      <Field label="Capa" hint="Arraste dentro do preview para enquadrar.">
        <CoverUploader
          value={values.coverImage}
          onChange={(url) => update('coverImage', url)}
          position={values.coverPosition}
          onPositionChange={(pos) => update('coverPosition', pos)}
        />
      </Field>

      <Field label="Momentos" error={errors.moments}>
        <MomentsUploader
          value={values.moments}
          onChange={(next) => update('moments', next)}
        />
      </Field>

      <Field label="Música">
        <div className="relative">
          <Music className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={values.musicUrl}
            onChange={(e) => update('musicUrl', e.target.value)}
            placeholder="https://..."
            className="pl-11"
          />
        </div>
      </Field>

      <fieldset className="rounded-3xl border border-border/60 bg-secondary/30 p-6">
        <legend className="-mt-9 inline-flex items-center gap-2 rounded-full bg-background px-4 py-1 text-sm font-medium">
          <Sparkles className="h-3 w-3" /> Privacidade
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
            <>
              {initial.hasPassword && !values.changePassword ? (
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Senha definida</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => update('changePassword', true)}
                  >
                    Trocar senha
                  </Button>
                </div>
              ) : (
                <Field label="Senha" error={errors.password}>
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
            </>
          )}

          <Field label="Data de desbloqueio" error={errors.unlockDate}>
            <Input
              type="datetime-local"
              value={values.unlockDate}
              onChange={(e) => update('unlockDate', e.target.value)}
            />
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
        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
            </>
          ) : saved ? (
            <>
              <Save className="h-4 w-4" /> Salvo
            </>
          ) : (
            <>
              <MailPlus className="h-4 w-4" /> Salvar alterações
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
