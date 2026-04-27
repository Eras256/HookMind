---
name: HookMind Project Overview
description: Core facts about the HookMind project — stack, deployment, contracts, and integration status
type: project
---

HookMind is a Uniswap v4 hooks protocol with AI agents that manage liquidity/fee parameters dynamically. Deployed on Unichain Sepolia (chainId 1301) and planned for Unichain mainnet (chainId 130).

**Stack:** Next.js 15 (App Router), wagmi v2, viem v2, RainbowKit, TypeScript, pnpm monorepo

**Deployed contracts (Unichain Sepolia):**
- HookMindCore: 0xf9e8768686d0138ee041898a906ddd78519955c8
- AgentRegistry: 0xb3411c3e83bf0e79a00821206fb89ff8130c5f4e
- YieldVault: 0xa0242258bc39d2b2daaf4913f30803f77b01a79b
- ILInsurance: 0x42aa32c49e993936d23a3cc746173c6954a07eef
- USDC (testnet): 0x86dd85969a254258383ef3dff357671cb5161f88

**Why:** Uniswap Trading API supports Unichain mainnet (130) but NOT Unichain Sepolia (1301). Any swap quote UI will show a "testnet" warning on chain 1301.

**Uniswap integration (implemented 2026-04-25):**
- `apps/web/app/api/uniswap/route.ts` — server-side proxy for Trading API (injects `UNISWAP_API_KEY` from env, avoids CORS)
- `apps/web/hooks/useUniswapQuote.ts` — React hook for getting quotes (handles CLASSIC vs UniswapX response shapes)
- `apps/web/components/ui/SwapQuotePanel.tsx` — UI component, ready to drop into any page

**How to use SwapQuotePanel:**
```tsx
<SwapQuotePanel
  tokenIn={{ address: '0x...', symbol: 'ETH', decimals: 18 }}
  tokenOut={{ address: '0x...', symbol: 'USDC', decimals: 6 }}
/>
```

**API route pattern:** `POST /api/uniswap?endpoint=quote|check_approval|swap`

**How to apply:** When adding swap or quote functionality, use these existing files. Don't recreate them.

**Agent Signal Feed (implemented 2026-04-25):**
- `apps/web/hooks/useAgentSignals.ts` — fetches `AgentSignalProcessed` events via `getLogs` (24h lookback, auto-refresh 12s)
- `apps/web/components/ui/AgentSignalFeed.tsx` — live feed UI showing fee/volatility/IL status per agent signal

**Demo day priority:** Lead with IL Insurance (unique differentiator) + Agent Signal Feed (proves AI is working live). The swap quote (Trading API) only works on mainnet; testnet shows warning gracefully.

**Strategic context (UHI8 loss post-mortem):** VolVantage won the same theme (dynamic fees + LP protection). HookMind's real differentiator is the IL Insurance auto-enrollment mechanism — none of the winners had it. For pitches: lead with IL Insurance, then show Agent Signal Feed live.
