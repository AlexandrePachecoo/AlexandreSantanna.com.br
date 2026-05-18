import Link from 'next/link'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-amber-50 via-white to-rose-50 p-6">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="mt-6 font-display text-3xl">Link de edição inválido</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Esse link de edição não existe ou expirou. Se você perdeu, infelizmente não
          temos como recuperar — o token é a única chave.
        </p>
        <Button asChild className="mt-6">
          <Link href="/create">Criar nova carta</Link>
        </Button>
      </div>
    </div>
  )
}
