import { Navbar } from '@/components/sections/Navbar'
import { Hero } from '@/components/sections/Hero'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Demo } from '@/components/sections/Demo'
import { Templates } from '@/components/sections/Templates'
import { FAQ } from '@/components/sections/FAQ'
import { CTA } from '@/components/sections/CTA'
import { Footer } from '@/components/sections/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Demo />
        <Templates />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
