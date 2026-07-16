'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoginWithAbstract } from '@abstract-foundation/agw-react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, isAddress } from 'viem'
import toast from 'react-hot-toast'
import { ERC20_ABI, AIRDROP_ABI } from '@/lib/airdropAbi'
import { AIRDROP_ADDRESS, AIRDROP_FEE_ETH, EXPLORER_URL } from '@/lib/config'
import { Plus, Trash2, Upload, ExternalLink } from 'lucide-react'
import { BrowserBanner } from '@/components/BrowserBanner'

interface Recipient { address: string; amount: string }

type Step = 'setup' | 'approve' | 'send' | 'done'

export function AirdropForm() {
  const { login, logout } = useLoginWithAbstract()
  const { isConnected, address } = useAccount()

  const [tokenAddress, setTokenAddress] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: '', amount: '' },
    { address: '', amount: '' },
  ])
  const [step, setStep] = useState<Step>('setup')
  const [resultTx, setResultTx] = useState<string | null>(null)
  const [equalAmount, setEqualAmount] = useState('')
  const [useEqualAmounts, setUseEqualAmounts] = useState(false)

  // ── Read token info ────────────────────────────────────────────────────────
  const isValidToken = isAddress(tokenAddress)

  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
    query: { enabled: isValidToken },
  })

  const { data: tokenDecimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: { enabled: isValidToken },
  })

  const { data: tokenBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isValidToken && !!address },
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, AIRDROP_ADDRESS] : undefined,
    query: { enabled: isValidToken && !!address },
  })

  // ── Write contracts ────────────────────────────────────────────────────────
  const { writeContract: writeApprove, data: approveTx } = useWriteContract()
  const { writeContract: writeAirdrop, data: airdropTx } = useWriteContract()

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTx })
  const { isSuccess: airdropSuccess } = useWaitForTransactionReceipt({ hash: airdropTx })

  if (approveSuccess && step === 'approve') {
    setStep('send')
    refetchAllowance()
    toast.success('Approval confirmed! Ready to airdrop.')
  }

  if (airdropSuccess && airdropTx && step === 'send') {
    setStep('done')
    setResultTx(airdropTx)
    toast.success(`🎉 Airdrop complete!`)
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const decimals = tokenDecimals ? Number(tokenDecimals) : 18
  const balanceFormatted = tokenBalance
    ? (Number(tokenBalance) / 10 ** decimals).toLocaleString(undefined, { maximumFractionDigits: 4 })
    : '—'

  const validRecipients = recipients.filter(
    (r) => isAddress(r.address) && Number(r.amount) > 0
  )

  const totalAmount = validRecipients.reduce((acc, r) => acc + parseFloat(r.amount || '0'), 0)
  const needsApproval = allowance !== undefined && allowance < parseUnits(totalAmount.toString(), decimals)

  // ── Recipient helpers ──────────────────────────────────────────────────────
  const addRow = () => setRecipients((prev) => [...prev, { address: '', amount: '' }])
  const removeRow = (i: number) => setRecipients((prev) => prev.filter((_, idx) => idx !== i))
  const updateRow = (i: number, field: keyof Recipient, value: string) =>
    setRecipients((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))

  const applyEqualAmounts = () => {
    if (!equalAmount) return
    setRecipients((prev) => prev.map((r) => ({ ...r, amount: equalAmount })))
  }

  const handleCSV = useCallback((text: string) => {
    const lines = text.trim().split('\n')
    const parsed: Recipient[] = lines
      .map((l) => l.split(/[,\t]/).map((s) => s.trim()))
      .filter((parts) => parts.length >= 2 && isAddress(parts[0]) && Number(parts[1]) > 0)
      .map(([addr, amt]) => ({ address: addr, amount: amt }))

    if (parsed.length === 0) { toast.error('No valid rows found. Format: address,amount'); return }
    setRecipients(parsed)
    toast.success(`Loaded ${parsed.length} recipients from CSV`)
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => handleCSV(ev.target?.result as string)
    reader.readAsText(file)
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleApprove = () => {
    if (!isValidToken) return
    const totalRaw = parseUnits(totalAmount.toString(), decimals)
    writeApprove({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [AIRDROP_ADDRESS, totalRaw],
    })
    setStep('approve')
    toast.loading('Approving token spend...')
  }

  const handleAirdrop = () => {
    if (!isValidToken || validRecipients.length === 0) return
    const addrs = validRecipients.map((r) => r.address as `0x${string}`)
    const amts = validRecipients.map((r) => parseUnits(r.amount, decimals))

    writeAirdrop({
      address: AIRDROP_ADDRESS,
      abi: AIRDROP_ABI,
      functionName: 'airdropToken',
      args: [tokenAddress as `0x${string}`, addrs, amts],
      value: BigInt('3000000000000000'), // 0.003 ETH service fee
    })
    setStep('send')
    toast.loading('Sending airdrop...')
  }

  const resetAll = () => {
    setTokenAddress(''); setRecipients([{ address: '', amount: '' }, { address: '', amount: '' }])
    setStep('setup'); setResultTx(null); setEqualAmount(''); setUseEqualAmounts(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="py-16 px-4" style={{ minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto">
        <BrowserBanner />
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 gradient-text">🪂 Batch Airdrop</h1>
          <p className="text-slate-400 text-lg">
            Send tokens to hundreds of wallets in one transaction
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {[
              { icon: '⚡', text: 'One transaction' },
              { icon: '💸', text: `~$10 fee (${AIRDROP_FEE_ETH} ETH)` },
              { icon: '📋', text: 'CSV import' },
              { icon: '🔢', text: 'Up to 500 wallets' },
            ].map((f) => (
              <span key={f.text} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                {f.icon} {f.text}
              </span>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'done' && resultTx ? (
            /* Success */
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass p-8 rounded-2xl text-center space-y-6"
            >
              <div style={{ fontSize: '4rem' }}>🎉</div>
              <h2 className="text-3xl font-bold gradient-text">Airdrop Complete!</h2>
              <p className="text-slate-400">
                Successfully sent to <strong className="text-white">{validRecipients.length} addresses</strong>
              </p>
              <a
                href={`${EXPLORER_URL}/tx/${resultTx}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 transition text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View on Abscan
              </a>
              <button onClick={resetAll} className="btn-gradient">
                Send Another Airdrop
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

              {/* Step 1: Token */}
              <div className="glass p-6 rounded-2xl">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span style={{ background: 'linear-gradient(to right,#9333ea,#3b82f6)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>1</span>
                  Token to Airdrop
                </h2>

                <input
                  type="text"
                  placeholder="Token contract address (0x...)"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value.trim())}
                  disabled={step !== 'setup'}
                />

                {isValidToken && tokenSymbol && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '0.75rem', display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}
                  >
                    <span style={{ color: '#34d399' }}>✓ {String(tokenSymbol)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Balance: {balanceFormatted} {String(tokenSymbol)}</span>
                  </motion.div>
                )}
              </div>

              {/* Step 2: Recipients */}
              <div className="glass p-6 rounded-2xl">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span style={{ background: 'linear-gradient(to right,#9333ea,#3b82f6)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>2</span>
                    Recipients
                  </h2>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {/* CSV upload */}
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', padding: '0.35rem 0.75rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem' }}>
                      <Upload className="w-3.5 h-3.5" />
                      CSV
                      <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                    <button
                      onClick={addRow}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', padding: '0.35rem 0.75rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', cursor: 'pointer', background: 'none' }}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add row
                    </button>
                  </div>
                </div>

                {/* Equal amounts toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="equal"
                    checked={useEqualAmounts}
                    onChange={(e) => setUseEqualAmounts(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="equal" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                    Equal amounts for all
                  </label>
                  {useEqualAmounts && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                      <input
                        type="number"
                        placeholder="Amount each"
                        value={equalAmount}
                        onChange={(e) => setEqualAmount(e.target.value)}
                        style={{ width: 120, padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                      />
                      <button
                        onClick={applyEqualAmounts}
                        style={{ padding: '0.3rem 0.75rem', background: 'rgba(147,51,234,0.3)', border: '1px solid rgba(147,51,234,0.5)', borderRadius: '0.4rem', color: '#c084fc', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 120px auto', gap: '0.5rem', marginBottom: '0.5rem', padding: '0 0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Wallet Address</span>
                  <span />
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Amount {tokenSymbol ? `(${String(tokenSymbol)})` : ''}</span>
                  <span />
                </div>

                {/* Recipient rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 360, overflowY: 'auto' }}>
                  {recipients.map((r, i) => {
                    const addrValid = r.address === '' || isAddress(r.address)
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto 120px auto', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder={`0x... (recipient ${i + 1})`}
                          value={r.address}
                          onChange={(e) => updateRow(i, 'address', e.target.value.trim())}
                          disabled={step !== 'setup'}
                          style={{ borderColor: addrValid ? undefined : '#ef4444', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                        />
                        <span />
                        <input
                          type="number"
                          placeholder="0"
                          value={r.amount}
                          onChange={(e) => updateRow(i, 'amount', e.target.value)}
                          disabled={step !== 'setup'}
                          style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                        />
                        <button
                          onClick={() => removeRow(i)}
                          disabled={recipients.length <= 1 || step !== 'setup'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '0.25rem' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Summary */}
                {validRecipients.length > 0 && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#34d399' }}>✓ {validRecipients.length} valid recipients</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Total: {totalAmount.toLocaleString()} {tokenSymbol ? String(tokenSymbol) : 'tokens'}
                    </span>
                  </div>
                )}
              </div>

              {/* Step 3: Review & Send */}
              <div className="glass p-6 rounded-2xl">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span style={{ background: 'linear-gradient(to right,#9333ea,#3b82f6)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>3</span>
                  Review & Send
                </h2>

                {/* Fee breakdown */}
                <div style={{ background: 'rgba(147,51,234,0.08)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Service fee</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{AIRDROP_FEE_ETH} ETH (~$10)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Recipients</span>
                    <span style={{ color: '#fff' }}>{validRecipients.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Total tokens</span>
                    <span style={{ color: '#fff' }}>{totalAmount.toLocaleString()} {tokenSymbol ? String(tokenSymbol) : ''}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.6rem' }}>
                    ✓ You must approve token spending before the airdrop is sent
                  </p>
                </div>

                {/* Action buttons */}
                {!isConnected ? (
                  <button onClick={() => login()} className="btn-gradient w-full">
                    Connect Abstract Wallet
                  </button>
                ) : step === 'approve' ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ marginRight: '0.5rem' }}>⏳</span>
                    Waiting for approval confirmation...
                  </div>
                ) : step === 'send' ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ marginRight: '0.5rem' }}>🚀</span>
                    Sending airdrop...
                  </div>
                ) : needsApproval ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      onClick={handleApprove}
                      disabled={!isValidToken || validRecipients.length === 0}
                      className="btn-gradient w-full"
                    >
                      Step 1: Approve Token Spend
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                      Then: Step 2 will appear to confirm the airdrop
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleAirdrop}
                    disabled={!isValidToken || validRecipients.length === 0}
                    className="btn-gradient w-full"
                    style={{ fontSize: '1.05rem' }}
                  >
                    🪂 Send Airdrop to {validRecipients.length} Wallets
                  </button>
                )}

                {isConnected && (
                  <button
                    onClick={() => logout()}
                    style={{ width: '100%', textAlign: 'center', marginTop: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}
                  >
                    {address?.slice(0, 6)}...{address?.slice(-4)} (disconnect)
                  </button>
                )}
              </div>

              {/* CSV format hint */}
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
                <strong style={{ color: 'rgba(255,255,255,0.5)' }}>CSV format:</strong> One per line —&nbsp;
                <code style={{ fontFamily: 'monospace', color: '#c084fc' }}>0xAddress,amount</code>
                &nbsp;&nbsp;Example: <code style={{ fontFamily: 'monospace', color: '#c084fc' }}>0xABC...,1000</code>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
