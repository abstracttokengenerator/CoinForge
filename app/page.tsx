'use client'

import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { LaunchForm } from '@/components/LaunchForm'
import { RecentTokens } from '@/components/RecentTokens'
import { Stats } from '@/components/Stats'
import { HowItWorks } from '@/components/HowItWorks'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Ambient background glows */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="animate-pulse-soft" style={{ position: 'absolute', top: 0, left: '20%', width: 600, height: 600, background: 'rgba(147,51,234,0.15)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div className="animate-pulse-soft" style={{ position: 'absolute', bottom: '20%', right: '10%', width: 500, height: 500, background: 'rgba(59,130,246,0.12)', borderRadius: '50%', filter: 'blur(80px)', animationDelay: '1.5s' }} />
        <div className="animate-pulse-soft" style={{ position: 'absolute', top: '50%', right: '30%', width: 400, height: 400, background: 'rgba(236,72,153,0.1)', borderRadius: '50%', filter: 'blur(80px)', animationDelay: '3s' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Nav />
        <Hero />
        <Stats />
        <RecentTokens />
        <HowItWorks />
        <LaunchForm />
        <Footer />
      </div>
    </main>
  )
}
