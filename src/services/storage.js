import { nanoid } from 'nanoid'
import { getSupabase, STORAGE_BUCKET } from '@/services/supabase'

const ALLOWED_MIME = /^image\/(png|jpe?g|webp|gif|avif)$/i
const MAX_BYTES = 8 * 1024 * 1024 // 8MB

function extFromMime(mime) {
  if (!mime) return 'bin'
  const m = mime.match(/^image\/(\w+)/i)
  if (!m) return 'bin'
  return m[1].toLowerCase().replace('jpeg', 'jpg')
}

export function buildCoverPath(mime) {
  return `covers/${nanoid(10)}-${Date.now()}.${extFromMime(mime)}`
}

export async function createCoverUploadUrl({ mimeType, size }) {
  if (!ALLOWED_MIME.test(mimeType || '')) {
    throw new Error('Formato de imagem não suportado.')
  }
  if (size && size > MAX_BYTES) {
    throw new Error('Imagem muito grande (máx 8MB).')
  }

  const supabase = getSupabase()
  const path = buildCoverPath(mimeType)

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path)

  if (error) throw error
  return {
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: getPublicUrl(path),
  }
}

export function getPublicUrl(path) {
  if (!path) return null
  const supabase = getSupabase()
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
