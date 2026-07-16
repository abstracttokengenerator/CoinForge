'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-slate-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
        >
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-2">
              <span className="gradient-text">🔨 CoinForge</span>
            </h3>
            <p className="text-sm text-slate-400">
              Token launchpad for Abstract
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://docs.abs.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  Abstract Docs
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://abscan.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  Abscan Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h4 className="font-semibold mb-4">Learn</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://docs.abs.xyz/build-on-abstract/smart-contracts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  Smart Contracts
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.abs.xyz/abstract-global-wallet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  AGW
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Follow</h4>
            <div className="flex gap-4">
              <a
                href="https://x.com/tokencreater"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition text-sm flex items-center gap-1"
              >
                𝕏 @tokencreater
              </a>
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-slate-800 py-8">
          <p className="text-center text-sm text-slate-500">
            Built on <span className="text-purple-400">Abstract</span> • Powered by <span className="gradient-text">CoinForge</span>
          </p>
          <p className="text-center text-xs text-slate-600 mt-2">
            © 2026 CoinForge. All tokens created are immutable on-chain. Always DYOR.
          </p>
        </div>
      </div>
    </footer>
  )
}
