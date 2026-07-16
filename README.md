# 🔨 CoinForge — Token Launchpad for Abstract

The easiest way to launch ERC20 tokens on Abstract blockchain. No code. No hassle. Just pure Abstract.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd coinforge-ui
npm install
```

### Environment

Create `.env.local`:
```env
NEXT_PUBLIC_FACTORY_ADDRESS=0xE1fb876579288A0d4C50BC1A4eD8ffF03Ce42A80
NEXT_PUBLIC_CHAIN_ID=2741
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Features

✨ **60 Second Token Launch**
- Connect Abstract Global Wallet
- Fill in token details
- Pay ~$5 in ETH
- Deployed instantly

💎 **Fair Revenue Model**
- 0.0015 ETH creation fee per token
- 0.1% of supply goes to CoinForge treasury (Atlas wallet)
- No hidden fees

🔒 **Secure & Transparent**
- Pure ERC20 standard contracts
- No owner backdoors
- Immutable on-chain
- Full source code available

🚀 **Social Features**
- Live token feed
- Share to Twitter
- Explorer links
- Community leaderboard

## Architecture

### Smart Contracts

Located in `../launchpad/contracts/`:

1. **`LaunchpadToken.sol`** — ERC20 token template
   - Mints 0.1% to treasury, 99.9% to creator
   - No admin controls

2. **`TokenFactory.sol`** — Launchpad engine
   - Deploys new tokens
   - Collects fees
   - Tracks all launches

Deployed on Abstract Mainnet (Chain 2741)

### Frontend

Built with:
- **Next.js 14** — React framework
- **Tailwind CSS** — Styling
- **Wagmi + Viem** — Contract interactions
- **Framer Motion** — Animations
- **Abstract AGW** — Wallet integration

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Self-hosted

```bash
npm run build
npm start
```

## Key Components

### Hero
Eye-catching landing section with call-to-action

### Stats
Live token count and fee display

### HowItWorks
3-step process guide

### LaunchForm
Main token creation form with:
- Name, symbol, supply inputs
- Optional description & website
- Wallet connection
- Form validation
- Success state with confetti

### RecentTokens
Live feed of recently launched tokens

### Footer
Links and branding

## Testing

1. Connect your Abstract Global Wallet
2. Fill in token details:
   - Name: `Test Coin`
   - Symbol: `TEST`
   - Supply: `1000000`
3. Click "Launch Token"
4. Approve the transaction (0.0015 ETH)
5. Wait for confirmation
6. See your token on Abscan!

## Config

Key configuration in `lib/config.ts`:

```typescript
export const FACTORY_ADDRESS = '0xE1fb876579288A0d4C50BC1A4eD8ffF03Ce42A80'
export const CREATION_FEE = BigInt('1500000000000000') // 0.0015 ETH
export const ABSTRACT_CHAIN_ID = 2741
```

## Troubleshooting

### Wallet not connecting
- Ensure Abstract Global Wallet is installed
- Check that you're on Abstract mainnet (chain 2741)
- Try refreshing the page

### Transaction failing
- Check your ETH balance (need 0.0015 ETH minimum)
- Ensure you have enough gas
- Verify token symbol is unique

### UI looks broken
- Clear browser cache
- Try a different browser
- Check that JavaScript is enabled

## Contributing

Bug reports and feature requests welcome! Open an issue or submit a PR.

## License

MIT

## Resources

- [Abstract Docs](https://docs.abs.xyz)
- [Abstract Global Wallet](https://docs.abs.xyz/abstract-global-wallet)
- [Abscan Explorer](https://abscan.org)
- [Smart Contract Guide](https://docs.abs.xyz/build-on-abstract/smart-contracts)

---

**Built with ❤️ on Abstract**

Questions? Visit the [Abstract Discord](https://discord.gg/abstract)
