import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { abstract } from 'viem/chains'

const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY ?? ''
const FACTORY = '0xE1fb876579288A0d4C50BC1A4eD8ffF03Ce42A80' as `0x${string}`
const CHAIN_ID = 2741

const FACTORY_ABI = [
  {
    name: 'getTokenCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getTokens',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'offset', type: 'uint256' },
      { name: 'limit',  type: 'uint256' },
    ],
    outputs: [{
      type: 'tuple[]',
      components: [
        { name: 'tokenAddress', type: 'address' },
        { name: 'creator',      type: 'address' },
        { name: 'name',         type: 'string'  },
        { name: 'symbol',       type: 'string'  },
        { name: 'totalSupply',  type: 'uint256' },
        { name: 'description',  type: 'string'  },
        { name: 'website',      type: 'string'  },
        { name: 'createdAt',    type: 'uint256' },
      ],
    }],
  },
] as const

// Curated well-known Abstract ecosystem tokens
const ECOSYSTEM_TOKENS = [
  { contractAddress: '0x48b62137edFa8c6A3ca5e46A26DFD67cAE58bD23', tokenName: 'Pengu',    tokenSymbol: 'PENGU', timeStamp: '1700000000', fromCoinForge: false },
  { contractAddress: '0x4C68E4102c0F120cce9F08625bd12079806b7C4D', tokenName: 'ABX Token', tokenSymbol: 'ABX',   timeStamp: '1700000010', fromCoinForge: false },
]

async function getCoinForgeTokens() {
  try {
    const client = createPublicClient({ chain: abstract, transport: http('https://api.mainnet.abs.xyz') })

    const count = await client.readContract({ address: FACTORY, abi: FACTORY_ABI, functionName: 'getTokenCount' })
    if (!count || count === 0n) return []

    const tokens = await client.readContract({
      address: FACTORY,
      abi: FACTORY_ABI,
      functionName: 'getTokens',
      args: [0n, count > 50n ? 50n : count],
    }) as any[]

    return tokens.map((t: any) => ({
      contractAddress: t.tokenAddress as string,
      tokenName:       t.name as string,
      tokenSymbol:     t.symbol as string,
      timeStamp:       t.createdAt.toString(),
      fromCoinForge:   true,
      description:     t.description as string,
    }))
  } catch (e) {
    console.error('Factory read error:', e)
    return []
  }
}

async function getRecentAbstractTokens(excludeAddresses: string[]) {
  // Query Etherscan for recent ERC20 token transfers on Abstract
  // Use a well-known active address to get recent token activity
  try {
    const url = `https://api.etherscan.io/v2/api?chainid=${CHAIN_ID}&module=account&action=tokentx&address=${FACTORY}&page=1&offset=50&sort=desc&apikey=${ETHERSCAN_KEY}`
    const res = await fetch(url, { next: { revalidate: 120 } })
    const data = await res.json()
    if (data.status !== '1' || !Array.isArray(data.result)) return []

    const seen = new Set(excludeAddresses.map(a => a.toLowerCase()))
    const tokens: any[] = []

    for (const tx of data.result) {
      const addr = tx.contractAddress?.toLowerCase()
      if (!addr || seen.has(addr) || addr === '0x000000000000000000000000000000000000800a') continue
      if (!tx.tokenName || !tx.tokenSymbol) continue
      seen.add(addr)
      tokens.push({
        contractAddress: tx.contractAddress,
        tokenName:       tx.tokenName,
        tokenSymbol:     tx.tokenSymbol,
        timeStamp:       tx.timeStamp,
        fromCoinForge:   false,
        txHash:          tx.hash,
      })
    }
    return tokens
  } catch {
    return []
  }
}

export async function GET() {
  // 1. Get CoinForge tokens directly from smart contract (always accurate)
  const coinforgeTokens = await getCoinForgeTokens()

  // 2. Get broader Abstract tokens from Etherscan
  const excludeAddrs = coinforgeTokens.map((t: any) => t.contractAddress)
  const abstractTokens = await getRecentAbstractTokens(excludeAddrs)

  // 3. Merge: ecosystem tokens fill in anything else
  const allKnown = new Set([...coinforgeTokens, ...abstractTokens].map((t: any) => t.contractAddress.toLowerCase()))
  const ecosystem = ECOSYSTEM_TOKENS.filter(t => !allKnown.has(t.contractAddress.toLowerCase()))

  const all = [...coinforgeTokens, ...abstractTokens, ...ecosystem]

  // Sort newest first
  all.sort((a: any, b: any) => Number(b.timeStamp) - Number(a.timeStamp))

  return NextResponse.json({ tokens: all.slice(0, 50), updatedAt: Date.now() })
}
