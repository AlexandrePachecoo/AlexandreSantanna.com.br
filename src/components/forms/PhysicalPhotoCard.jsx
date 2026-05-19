'use client'

import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ImagePlus, Loader2, Package, RefreshCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { PhotoQRPreview } from '@/components/forms/PhotoQRPreview'
import { AddressForm } from '@/components/forms/AddressForm'
import { uploadImage } from '@/lib/uploadImage'
import { absoluteUrl } from '@/lib/utils'
import { slugify } from '@/lib/slug'
import { useShippingQuote } from '@/hooks/useShippingQuote'
import { getTheme } from '@/constants/themes'

export function PhysicalPhotoCard({ values, update, errors = {} }) {
  const enabled = !!values.physicalPhotoEnabled
  const usingCustomPhoto = !!values.physicalPhotoUrl

  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const theme = getTheme(values.theme)
  const accentColor = theme?.vars?.['--letter-accent'] || '#000000'

  const photoUrl = usingCustomPhoto ? values.physicalPhotoUrl : values.coverImage

  const previewUrl = useMemo(() => {
    const custom = slugify(values.customSlug || '')
    return custom ? absoluteUrl(`/c/${custom}`) : absoluteUrl('/c/preview')
  }, [values.customSlug])

  const shippingState = useShippingQuote(values.shippingAddress?.cep)

  async function pickPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const { publicUrl } = await uploadImage(file)
      update('physicalPhotoUrl', publicUrl)
    } catch (err) {
      setUploadError(err.message || 'Não consegui enviar a foto.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <section className="relative rounded-3xl border border-border/60 bg-secondary/30 p-6 pt-9">
      <header className="absolute -top-3.5 left-6 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium shadow-sm">
        <Package className="h-3 w-3 text-primary" />
        <span>Foto física com QR</span>
      </header>

      <div className="flex items-start justify-between gap-4">
        <div>
          <Label className="text-base">Quero receber a foto impressa</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            A gente imprime sua foto e adiciona um QR code que leva direto pra carta.
            Chega na casa de quem você quiser surpreender.
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(c) => update('physicalPhotoEnabled', c)}
          aria-label="Ativar foto física"
        />
      </div>

      {enabled && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 space-y-6"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-sm">Foto que vai ser impressa</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={pickPhoto}
                  className="sr-only"
                />
                {usingCustomPhoto ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      update('physicalPhotoUrl', null)
                      setUploadError(null)
                    }}
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    <span>Voltar para a capa</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ImagePlus className="h-3.5 w-3.5" />
                    )}
                    <span>Usar outra foto</span>
                  </Button>
                )}
              </div>
            </div>

            <PhotoQRPreview
              photoUrl={photoUrl}
              coverPosition={usingCustomPhoto ? '50% 50%' : values.coverPosition}
              accentColor={accentColor}
              letterUrl={previewUrl}
            />

            {usingCustomPhoto && (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                <span className="truncate">Foto dedicada à impressão (não substitui a capa da carta).</span>
                <button
                  type="button"
                  onClick={() => update('physicalPhotoUrl', null)}
                  className="inline-flex items-center gap-1 text-destructive hover:underline"
                >
                  <X className="h-3 w-3" /> remover
                </button>
              </div>
            )}

            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
            {errors.physicalPhotoUrl && (
              <p className="text-sm text-destructive">{errors.physicalPhotoUrl}</p>
            )}

            <p className="text-xs text-muted-foreground">
              O QR final aponta para o link da sua carta — gerado depois do cadastro.
              A cor acompanha o tema escolhido.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm">Endereço de entrega</Label>
            <AddressForm
              value={values.shippingAddress}
              onChange={(next) => update('shippingAddress', next)}
              errors={errors}
            />
          </div>

          {shippingState.loading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando frete…
            </div>
          ) : shippingState.quote ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-foreground">
                  Frete: {shippingState.quote.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  Entrega em {shippingState.quote.days}
                  {shippingState.quote.source === 'fallback' && ' · estimativa'}
                </p>
              </div>
              <span className="font-display text-lg font-semibold text-primary">
                {shippingState.quote.costFormatted}
              </span>
            </div>
          ) : shippingState.error ? (
            <p className="text-xs text-destructive">{shippingState.error}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Digite o CEP para calcular o frete (sai de Porto Alegre).
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Você não é cobrado agora. O pedido fica como <strong>pendente</strong>;
            a gente entra em contato pelo link de edição pra confirmar e cobrar.
          </p>
        </motion.div>
      )}
    </section>
  )
}
