import Link from 'next/link'
import { MailX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-rose-50 via-white to-rose-100 p-6">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <MailX className="h-6 w-6" />
        </div>
        <h1 className="mt-6 font-display text-3xl">Carta não encontrada</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          O link pode ter sido digitado errado ou a carta foi removida.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  )
}
