import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CoinForge — Launch Tokens on Abstract',
  description: 'Create your own ERC20 token on Abstract in 60 seconds. No code. No hassle. Batch airdrop to hundreds of wallets.',
  metadataBase: new URL('https://coin-forge-six.vercel.app'),
  openGraph: {
    title: 'CoinForge — Launch Tokens on Abstract',
    description: 'Create your own ERC20 token in 60 seconds. Batch airdrop to hundreds of wallets. Built on Abstract.',
    url: 'https://coin-forge-six.vercel.app',
    siteName: 'CoinForge',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'CoinForge — Token Launchpad on Abstract',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoinForge — Launch Tokens on Abstract',
    description: 'Create your own ERC20 token in 60 seconds. Batch airdrop to hundreds of wallets.',
    site: '@tokencreater',
    creator: '@tokencreater',
    images: ['/og'],
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔨</text></svg>',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
