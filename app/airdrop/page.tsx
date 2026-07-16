'use client'

import { AirdropForm } from '@/components/AirdropForm'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'

export default function AirdropPage() {
  return (
    <main className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="animate-pulse-soft" style={{ position: 'absolute', top: '10%', right: '20%', width: 500, height: 500, background: 'rgba(16,185,129,0.12)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div className="animate-pulse-soft" style={{ position: 'absolute', bottom: '20%', left: '10%', width: 400, height: 400, background: 'rgba(147,51,234,0.12)', borderRadius: '50%', filter: 'blur(80px)', animationDelay: '2s' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Nav />
        <AirdropForm />
        <Footer />
      </div>
    </main>
  )
}
