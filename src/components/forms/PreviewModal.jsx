'use client'

import { Loader2, MailPlus, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LetterRenderer } from '@/components/letter/LetterRenderer'
import { formatBRL, BASE_PRICE_CENTS, WITH_PHOTO_PRICE_CENTS, computeAmountCents } from '@/constants/pricing'

// Modal de preview mostrado ANTES de salvar a carta.
// Renderiza a carta com os dados atuais do form (sem submeter ainda) e mostra o
// total a pagar. "Pagar e publicar" dispara o submit real do form.
//
// O LetterRenderer espera o shape "publicLetter" — mapeamos o estado do form aqui.

export function PreviewModal({
  open,
  onOpenChange,
  values,
  shippingQuote,
  submitting,
  onConfirm,
}) {
  const letter = mapValuesToLetter(values)
  const photoEnabled = !!values.physicalPhotoEnabled
  const shippingCostCents =
    photoEnabled && shippingQuote?.cost ? shippingQuote.cost : 0
  const total = computeAmountCents({
    physicalPhotoEnabled: photoEnabled,
    shippingCostCents,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl gap-0 overflow-hidden p-0">
        <div className="border-b border-border/60 px-6 py-4">
          <DialogTitle className="text-base">Preview da carta</DialogTitle>
          <DialogDescription className="text-xs">
            É exatamente assim que vai ficar. Confirme para pagar via PIX e publicar.
          </DialogDescription>
        </div>

        <div className="max-h-[60vh] overflow-y-auto bg-muted/30">
          {/* O LetterRenderer cobre min-h-screen — limitamos via wrapper para caber no modal. */}
          <div className="min-h-0 [&>div]:min-h-0">
            <LetterRenderer letter={letter} shareUrl="" />
          </div>
        </div>

        <div className="space-y-4 border-t border-border/60 bg-background px-6 py-5">
          <div className="space-y-1 text-sm">
            <Row label="Carta" value={formatBRL(photoEnabled ? WITH_PHOTO_PRICE_CENTS : BASE_PRICE_CENTS)} />
            {photoEnabled && (
              <Row
                label={
                  shippingQuote
                    ? `Frete · ${shippingQuote.region || shippingQuote.label || '—'}`
                    : 'Frete (preencha o CEP)'
                }
                value={shippingQuote?.costFormatted || '—'}
              />
            )}
            <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="font-mono tabular-nums">{formatBRL(total)}</span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              <Pencil className="h-4 w-4" /> Voltar a editar
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={submitting || (photoEnabled && !shippingQuote)}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Gerando pagamento…
                </>
              ) : (
                <>
                  <MailPlus className="h-4 w-4" /> Pagar {formatBRL(total)} e publicar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-mono tabular-nums text-foreground">{value}</span>
    </div>
  )
}

function mapValuesToLetter(v) {
  return {
    id: 'preview',
    slug: 'preview',
    title: v.title || 'Sua carta',
    content: v.content || 'Escreva sua mensagem…',
    senderName: v.senderName,
    recipientName: v.recipientName,
    theme: v.theme,
    coverImage: v.coverImage,
    coverPosition: v.coverPosition || '50% 50%',
    moments: Array.isArray(v.moments) ? v.moments : [],
    musicUrl: v.musicUrl,
    timerType: v.timerType,
    timerLabel: v.timerLabel,
    timerDate: v.timerDate,
    visibility: v.visibility,
    unlockDate: v.unlockDate,
    views: 0,
    createdAt: new Date().toISOString(),
  }
}
