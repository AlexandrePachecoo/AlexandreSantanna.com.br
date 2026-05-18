import Link from 'next/link'
import { Heart } from 'lucide-react'
import { SITE } from '@/constants/site'

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="font-display text-lg">
            special<span className="text-primary">Day</span>
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{SITE.tagline}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/#como-funciona" className="hover:text-foreground transition-colors">
            Como funciona
          </Link>
          <Link href="/#templates" className="hover:text-foreground transition-colors">
            Templates
          </Link>
          <Link href="/#faq" className="hover:text-foreground transition-colors">
            FAQ
          </Link>
          <Link href="/create" className="hover:text-foreground transition-colors">
            Criar carta
          </Link>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Feito com <Heart className="h-3 w-3 fill-primary text-primary" /> para momentos
          que importam.
        </div>
      </div>
    </footer>
  )
}
