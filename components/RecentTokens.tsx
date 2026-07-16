'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { EXPLORER_URL } from '@/lib/config'

interface Token {
  contractAddress: string
  tokenName: string
  tokenSymbol: string
  timeStamp: string
  fromCoinForge: boolean
  description?: string
  priceUsd?: number | null
  priceChange24h?: number | null
  volume24h?: number | null
  liquidity?: number | null
  marketCap?: number | null
  imageUrl?: string | null
  dexUrl?: string | null
}

function Sparkline({ change }: { change: number | null | undefined }) {
  if (change === null || change === undefined) return null
  const up = change >= 0
  // Simple SVG sparkline that visually shows up or down trend
  const points = up
    ? '0,20 10,15 20,18 30,10 40,12 50,5 60,8 70,3'
    : '0,3 10,6 20,4 30,12 40,10 50,16 60,14 70,20'
  return (
    <svg width="70" height="24" viewBox="0 0 70 24" style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={up ? '#34d399' : '#f87171'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TokenIcon({ imageUrl, symbol }: { imageUrl?: string | null; symbol: string }) {
  const [imgError, setImgError] = useState(false)
  const colors = ['#9333ea', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#6366f1']
  const color = colors[symbol.charCodeAt(0) % colors.length]

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={symbol}
        onError={() => setImgError(true)}
        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }

  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: '0.8rem', color: '#fff',
    }}>
      {symbol.slice(0, 2).toUpperCase()}
    </div>
  )
}

function formatUsd(n: number | null | undefined): string {
  if (!n) return '—'
  if (n < 0.000001) return `$${n.toExponential(2)}`
  if (n < 0.01) return `$${n.toFixed(6)}`
  if (n < 1) return `$${n.toFixed(4)}`
  if (n < 1000) return `$${n.toFixed(2)}`
  if (n < 1_000_000) return `$${(n / 1000).toFixed(1)}K`
  if (n < 1_000_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  return `$${(n / 1_000_000_000).toFixed(1)}B`
}

function formatTime(timestamp: string): string {
  const diff = Math.floor((Date.now() - Number(timestamp) * 1000) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function RecentTokens() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'coinforge'>('all')

  const fetchTokens = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tokens')
      const data = await res.json()
      setTokens(data.tokens ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTokens() }, [fetchTokens])

  const filtered = filter === 'coinforge' ? tokens.filter(t => t.fromCoinForge) : tokens

  return (
    <section className="py-24 px-4" style={{ background: 'rgba(255,255,255,0.015)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' }}
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-1">Live on Abstract</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              Real-time tokens · prices via DexScreener
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {(['all', 'coinforge'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.82rem',
                fontWeight: filter === f ? 700 : 400, cursor: 'pointer',
                border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.15)',
                background: filter === f ? 'linear-gradient(to right,#9333ea,#3b82f6)' : 'none',
                color: filter === f ? '#fff' : 'rgba(255,255,255,0.5)',
              }}>
                {f === 'all' ? '🌐 All Abstract' : '🔨 CoinForge'}
              </button>
            ))}
            <button onClick={fetchTokens} style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '9999px', padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
            }}>
              <RefreshCw style={{ width: 14, height: 14, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </motion.div>

        {/* Table header */}
        {!loading && filtered.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
            padding: '0.5rem 1rem', marginBottom: '0.5rem',
            fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>Token</span>
            <span style={{ textAlign: 'right' }}>Price</span>
            <span style={{ textAlign: 'right' }}>24h</span>
            <span style={{ textAlign: 'right' }}>Volume 24h</span>
            <span style={{ textAlign: 'right' }}>Chart</span>
          </div>
        )}

        {/* Token rows */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                height: 64, borderRadius: '0.75rem',
                background: 'rgba(255,255,255,0.04)',
                animation: 'pulse 2s infinite',
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
            {filter === 'coinforge'
              ? 'No CoinForge tokens yet — be the first! 🚀'
              : 'Loading tokens...'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {filtered.map((token, i) => {
              const up = token.priceChange24h !== null && token.priceChange24h !== undefined && token.priceChange24h >= 0
              const hasPrice = token.priceUsd !== null && token.priceUsd !== undefined
              const href = token.dexUrl ?? `${EXPLORER_URL}/token/${token.contractAddress}#transactions`

              return (
                <motion.a
                  key={token.contractAddress}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    textDecoration: 'none',
                    background: token.fromCoinForge ? 'rgba(147,51,234,0.07)' : 'rgba(255,255,255,0.03)',
                    border: token.fromCoinForge ? '1px solid rgba(147,51,234,0.2)' : '1px solid rgba(255,255,255,0.06)',
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = token.fromCoinForge ? 'rgba(147,51,234,0.13)' : 'rgba(255,255,255,0.07)')}
                  onMouseLeave={e => (e.currentTarget.style.background = token.fromCoinForge ? 'rgba(147,51,234,0.07)' : 'rgba(255,255,255,0.03)')}
                >
                  {/* Token info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <TokenIcon imageUrl={token.imageUrl} symbol={token.tokenSymbol} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {token.tokenName}
                        </span>
                        {token.fromCoinForge && (
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 700, flexShrink: 0,
                            background: 'linear-gradient(to right,#9333ea,#3b82f6)',
                            borderRadius: '9999px', padding: '0.1rem 0.4rem', color: '#fff',
                          }}>🔨</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 600 }}>
                          ${token.tokenSymbol}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
                          {formatTime(token.timeStamp)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: hasPrice ? '#fff' : 'rgba(255,255,255,0.2)' }}>
                      {formatUsd(token.priceUsd)}
                    </span>
                  </div>

                  {/* 24h change */}
                  <div style={{ textAlign: 'right' }}>
                    {token.priceChange24h !== null && token.priceChange24h !== undefined ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                        fontSize: '0.85rem', fontWeight: 600,
                        color: up ? '#34d399' : '#f87171',
                      }}>
                        {up ? <TrendingUp style={{ width: 12, height: 12 }} /> : <TrendingDown style={{ width: 12, height: 12 }} />}
                        {up ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                      </span>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>—</span>
                    )}
                  </div>

                  {/* Volume */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', color: token.volume24h ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}>
                      {formatUsd(token.volume24h)}
                    </span>
                  </div>

                  {/* Sparkline */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Sparkline change={token.priceChange24h} />
                  </div>
                </motion.a>
              )
            })}
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>
          🔨 CoinForge launched &nbsp;·&nbsp; Prices via DexScreener &nbsp;·&nbsp;
          <a href={EXPLORER_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(147,51,234,0.6)', textDecoration: 'none' }}>
            Full explorer →
          </a>
        </p>
      </div>
    </section>
  )
}
