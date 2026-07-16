'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { EXPLORER_URL } from '@/lib/config'

interface Token {
  contractAddress: string
  tokenName: string
  tokenSymbol: string
  timeStamp: string
  fromCoinForge: boolean
  txHash?: string
}

export function RecentTokens() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'coinforge'>('all')
  const [, setLastUpdated] = useState<number | null>(null)

  const fetchTokens = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tokens')
      const data = await res.json()
      setTokens(data.tokens ?? [])
      setLastUpdated(data.updatedAt)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTokens() }, [])

  const formatTime = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const filtered = filter === 'coinforge' ? tokens.filter(t => t.fromCoinForge) : tokens

  return (
    <section className="py-24 px-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
              Live on Abstract
            </h2>
            <p className="text-slate-400 text-sm">
              Tokens deployed on Abstract · newest first
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Filter tabs */}
            {(['all', 'coinforge'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: filter === f ? 700 : 400,
                  cursor: 'pointer',
                  border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  background: filter === f ? 'linear-gradient(to right, #9333ea, #3b82f6)' : 'none',
                  color: filter === f ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s',
                }}
              >
                {f === 'all' ? '🌐 All Abstract' : '🔨 CoinForge'}
              </button>
            ))}
            {/* Refresh */}
            <button
              onClick={fetchTokens}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '9999px', padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 120, background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', animation: 'pulse 2s infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
            {filter === 'coinforge' ? 'No CoinForge tokens yet — be the first! 🚀' : 'No tokens found'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filtered.map((token, i) => (
              <motion.a
                key={token.contractAddress}
                href={`${EXPLORER_URL}/token/${token.contractAddress}#transactions`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: token.fromCoinForge
                    ? '1px solid rgba(147,51,234,0.35)'
                    : '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                        {token.tokenName || 'Unknown Token'}
                      </span>
                      {token.fromCoinForge && (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700,
                          background: 'linear-gradient(to right,#9333ea,#3b82f6)',
                          borderRadius: '9999px', padding: '0.1rem 0.45rem', color: '#fff',
                        }}>
                          🔨
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 600 }}>
                      ${token.tokenSymbol}
                    </span>
                  </div>
                  <ExternalLink style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>
                    {token.contractAddress.slice(0, 8)}...{token.contractAddress.slice(-6)}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                    {formatTime(token.timeStamp)}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {/* Footer note */}
        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
          🔨 = launched via CoinForge &nbsp;·&nbsp; Data from Abstract mainnet &nbsp;·&nbsp;{' '}
          <a href={EXPLORER_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(147,51,234,0.7)', textDecoration: 'none' }}>
            View all on Abscan →
          </a>
        </p>
      </div>
    </section>
  )
}
