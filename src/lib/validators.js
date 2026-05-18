import { THEME_IDS } from '@/constants/themes'

export const LIMITS = {
  title: 80,
  content: 5000,
  name: 60,
  password: 64,
  moments: 10,
  momentCaption: 140,
}

const COVER_POSITION_RE = /^\d{1,3}% \d{1,3}%$/

function trimOrNull(v, max) {
  if (v == null) return null
  const s = String(v).trim()
  if (!s) return null
  if (max && s.length > max) return s.slice(0, max)
  return s
}

export function validateLetterPayload(body, { partial = false } = {}) {
  const errors = {}

  const title = trimOrNull(body?.title, LIMITS.title)
  const content = trimOrNull(body?.content, LIMITS.content)
  const senderName = trimOrNull(body?.senderName, LIMITS.name)
  const recipientName = trimOrNull(body?.recipientName, LIMITS.name)
  const theme = trimOrNull(body?.theme, 32) || 'romantic'
  const coverImage = trimOrNull(body?.coverImage, 600)
  const musicUrl = trimOrNull(body?.musicUrl, 600)
  const visibility = body?.visibility === 'private' ? 'private' : 'public'
  const password = trimOrNull(body?.password, LIMITS.password)
  const unlockDate = trimOrNull(body?.unlockDate, 40)
  const customSlug = trimOrNull(body?.customSlug, 48)

  const coverPositionRaw = trimOrNull(body?.coverPosition, 16)
  const coverPosition =
    coverPositionRaw && COVER_POSITION_RE.test(coverPositionRaw)
      ? coverPositionRaw
      : '50% 50%'

  const { moments, momentsError } = parseMoments(body?.moments)
  if (momentsError) errors.moments = momentsError

  if (!partial) {
    if (!title) errors.title = 'Dê um título para a carta.'
    if (!content) errors.content = 'Escreva a mensagem.'
  }
  if (title && title.length < 2) errors.title = 'Título muito curto.'
  if (content && content.length < 10) errors.content = 'A mensagem precisa de pelo menos 10 caracteres.'

  if (!THEME_IDS.includes(theme)) errors.theme = 'Tema inválido.'

  if (visibility === 'private' && !partial && !password) {
    errors.password = 'Senha é obrigatória para cartas privadas.'
  }
  if (password && password.length < 4) {
    errors.password = 'Senha deve ter pelo menos 4 caracteres.'
  }

  if (musicUrl && !isYouTubeUrl(musicUrl)) {
    errors.musicUrl = 'Cole um link do YouTube.'
  }
  if (coverImage && !isValidUrl(coverImage) && !coverImage.startsWith('letters/')) {
    errors.coverImage = 'Capa inválida.'
  }

  let unlockDateIso = null
  if (unlockDate) {
    const d = new Date(unlockDate)
    if (Number.isNaN(d.getTime())) {
      errors.unlockDate = 'Data inválida.'
    } else {
      unlockDateIso = d.toISOString()
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: {
      title,
      content,
      senderName,
      recipientName,
      theme,
      coverImage,
      coverPosition,
      musicUrl,
      visibility,
      password,
      unlockDate: unlockDateIso,
      customSlug,
      moments,
    },
  }
}

function parseMoments(raw) {
  if (raw == null) return { moments: [], momentsError: null }
  if (!Array.isArray(raw)) {
    return { moments: [], momentsError: 'Momentos inválidos.' }
  }
  if (raw.length > LIMITS.moments) {
    return {
      moments: [],
      momentsError: `Máximo de ${LIMITS.moments} momentos.`,
    }
  }
  const out = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const url = trimOrNull(item.url, 600)
    if (!url) continue
    if (!isValidUrl(url) && !url.startsWith('letters/')) {
      return { moments: [], momentsError: 'URL de momento inválida.' }
    }
    const caption = trimOrNull(item.caption, LIMITS.momentCaption) || ''
    out.push({ url, caption })
  }
  return { moments: out, momentsError: null }
}

export function isValidUrl(v) {
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

const YOUTUBE_RE =
  /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)[\w-]+/

export function isYouTubeUrl(v) {
  if (!v || typeof v !== 'string') return false
  if (!isValidUrl(v)) return false
  return YOUTUBE_RE.test(v)
}

// Sanitiza texto antes de devolver para o client.
// Remove <script>, on*=... handlers e qualquer tag perigosa.
const TAG_BLOCKLIST = /<\s*(script|iframe|object|embed|style|link|meta)\b[^>]*>([\s\S]*?<\s*\/\s*\1\s*>)?/gi
const ATTR_BLOCKLIST = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi

export function sanitizeText(input) {
  if (input == null) return ''
  return String(input)
    .replace(TAG_BLOCKLIST, '')
    .replace(ATTR_BLOCKLIST, '')
}
