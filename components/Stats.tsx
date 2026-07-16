'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useReadContract } from 'wagmi'
import { TOKEN_FACTORY_ABI } from '@/lib/abi'
import { FACTORY_ADDRESS } from '@/lib/config'

export function Stats() {
  const [mounted, setMounted] = useState(false)

  const { data: tokenCount } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: TOKEN_FACTORY_ABI,
    functionName: 'getTokenCount',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const count = tokenCount ? Number(tokenCount) : 0

  return (
    <section className="py-16 px-4 border-y border-slate-800">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
      >
        {[
          { label: 'Tokens Launched', value: mounted ? count : 0, icon: '🚀' },
          { label: 'Creation Fee', value: '$5', icon: '💵' },
          { label: 'Treasury Share', value: '0.1%', icon: '💎' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <span className="text-4xl block mb-2">{stat.icon}</span>
            <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
            <p className="text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
