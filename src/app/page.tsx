'use client'

import { Navigation } from '@/components/navigation'
import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { ApiDemo } from '@/components/api-demo'
import { Pricing } from '@/components/pricing'
import { CTA } from '@/components/cta'
import {Footer} from '@/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <Hero />
      <Features />
      <ApiDemo />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
