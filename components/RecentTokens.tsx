'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useReadContract } from 'wagmi'
import { TOKEN_FACTORY_ABI } from '@/lib/abi'
import { FACTORY_ADDRESS, EXPLORER_URL } from '@/lib/config'
import { ExternalLink, TrendingUp } from 'lucide-react'

interface Token {
  tokenAddress: string
  creator: string
  name: string
  symbol: string
  totalSupply: string
  description: string
  website: string
  createdAt: number
}

export function RecentTokens() {
  const [mounted, setMounted] = useState(false)
  const [tokens, setTokens] = useState<Token[]>([])

  const { data: tokenCount } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: TOKEN_FACTORY_ABI,
    functionName: 'getTokenCount',
  })

  const { data: fetchedTokens } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: TOKEN_FACTORY_ABI,
    functionName: 'getTokens',
    args: [BigInt(0), BigInt(10)],
    query: { enabled: !!tokenCount && Number(tokenCount) > 0 },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (fetchedTokens && Array.isArray(fetchedTokens)) {
      setTokens(fetchedTokens as Token[])
    }
  }, [fetchedTokens])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  if (!mounted || !tokenCount || Number(tokenCount) === 0) {
    return null
  }

  return (
    <section className="py-24 px-4 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl md:text-5xl font-bold text-center mb-4 gradient-text"
        >
          Recent Launches
        </motion.h2>
        <p className="text-center text-slate-400 mb-12">
          See what's being launched on Abstract right now
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokens.map((token, i) => (
            <motion.div
              key={token.tokenAddress}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-4 rounded-xl hover:bg-white/10 transition group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg group-hover:gradient-text transition">
                    {token.name}
                  </h3>
                  <p className="text-sm text-purple-400 font-semibold">
                    ${token.symbol}
                  </p>
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>

              {/* Supply */}
              <p className="text-xs text-slate-400 mb-3">
                Supply: <span className="text-white font-semibold">{Number(token.totalSupply).toLocaleString()}</span>
              </p>

              {/* Description */}
              {token.description && (
                <p className="text-xs text-slate-300 mb-3 line-clamp-2">
                  {token.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-700">
                <span>{formatTime(Number(token.createdAt) as unknown as number)}</span>
                <a
                  href={`${EXPLORER_URL}/token/${token.tokenAddress}#transactions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {tokens.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Loading recent tokens...
          </div>
        )}
      </div>
    </section>
  )
}
