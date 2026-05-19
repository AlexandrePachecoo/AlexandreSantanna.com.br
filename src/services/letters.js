import { getSupabase } from '@/services/supabase'
import { generateEditToken, generateSlug, slugify } from '@/lib/slug'
import { hashPassword } from '@/lib/password'
import { PAYMENT_EXPIRY_MINUTES } from '@/constants/pricing'

const TABLE = 'letters'

const PUBLIC_COLUMNS =
  'id, slug, title, content, sender_name, recipient_name, theme, cover_image, cover_position, moments, music_url, visibility, unlock_date, views, created_at, updated_at, timer_type, timer_label, timer_date, physical_photo_enabled, physical_photo_url, shipping_cost_cents, shipping_region, shipping_status, payment_status, payment_amount_cents, payment_url, payment_expires_at, payment_paid_at'

// shipping_address contém PII e só aparece em FULL_COLUMNS (usado pelo dono via edit_token).
const FULL_COLUMNS = `${PUBLIC_COLUMNS}, edit_token, password_hash, shipping_address, payment_id, payment_provider`

export async function createLetter(payload) {
  const supabase = getSupabase()

  const slug = await pickSlug(payload.customSlug)
  const editToken = generateEditToken()
  const passwordHash = payload.password ? await hashPassword(payload.password) : null

  const now = new Date()
  const expiresAt = new Date(now.getTime() + PAYMENT_EXPIRY_MINUTES * 60_000)

  const row = {
    slug,
    edit_token: editToken,
    title: payload.title,
    content: payload.content,
    sender_name: payload.senderName ?? null,
    recipient_name: payload.recipientName ?? null,
    theme: payload.theme ?? 'romantic',
    cover_image: payload.coverImage ?? null,
    cover_position: payload.coverPosition ?? '50% 50%',
    moments: payload.moments ?? [],
    music_url: payload.musicUrl ?? null,
    visibility: payload.visibility ?? 'public',
    password_hash: passwordHash,
    unlock_date: payload.unlockDate ?? null,
    timer_type: payload.timerType ?? null,
    timer_label: payload.timerLabel ?? null,
    timer_date: payload.timerDate ?? null,
    physical_photo_enabled: !!payload.physicalPhotoEnabled,
    physical_photo_url: payload.physicalPhotoUrl ?? null,
    shipping_address: payload.shippingAddress ?? null,
    shipping_cost_cents: payload.shippingCostCents ?? null,
    shipping_region: payload.shippingRegion ?? null,
    shipping_status: payload.shippingStatus ?? null,
    payment_status: 'awaiting_payment',
    payment_provider: 'abacatepay',
    payment_amount_cents: payload.paymentAmountCents ?? null,
    payment_expires_at: expiresAt.toISOString(),
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select(FULL_COLUMNS)
    .single()

  if (error) throw error
  return data
}

// Salva o id e a URL do checkout retornados pelo gateway após createLetter.
// Separado da inserção pra evitar perder a carta caso o gateway falhe.
export async function attachPayment(letterId, { paymentId, paymentUrl }) {
  const supabase = getSupabase()
  const { error } = await supabase
    .from(TABLE)
    .update({ payment_id: paymentId, payment_url: paymentUrl })
    .eq('id', letterId)
  if (error) throw error
}

export async function getLetterBySlug(slug) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from(TABLE)
    .select(FULL_COLUMNS)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getLetterByEditToken(token) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from(TABLE)
    .select(FULL_COLUMNS)
    .eq('edit_token', token)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updateLetterByEditToken(token, patch) {
  const supabase = getSupabase()
  const update = {}

  if (patch.title !== undefined) update.title = patch.title
  if (patch.content !== undefined) update.content = patch.content
  if (patch.senderName !== undefined) update.sender_name = patch.senderName
  if (patch.recipientName !== undefined) update.recipient_name = patch.recipientName
  if (patch.theme !== undefined) update.theme = patch.theme
  if (patch.coverImage !== undefined) update.cover_image = patch.coverImage
  if (patch.coverPosition !== undefined) update.cover_position = patch.coverPosition
  if (patch.moments !== undefined) update.moments = patch.moments
  if (patch.musicUrl !== undefined) update.music_url = patch.musicUrl
  if (patch.visibility !== undefined) update.visibility = patch.visibility
  if (patch.unlockDate !== undefined) update.unlock_date = patch.unlockDate
  if (patch.timerType !== undefined) update.timer_type = patch.timerType
  if (patch.timerLabel !== undefined) update.timer_label = patch.timerLabel
  if (patch.timerDate !== undefined) update.timer_date = patch.timerDate

  if (patch.password !== undefined) {
    update.password_hash = patch.password ? await hashPassword(patch.password) : null
  }

  // Pedido de foto física não é editável pela rota de edição na v1.
  // Mudanças aqui podem invalidar frete já calculado e snapshot do pedido.

  const { data, error } = await supabase
    .from(TABLE)
    .update(update)
    .eq('edit_token', token)
    .select(FULL_COLUMNS)
    .single()

  if (error) throw error
  return data
}

export async function incrementViews(slug) {
  const supabase = getSupabase()
  // RPC seria ideal mas evitamos overengineering: read-modify-write.
  // Race condition aqui é aceitável (views é métrica vaidade).
  const { data: current } = await supabase
    .from(TABLE)
    .select('views')
    .eq('slug', slug)
    .maybeSingle()

  if (!current) return
  await supabase
    .from(TABLE)
    .update({ views: (current.views || 0) + 1 })
    .eq('slug', slug)
}

// Marca a carta como paga via webhook do gateway. Idempotente:
// só atualiza se ainda está em awaiting_payment.
// Quando há foto física, também muda shipping_status para 'paid'.
export async function markAsPaid({ paymentId, externalSlug }) {
  const supabase = getSupabase()

  let query = supabase
    .from(TABLE)
    .select('id, payment_status, physical_photo_enabled, shipping_status')

  if (paymentId) query = query.eq('payment_id', paymentId)
  else if (externalSlug) query = query.eq('slug', externalSlug)
  else return { ok: false, reason: 'missing_id' }

  const { data: row, error } = await query.maybeSingle()
  if (error) throw error
  if (!row) return { ok: false, reason: 'not_found' }
  if (row.payment_status === 'paid') return { ok: true, alreadyPaid: true, id: row.id }

  const update = {
    payment_status: 'paid',
    payment_paid_at: new Date().toISOString(),
  }
  if (row.physical_photo_enabled && row.shipping_status === 'pending') {
    update.shipping_status = 'paid'
  }

  const { error: updErr } = await supabase
    .from(TABLE)
    .update(update)
    .eq('id', row.id)
  if (updErr) throw updErr

  return { ok: true, id: row.id }
}

// Marca cartas pendentes vencidas como expired. Idempotente.
// Chamada fire-and-forget no GET de /c/:slug.
export async function expireOldLetters() {
  const supabase = getSupabase()
  const { error } = await supabase
    .from(TABLE)
    .update({ payment_status: 'expired' })
    .eq('payment_status', 'awaiting_payment')
    .lt('payment_expires_at', new Date().toISOString())
  if (error) throw error
}

// Admin: lista pedidos pagos (e opcionalmente outros status) com filtros.
export async function listOrders({
  status = 'paid',
  hasPhoto,
  shippingStatus,
  limit = 100,
} = {}) {
  const supabase = getSupabase()
  let q = supabase
    .from(TABLE)
    .select(FULL_COLUMNS)
    .order('payment_paid_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status && status !== 'all') q = q.eq('payment_status', status)
  if (hasPhoto === true) q = q.eq('physical_photo_enabled', true)
  if (hasPhoto === false) q = q.eq('physical_photo_enabled', false)
  if (shippingStatus) q = q.eq('shipping_status', shippingStatus)

  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function getOrderById(id) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from(TABLE)
    .select(FULL_COLUMNS)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

const ALLOWED_SHIPPING_STATUS = ['pending', 'paid', 'shipped', 'delivered', 'canceled']
const ALLOWED_PAYMENT_STATUS = ['awaiting_payment', 'paid', 'expired', 'refunded']

export async function updateOrderStatus(id, { shippingStatus, paymentStatus }) {
  const supabase = getSupabase()
  const update = {}
  if (shippingStatus) {
    if (!ALLOWED_SHIPPING_STATUS.includes(shippingStatus)) {
      throw new Error('Invalid shippingStatus')
    }
    update.shipping_status = shippingStatus
  }
  if (paymentStatus) {
    if (!ALLOWED_PAYMENT_STATUS.includes(paymentStatus)) {
      throw new Error('Invalid paymentStatus')
    }
    update.payment_status = paymentStatus
    if (paymentStatus === 'paid') update.payment_paid_at = new Date().toISOString()
  }
  if (Object.keys(update).length === 0) return null

  const { data, error } = await supabase
    .from(TABLE)
    .update(update)
    .eq('id', id)
    .select(FULL_COLUMNS)
    .single()
  if (error) throw error
  return data
}

async function pickSlug(customSlug) {
  const supabase = getSupabase()

  if (customSlug) {
    const normalized = slugify(customSlug)
    if (normalized) {
      const { data } = await supabase
        .from(TABLE)
        .select('id')
        .eq('slug', normalized)
        .maybeSingle()
      if (!data) return normalized
    }
  }

  for (let i = 0; i < 5; i++) {
    const candidate = generateSlug()
    const { data } = await supabase
      .from(TABLE)
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()
    if (!data) return candidate
  }
  throw new Error('Não foi possível gerar um slug único. Tente novamente.')
}

// Converte row do banco para shape pública (sem segredos).
export function toPublicLetter(row, { includeContent = true } = {}) {
  if (!row) return null
  const out = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    senderName: row.sender_name,
    recipientName: row.recipient_name,
    theme: row.theme,
    coverImage: row.cover_image,
    coverPosition: row.cover_position || '50% 50%',
    moments: Array.isArray(row.moments) ? row.moments : [],
    musicUrl: row.music_url,
    visibility: row.visibility,
    unlockDate: row.unlock_date,
    views: row.views,
    createdAt: row.created_at,
    hasPassword: !!row.password_hash,
    timerType: row.timer_type,
    timerLabel: row.timer_label,
    timerDate: row.timer_date,
    physicalPhotoEnabled: !!row.physical_photo_enabled,
    shippingStatus: row.shipping_status,
    paymentStatus: row.payment_status,
  }
  if (includeContent) out.content = row.content
  return out
}

export function toEditableLetter(row) {
  if (!row) return null
  return {
    ...toPublicLetter(row),
    content: row.content,
    editToken: row.edit_token,
    physicalPhotoUrl: row.physical_photo_url,
    shippingAddress: row.shipping_address || null,
    shippingCostCents: row.shipping_cost_cents,
    shippingRegion: row.shipping_region,
    paymentAmountCents: row.payment_amount_cents,
    paymentUrl: row.payment_url,
    paymentExpiresAt: row.payment_expires_at,
    paymentPaidAt: row.payment_paid_at,
  }
}

// Para o admin — inclui PII e dados do pedido.
export function toAdminOrder(row) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    senderName: row.sender_name,
    recipientName: row.recipient_name,
    content: row.content,
    coverImage: row.cover_image,
    coverPosition: row.cover_position,
    theme: row.theme,
    createdAt: row.created_at,
    paymentStatus: row.payment_status,
    paymentAmountCents: row.payment_amount_cents,
    paymentPaidAt: row.payment_paid_at,
    paymentId: row.payment_id,
    paymentUrl: row.payment_url,
    paymentExpiresAt: row.payment_expires_at,
    physicalPhotoEnabled: !!row.physical_photo_enabled,
    physicalPhotoUrl: row.physical_photo_url,
    shippingAddress: row.shipping_address || null,
    shippingCostCents: row.shipping_cost_cents,
    shippingRegion: row.shipping_region,
    shippingStatus: row.shipping_status,
  }
}
