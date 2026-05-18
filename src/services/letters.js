import { getSupabase } from '@/services/supabase'
import { generateEditToken, generateSlug, slugify } from '@/lib/slug'
import { hashPassword } from '@/lib/password'

const TABLE = 'letters'

const PUBLIC_COLUMNS =
  'id, slug, title, content, sender_name, recipient_name, theme, cover_image, music_url, visibility, unlock_date, views, created_at, updated_at'

const FULL_COLUMNS = `${PUBLIC_COLUMNS}, edit_token, password_hash`

export async function createLetter(payload) {
  const supabase = getSupabase()

  const slug = await pickSlug(payload.customSlug)
  const editToken = generateEditToken()
  const passwordHash = payload.password ? await hashPassword(payload.password) : null

  const row = {
    slug,
    edit_token: editToken,
    title: payload.title,
    content: payload.content,
    sender_name: payload.senderName ?? null,
    recipient_name: payload.recipientName ?? null,
    theme: payload.theme ?? 'romantic',
    cover_image: payload.coverImage ?? null,
    music_url: payload.musicUrl ?? null,
    visibility: payload.visibility ?? 'public',
    password_hash: passwordHash,
    unlock_date: payload.unlockDate ?? null,
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select(FULL_COLUMNS)
    .single()

  if (error) throw error
  return data
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
  if (patch.musicUrl !== undefined) update.music_url = patch.musicUrl
  if (patch.visibility !== undefined) update.visibility = patch.visibility
  if (patch.unlockDate !== undefined) update.unlock_date = patch.unlockDate

  if (patch.password !== undefined) {
    update.password_hash = patch.password ? await hashPassword(patch.password) : null
  }

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
    musicUrl: row.music_url,
    visibility: row.visibility,
    unlockDate: row.unlock_date,
    views: row.views,
    createdAt: row.created_at,
    hasPassword: !!row.password_hash,
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
  }
}
