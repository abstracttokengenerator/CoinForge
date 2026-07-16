'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLoginWithAbstract } from '@abstract-foundation/agw-react'
import { useAccount } from 'wagmi'

export function Nav() {
  const pathname = usePathname()
  const { login, logout } = useLoginWithAbstract()
  const { isConnected, address } = useAccount()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0.875rem 1.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 800 }} className="gradient-text">🔨 CoinForge</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link href="/" style={{
          textDecoration: 'none',
          color: pathname === '/' ? '#c084fc' : 'rgba(255,255,255,0.6)',
          fontWeight: pathname === '/' ? 600 : 400,
          fontSize: '0.9rem',
          transition: 'color 0.2s',
        }}>
          🚀 Launch
        </Link>
        <a href="https://x.com/tokencreater" target="_blank" rel="noopener noreferrer" style={{
          textDecoration: 'none',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.85rem',
          transition: 'color 0.2s',
        }}>
          𝕏
        </a>
        <Link href="/airdrop" style={{
          textDecoration: 'none',
          color: pathname === '/airdrop' ? '#34d399' : 'rgba(255,255,255,0.6)',
          fontWeight: pathname === '/airdrop' ? 600 : 400,
          fontSize: '0.9rem',
          transition: 'color 0.2s',
        }}>
          🪂 Airdrop
        </Link>

        {/* Wallet */}
        {isConnected ? (
          <button
            onClick={() => logout()}
            style={{
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.3)',
              color: '#34d399',
              padding: '0.4rem 0.875rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            {address?.slice(0, 6)}...{address?.slice(-4)} ✓
          </button>
        ) : (
          <button
            onClick={() => login()}
            style={{
              background: 'linear-gradient(to right, #9333ea, #3b82f6)',
              border: 'none',
              color: '#fff',
              padding: '0.4rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Connect
          </button>
        )}
      </div>
    </nav>
  )
}
