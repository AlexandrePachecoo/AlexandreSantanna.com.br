import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import { SITE } from '@/constants/site'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata = {
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s • ${SITE.name}` },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.tagline,
  },
}

export const viewport = {
  themeColor: SITE.themeColor,
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background font-sans">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
