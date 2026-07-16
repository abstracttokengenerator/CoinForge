import { defineChain } from 'viem'

// Abstract mainnet chain definition for viem/wagmi
export const abstractMainnet = defineChain({
  id: 2741,
  name: 'Abstract',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.mainnet.abs.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Abscan', url: 'https://abscan.org' },
  },
})

export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ?? '0xE1fb876579288A0d4C50BC1A4eD8ffF03Ce42A80') as `0x${string}`
export const AIRDROP_ADDRESS = (process.env.NEXT_PUBLIC_AIRDROP_ADDRESS ?? '0x356f7c46099Beb9c0a0eeD6905f78b7081B37148') as `0x${string}`
export const ABSTRACT_CHAIN_ID = 2741
export const CREATION_FEE = BigInt('1500000000000000') // 0.0015 ETH
export const CREATION_FEE_ETH = '0.0015'
export const AIRDROP_FEE = BigInt('3000000000000000') // 0.003 ETH (~$10)
export const AIRDROP_FEE_ETH = '0.003'
export const EXPLORER_URL = 'https://abscan.org'
