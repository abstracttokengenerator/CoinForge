'use client'

import { motion } from 'framer-motion'
import { Link2, PenTool, Zap } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      icon: Link2,
      title: 'Connect Wallet',
      description: 'Link your Abstract Global Wallet in one click',
    },
    {
      icon: PenTool,
      title: 'Fill Token Details',
      description: 'Enter name, symbol, supply, and optional metadata',
    },
    {
      icon: Zap,
      title: 'Launch & Deploy',
      description: 'Pay $5 fee and your token deploys instantly',
    },
  ]

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text"
        >
          How It Works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-20 left-[16.666%] right-[16.666%] h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="relative"
              >
                {/* Number circle */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold relative z-10">
                    {i + 1}
                  </div>
                </div>

                {/* Card */}
                <div className="glass p-6 rounded-xl text-center">
                  <Icon className="w-8 h-8 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
