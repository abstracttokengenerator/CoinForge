import { NextResponse } from 'next/server'

const ABSCAN_KEY = process.env.ETHERSCAN_API_KEY ?? ''
const FACTORY = '0xE1fb876579288A0d4C50BC1A4eD8ffF03Ce42A80'
const CHAIN_ID = 2741

// Known token contract addresses on Abstract mainnet (well-known ecosystem tokens)
// We supplement with factory-launched tokens
const KNOWN_TOKENS = [
  { contractAddress: '0x48b62137edFa8c6A3ca5e46A26DFD67cAE58bD23', tokenName: 'Pengu', tokenSymbol: 'PENGU', timeStamp: '1700000000', fromCoinForge: false },
  { contractAddress: '0x4C68E4102c0F120cce9F08625bd12079806b7C4D', tokenName: 'ABX Token', tokenSymbol: 'ABX', timeStamp: '1700000010', fromCoinForge: false },
]

async function fetchFactoryTokens() {
  // Get token transfers FROM our factory (these are newly minted coins)
  const url = `https://api.etherscan.io/v2/api?chainid=${CHAIN_ID}&module=account&action=tokentx&address=${FACTORY}&page=1&offset=50&sort=desc&apikey=${ABSCAN_KEY}`
  
  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    const data = await res.json()
    if (data.status !== '1') return []
    
    // Deduplicate by contractAddress, keep newest
    const seen = new Set<string>()
    return data.result
      .filter((tx: any) => {
        if (seen.has(tx.contractAddress)) return false
        seen.add(tx.contractAddress)
        return tx.from === '0x0000000000000000000000000000000000000000' || tx.to !== FACTORY.toLowerCase()
      })
      .map((tx: any) => ({
        contractAddress: tx.contractAddress,
        tokenName: tx.tokenName,
        tokenSymbol: tx.tokenSymbol,
        timeStamp: tx.timeStamp,
        fromCoinForge: true,
        txHash: tx.hash,
      }))
  } catch {
    return []
  }
}


export async function GET() {
  const [factoryTokens] = await Promise.all([
    fetchFactoryTokens(),
  ])

  // Merge: factory tokens first, then known ecosystem tokens
  const allTokens = [
    ...factoryTokens,
    ...KNOWN_TOKENS.filter(k => !factoryTokens.find((f: any) => f.contractAddress.toLowerCase() === k.contractAddress.toLowerCase())),
  ]

  // Sort by timestamp descending (newest first)
  allTokens.sort((a: any, b: any) => Number(b.timeStamp) - Number(a.timeStamp))

  return NextResponse.json({
    tokens: allTokens.slice(0, 30),
    updatedAt: Date.now(),
  })
}
