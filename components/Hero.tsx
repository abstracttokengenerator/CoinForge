'use client'

import { motion } from 'framer-motion'
import { Zap, ArrowDown } from 'lucide-react'

export function Hero() {
  const scrollToForm = () => {
    const element = document.getElementById('launch-form')
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-20">
      {/* Animated title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl"
      >
        <h1 className="text-5xl md:text-7xl font-black mb-6 gradient-text leading-tight">
          Launch Your Token on Abstract
        </h1>

        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Create your own ERC20 token in 60 seconds. No code. No hassle. Just pure Abstract.
        </p>

        {/* CTA Button */}
        <motion.button
          onClick={scrollToForm}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-gradient inline-flex items-center gap-2 mb-12 text-lg"
        >
          <Zap className="w-5 h-5" />
          Launch Your Token
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </motion.button>

        {/* Animated feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
          {[
            { icon: '⚡', text: '60 Seconds' },
            { icon: '💎', text: 'ERC20 Standard' },
            { icon: '🔒', text: 'Secure Deploy' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass p-4 rounded-lg"
            >
              <span className="text-2xl block mb-2">{feature.icon}</span>
              <p className="text-sm text-slate-300">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ArrowDown className="w-6 h-6 text-purple-400" />
      </motion.div>
    </section>
  )
}
