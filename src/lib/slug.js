import { customAlphabet, nanoid } from 'nanoid'

const SLUG_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'
const slugFromAlphabet = customAlphabet(SLUG_ALPHABET, 8)

export function generateSlug() {
  return slugFromAlphabet()
}

export function generateEditToken() {
  return nanoid(24)
}

const reserved = new Set([
  'create',
  'edit',
  'api',
  'admin',
  'login',
  'signup',
  'c',
  'about',
  'terms',
  'privacy',
  'help',
  'faq',
])

export function slugify(input) {
  if (!input) return null
  const normalized = String(input)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!normalized) return null
  if (normalized.length < 3 || normalized.length > 48) return null
  if (reserved.has(normalized)) return null
  return normalized
}
