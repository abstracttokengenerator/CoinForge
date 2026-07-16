import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a1f 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: -100, left: 100, width: 400, height: 400, background: 'rgba(147,51,234,0.25)', borderRadius: '50%', filter: 'blur(80px)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -100, right: 100, width: 400, height: 400, background: 'rgba(59,130,246,0.2)', borderRadius: '50%', filter: 'blur(80px)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 100, right: 200, width: 300, height: 300, background: 'rgba(236,72,153,0.15)', borderRadius: '50%', filter: 'blur(60px)', display: 'flex' }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, zIndex: 10 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 72 }}>🔨</span>
            <span style={{ fontSize: 72, fontWeight: 900, background: 'linear-gradient(to right, #c084fc, #f472b6, #60a5fa)', backgroundClip: 'text', color: 'transparent' }}>
              CoinForge
            </span>
          </div>

          {/* Tagline */}
          <p style={{ fontSize: 32, color: 'rgba(255,255,255,0.7)', margin: 0, textAlign: 'center', maxWidth: 800 }}>
            Launch tokens on Abstract in 60 seconds
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {[
              { icon: '🚀', text: 'Token Launcher' },
              { icon: '🪂', text: 'Batch Airdrop' },
              { icon: '⚡', text: 'Abstract Chain' },
            ].map((f) => (
              <div key={f.text} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 100,
                padding: '10px 20px',
                fontSize: 22,
                color: 'rgba(255,255,255,0.85)',
              }}>
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          {/* URL */}
          <p style={{ fontSize: 22, color: 'rgba(147,51,234,0.9)', margin: 0, marginTop: 8 }}>
            coin-forge-six.vercel.app
          </p>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
