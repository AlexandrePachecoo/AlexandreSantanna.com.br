import { THEME_IDS } from '@/constants/themes'

export const LIMITS = {
  title: 80,
  content: 5000,
  name: 60,
  password: 64,
}

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

  if (musicUrl && !isValidUrl(musicUrl)) {
    errors.musicUrl = 'URL de música inválida.'
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
      musicUrl,
      visibility,
      password,
      unlockDate: unlockDateIso,
      customSlug,
    },
  }
}

export function isValidUrl(v) {
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
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
