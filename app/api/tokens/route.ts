import { NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { abstract } from 'viem/chains'

const FACTORY = '0x0cCCB162210beEda64b62e323885282Ab437bE81' as `0x${string}`

const FACTORY_ABI = [
  { name: 'getTokenCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  {
    name: 'getTokens', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'offset', type: 'uint256' }, { name: 'limit', type: 'uint256' }],
    outputs: [{ type: 'tuple[]', components: [
      { name: 'tokenAddress', type: 'address' }, { name: 'creator', type: 'address' },
      { name: 'name', type: 'string' }, { name: 'symbol', type: 'string' },
      { name: 'totalSupply', type: 'uint256' }, { name: 'description', type: 'string' },
      { name: 'website', type: 'string' }, { name: 'imageUrl', type: 'string' }, { name: 'createdAt', type: 'uint256' },
    ]}],
  },
] as const

// All known Abstract ecosystem tokens to query from DexScreener
const ABSTRACT_TOKEN_SYMBOLS = [
  'PENGU', 'NOOT', 'KONA', 'RETSBA', 'ABSTER', 'ABX', 'PANDA',
  'ABSTRACT', 'ABS', 'MEME', 'WOJAK', 'PEPE', 'DOGE', 'SHIB',
]

async function getCoinForgeTokens() {
  try {
    const client = createPublicClient({ chain: abstract, transport: http('https://api.mainnet.abs.xyz') })
    const count = await client.readContract({ address: FACTORY, abi: FACTORY_ABI, functionName: 'getTokenCount' })
    if (!count || count === 0n) return []
    const tokens = await client.readContract({
      address: FACTORY, abi: FACTORY_ABI, functionName: 'getTokens',
      args: [0n, count > 100n ? 100n : count],
    }) as any[]
    return tokens.map((t: any) => ({
      contractAddress: t.tokenAddress as string,
      tokenName: t.name as string,
      tokenSymbol: t.symbol as string,
      timeStamp: t.createdAt.toString(),
      fromCoinForge: true,
      description: t.description as string,
      priceUsd: null, priceChange24h: null, volume24h: null,
      liquidity: null, imageUrl: (t.imageUrl as string) || null, dexUrl: null,
    }))
  } catch (e) {
    console.error('Factory read error:', e)
    return []
  }
}

async function getDexScreenerTokens(): Promise<any[]> {
  try {
    // Search for all known Abstract tokens
    const queries = ['abstract chain tokens', 'noot abstract', 'pengu abstract', 'kona abstract', 'retsba', 'abster abstract']
    
    const results = await Promise.all(
      queries.map(q =>
        fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`, {
          next: { revalidate: 120 },
          headers: { 'Accept': 'application/json' },
        })
          .then(r => r.json())
          .catch(() => ({ pairs: [] }))
      )
    )

    const seen = new Set<string>()
    const tokens: any[] = []

    for (const result of results) {
      const pairs = result.pairs ?? []
      for (const pair of pairs) {
        if (pair.chainId !== 'abstract') continue
        const addr = pair.baseToken?.address?.toLowerCase()
        if (!addr || seen.has(addr)) continue
        seen.add(addr)
        tokens.push({
          contractAddress: pair.baseToken.address,
          tokenName: pair.baseToken.name,
          tokenSymbol: pair.baseToken.symbol,
          timeStamp: pair.pairCreatedAt ? String(Math.floor(pair.pairCreatedAt / 1000)) : '0',
          fromCoinForge: false,
          priceUsd: pair.priceUsd ? parseFloat(pair.priceUsd) : null,
          priceChange24h: pair.priceChange?.h24 ?? null,
          volume24h: pair.volume?.h24 ?? null,
          liquidity: pair.liquidity?.usd ?? null,
          marketCap: pair.marketCap ?? pair.fdv ?? null,
          imageUrl: pair.info?.imageUrl ?? null,
          dexUrl: pair.url ?? null,
        })
      }
    }

    // Also batch-fetch by known symbols
    const batchResults = await Promise.all(
      ABSTRACT_TOKEN_SYMBOLS.map(sym =>
        fetch(`https://api.dexscreener.com/latest/dex/search?q=${sym}`, {
          next: { revalidate: 120 },
        })
          .then(r => r.json())
          .catch(() => ({ pairs: [] }))
      )
    )

    for (const result of batchResults) {
      const pairs = result.pairs ?? []
      for (const pair of pairs) {
        if (pair.chainId !== 'abstract') continue
        const addr = pair.baseToken?.address?.toLowerCase()
        if (!addr || seen.has(addr)) continue
        seen.add(addr)
        tokens.push({
          contractAddress: pair.baseToken.address,
          tokenName: pair.baseToken.name,
          tokenSymbol: pair.baseToken.symbol,
          timeStamp: pair.pairCreatedAt ? String(Math.floor(pair.pairCreatedAt / 1000)) : '0',
          fromCoinForge: false,
          priceUsd: pair.priceUsd ? parseFloat(pair.priceUsd) : null,
          priceChange24h: pair.priceChange?.h24 ?? null,
          volume24h: pair.volume?.h24 ?? null,
          liquidity: pair.liquidity?.usd ?? null,
          marketCap: pair.marketCap ?? pair.fdv ?? null,
          imageUrl: pair.info?.imageUrl ?? null,
          dexUrl: pair.url ?? null,
        })
      }
    }

    return tokens
  } catch (e) {
    console.error('DexScreener error:', e)
    return []
  }
}

export async function GET() {
  const [coinforgeTokens, dexTokens] = await Promise.all([
    getCoinForgeTokens(),
    getDexScreenerTokens(),
  ])

  // Merge: don't duplicate CoinForge tokens that might also be on DexScreener
  const cfAddrs = new Set(coinforgeTokens.map((t: any) => t.contractAddress.toLowerCase()))
  const filteredDex = dexTokens.filter((t: any) => !cfAddrs.has(t.contractAddress.toLowerCase()))

  // Enrich CoinForge tokens with DexScreener price data if available
  const enrichedCF = coinforgeTokens.map((t: any) => {
    const dex = dexTokens.find((d: any) => d.contractAddress.toLowerCase() === t.contractAddress.toLowerCase())
    return dex ? { ...t, ...dex, fromCoinForge: true } : t
  })

  const all = [...enrichedCF, ...filteredDex]
  all.sort((a: any, b: any) => Number(b.timeStamp) - Number(a.timeStamp))

  return NextResponse.json({ tokens: all.slice(0, 60), updatedAt: Date.now() })
}
