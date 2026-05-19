import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/lib/adminAuth'
import { LogoutButton } from './LogoutButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: 'Admin · specialDay', robots: 'noindex,nofollow' }

export default async function AdminLayout({ children }) {
  // Login tem seu próprio shell — pula header autenticado pra evitar loop de redirect.
  // O middleware seta x-pathname pra rotas que casam o matcher de /admin.
  const h = await headers()
  const pathname = h.get('x-pathname') || ''
  if (pathname === '/admin/login') return <>{children}</>

  const store = await cookies()
  const token = store.get(ADMIN_COOKIE_NAME)?.value
  const session = verifySessionToken(token)
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/admin" className="font-display text-base font-semibold tracking-tight">
            specialDay · admin
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="container mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
