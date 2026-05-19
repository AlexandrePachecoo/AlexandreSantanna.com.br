import { NextResponse } from 'next/server'
import { ADMIN_COOKIE_NAME } from '@/lib/adminCookie'

// Edge middleware: faz só o check leve da presença do cookie de admin.
// Validação criptográfica completa (HMAC) acontece no layout do /admin (server component),
// porque node:crypto não roda em Edge runtime. Sem cookie → redireciona/401 já aqui pra evitar
// render desnecessário; com cookie presente, o layout confirma assinatura.

export function middleware(req) {
  const { pathname } = req.nextUrl

  // Propaga pathname para server components via header (layout do /admin precisa
  // saber se a rota atual é a de login para não envolver no chrome autenticado).
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)

  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login'
  const isAdminApi =
    pathname.startsWith('/api/admin') && pathname !== '/api/admin/login'

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const hasCookie = !!req.cookies.get(ADMIN_COOKIE_NAME)?.value

  if (hasCookie) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (isAdminApi) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/admin/login'
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  // Matcher inclui também /admin/login pra que o header x-pathname seja propagado lá.
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
