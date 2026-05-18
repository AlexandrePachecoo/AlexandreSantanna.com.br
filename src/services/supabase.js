import { createClient } from '@supabase/supabase-js'

let cached = null

// Server-only. Service role key — NUNCA expor para o client.
export function getSupabase() {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase mal configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'letters'
