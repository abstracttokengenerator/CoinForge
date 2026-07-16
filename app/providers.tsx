'use client'

import { AbstractWalletProvider } from '@abstract-foundation/agw-react'
import { http } from 'viem'
import { Toaster } from 'react-hot-toast'
import { abstractMainnet } from '@/lib/config'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AbstractWalletProvider
      chain={abstractMainnet}
      transport={http('https://api.mainnet.abs.xyz')}
    >
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a24',
            color: '#fff',
            border: '1px solid rgba(147,51,234,0.3)',
          },
        }}
      />
    </AbstractWalletProvider>
  )
}
