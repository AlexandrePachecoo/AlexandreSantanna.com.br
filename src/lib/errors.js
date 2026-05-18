// Helpers para logar erros do Supabase/PostgREST de forma estruturada
// e devolver respostas 500 com um código de correlação pro Vercel logs.

import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

const ENV_HINT = {
  NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
}

export function logServerError(scope, err, context = {}) {
  const errorId = nanoid(8)
  // Supabase/PostgREST error shape: { message, code, details, hint }
  const supabase = err?.code
    ? { code: err.code, message: err.message, details: err.details, hint: err.hint }
    : null

  console.error(
    `[${scope}] error_id=${errorId}`,
    JSON.stringify({
      errorId,
      scope,
      message: err?.message,
      name: err?.name,
      stack: err?.stack?.split('\n').slice(0, 6),
      supabase,
      env: ENV_HINT,
      ...context,
    })
  )
  return errorId
}

export function serverErrorResponse(scope, err, fallbackMessage) {
  const errorId = logServerError(scope, err)
  const body = {
    error: fallbackMessage || 'Erro interno.',
    errorId,
  }
  // Erro custom de env mal configurado: deixa claro no client.
  if (typeof err?.message === 'string' && err.message.includes('Supabase mal configurado')) {
    body.error = 'Servidor mal configurado. Veja os logs.'
    body.hint = 'env_missing'
  }
  // Tabela não existe (PostgREST). Mensagem clara para quem está deployando.
  if (err?.code === '42P01' || /relation .* does not exist/i.test(err?.message || '')) {
    body.error = 'Banco não inicializado. Rode supabase/migrations/0001_letters.sql.'
    body.hint = 'migration_missing'
  }
  return NextResponse.json(body, { status: 500 })
}
