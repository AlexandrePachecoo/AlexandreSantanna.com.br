import { LoginForm } from './LoginForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: 'Admin · specialDay', robots: 'noindex,nofollow' }

export default async function AdminLoginPage({ searchParams }) {
  const sp = await searchParams
  const next = typeof sp?.next === 'string' ? sp.next : '/admin'
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Área restrita
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entre com a senha do painel para ver pedidos.
        </p>
        <LoginForm nextUrl={next} />
      </div>
    </div>
  )
}
