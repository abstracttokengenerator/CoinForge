'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoginWithAbstract } from '@abstract-foundation/agw-react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import toast from 'react-hot-toast'
import { TOKEN_FACTORY_ABI } from '@/lib/abi'
import { FACTORY_ADDRESS, CREATION_FEE_ETH, EXPLORER_URL } from '@/lib/config'
import { Share2, ExternalLink, Rocket } from 'lucide-react'
import { BrowserBanner } from '@/components/BrowserBanner'

type FormState = 'idle' | 'submitting' | 'success'

export function LaunchForm() {
  const { login, logout } = useLoginWithAbstract()
  const { isConnected, address } = useAccount()
  const { writeContract, data: hash } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  const [formState, setFormState] = useState<FormState>('idle')
  const [deployedToken, setDeployedToken] = useState<{
    name: string; symbol: string; supply: string; tx?: string
  } | null>(null)

  const [form, setForm] = useState({
    name: '', symbol: '', supply: '', description: '', website: '',
  })

  const isFormValid =
    form.name.trim().length > 0 &&
    form.symbol.trim().length >= 1 &&
    form.symbol.trim().length <= 10 &&
    Number(form.supply) > 0

  // Watch for tx confirmation
  if (isSuccess && hash && formState === 'submitting') {
    setFormState('success')
    setDeployedToken({ name: form.name, symbol: form.symbol.toUpperCase(), supply: form.supply, tx: hash })

    // Confetti via dynamic import
    import('canvas-confetti').then((m) => {
      m.default({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
    })
    toast.success('🎉 Token launched on Abstract!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) { login(); return }
    if (!isFormValid) { toast.error('Please fill in required fields'); return }

    setFormState('submitting')
    try {
      writeContract({
        address: FACTORY_ADDRESS,
        abi: TOKEN_FACTORY_ABI,
        functionName: 'createToken',
        args: [
          form.name,
          form.symbol.toUpperCase(),
          BigInt(Math.floor(Number(form.supply))),
          form.description,
          form.website,
        ],
        value: BigInt('1500000000000000'), // 0.0015 ETH
      })
    } catch {
      toast.error('Transaction failed')
      setFormState('idle')
    }
  }

  const handleShareTwitter = () => {
    if (!deployedToken) return
    const text = `🚀 Just launched $${deployedToken.symbol} on @AbstractL2 with CoinForge!\n\nSupply: ${Number(deployedToken.supply).toLocaleString()} ${deployedToken.symbol}\n\nCreate yours 👇 #Abstract #DeFi`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const resetForm = () => {
    setDeployedToken(null)
    setForm({ name: '', symbol: '', supply: '', description: '', website: '' })
    setFormState('idle')
  }

  return (
    <section id="launch-form" className="py-24 px-4 scroll-mt-20">
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          className="text-4xl md:text-5xl font-bold text-center mb-3 gradient-text"
        >
          Launch Your Token
        </motion.h2>
        <p className="text-center text-slate-400 mb-12">
          Fill in the details and your token deploys in seconds
        </p>

        <BrowserBanner />
        <AnimatePresence mode="wait">
          {!deployedToken ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="glass p-8 rounded-2xl space-y-6"
            >
              {/* Token Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-200">
                  Token Name <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pepe Coin"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={50}
                  disabled={formState !== 'idle'}
                  required
                />
              </div>

              {/* Symbol + Supply */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-200">
                    Symbol <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PEPE"
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                    maxLength={10}
                    disabled={formState !== 'idle'}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Max 10 chars</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-200">
                    Total Supply <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1000000"
                    value={form.supply}
                    onChange={(e) => setForm({ ...form, supply: e.target.value })}
                    min="1"
                    disabled={formState !== 'idle'}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-200">
                  Description <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="Tell the world about your token..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={200}
                  rows={3}
                  disabled={formState !== 'idle'}
                  style={{ resize: 'none' }}
                />
                <p className="text-xs text-slate-500 mt-1">{form.description.length}/200</p>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-200">
                  Website <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  disabled={formState !== 'idle'}
                />
              </div>

              {/* Fee breakdown */}
              <div style={{ background: 'rgba(147,51,234,0.08)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '0.75rem', padding: '1rem' }}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">One-time creation fee</span>
                  <span className="font-semibold text-white">{CREATION_FEE_ETH} ETH (~$5)</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-400">CoinForge fee</span>
                  <span className="text-purple-300">0.1% of supply</span>
                </div>
                <p className="text-xs text-slate-500">
                  ✓ No owner controls &nbsp;·&nbsp; ✓ Immutable ERC20 &nbsp;·&nbsp; ✓ No minting after launch
                </p>
              </div>

              {/* Action */}
              {!isConnected ? (
                <button type="button" onClick={login} className="btn-gradient w-full text-lg flex items-center justify-center gap-2">
                  Connect Abstract Wallet
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={!isFormValid || formState !== 'idle'}
                    className="btn-gradient w-full text-lg flex items-center justify-center gap-2"
                  >
                    {formState === 'submitting' ? (
                      <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span> Deploying...</>
                    ) : (
                      <><Rocket className="w-5 h-5" /> Launch Token 🚀</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full text-center text-sm text-slate-500 hover:text-slate-300 transition py-1"
                  >
                    Connected: {address?.slice(0, 6)}...{address?.slice(-4)} (disconnect)
                  </button>
                </div>
              )}
            </motion.form>
          ) : (
            /* Success card */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass p-8 rounded-2xl text-center space-y-6"
            >
              <div style={{ fontSize: '4rem' }}>🎉</div>
              <h3 className="text-3xl font-bold gradient-text">Your token is live!</h3>
              <p className="text-slate-400">Welcome to the Abstract ecosystem.</p>

              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '1.25rem' }} className="text-left space-y-3">
                {[
                  ['Token', deployedToken.name],
                  ['Symbol', `$${deployedToken.symbol}`],
                  ['Total Supply', Number(deployedToken.supply).toLocaleString()],
                  ['Network', 'Abstract Mainnet'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>

              {deployedToken.tx && (
                <a
                  href={`${EXPLORER_URL}/tx/${deployedToken.tx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Abscan
                </a>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShareTwitter}
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm transition"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <Share2 className="w-4 h-4" />
                  Share on X
                </button>
                <button onClick={resetForm} className="btn-gradient py-2 px-4 text-sm">
                  Launch Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
