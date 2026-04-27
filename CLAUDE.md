---
name: HookMind Project Overview
description: Complete project reference — architecture, contracts, frontend, agent, integrations, and demo day strategy
type: project
---

## Identity

HookMind is an AI-powered liquidity protection protocol for Uniswap v4 on Unichain. It combines off-chain AI agents (dynamic fee management) with on-chain smart contracts (impermanent loss insurance). Part of the **Uniswap Foundation Acceleration Season** (2026 cohort, Demo Day: May 28, 2026).

## Monorepo Structure

```
HookMind/
├── apps/web/              # Next.js 15 frontend (App Router)
├── packages/agent/        # AI agent daemon (Node.js + tsx)
├── packages/contracts/    # Foundry smart contracts (Solidity 0.8.26)
├── packages/mcp/          # MCP tools integration
├── .agents/skills/        # Uniswap AI skill (swap-integration)
├── .env.local             # All secrets (shared across monorepo)
├── README.md              # Institutional pitch (cleaned April 2026)
├── WHITEPAPER.md           # Technical whitepaper
├── IMPACT_ANALYSIS.md      # Revenue projections + competitive analysis
├── TECHNICAL_PAPER.md      # Deep technical spec
├── TRANSPARENCY.md         # Compliance transparency doc
└── PROJECT_ANALYSIS.md     # Strategic analysis
```

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.26, Foundry, Uniswap v4, OpenZeppelin |
| Frontend | Next.js 15 (App Router), wagmi v2, viem v2, RainbowKit, Framer Motion, recharts |
| AI Agent | Node.js, tsx, multi-LLM (Claude, GPT-4o, Gemini, Grok), configurable via ACTIVE_LLM_PROVIDER |
| Data | IPFS/Pinata (PINATA_JWT), Unichain Sepolia RPC |
| API | Uniswap Trading API (UNISWAP_API_KEY), ECDSA signing |
| i18n | 3 languages: en.json, es.json, zh.json via LanguageContext |

## Deployed Contracts (Unichain Sepolia, chainId 1301)

**Current deployment (2026-04-27):**

| Contract | Address | Purpose |
|---|---|---|
| HookMindCore | `0x6C1D32018976A6dE59f1970Ac35BCACD17BbD5c8` | Uniswap v4 Hook — beforeSwap dynamic fees, afterAddLiquidity IL enrollment |
| AgentRegistry | `0x8d7a735Ab7682f7bcb4D50EA8114264058833df7` | ECDSA-based agent authorization |
| YieldVault | `0x192653B71407735798Dde43a7A669C145da5B8F1` | Protocol fee collection (1% software toll) |
| ILInsurance | `0xD61c1a1806651661ac0a00824b829c1F50D38F99` | USDC insurance pool, epoch-prorated payouts |
| PoolManager | `0x00B036B58a818B1BC34d502D3fE730Db729e62AC` | Uniswap v4 PoolManager on Unichain Sepolia |
| USDC (real) | `0x31d0220469e10c4E71834a79b1f276d740d3768F` | Real USDC on Unichain Sepolia (16.6M supply) |
| WETH | `0x4200000000000000000000000000000000000006` | Wrapped ETH on Unichain |
| Target Pool | `0x3faf657fade7f4f22456018f3529e083bd153065269e41cbd75d6dd9cbd48ca5` | USDC/WETH initialized at ~2000 USDC/WETH |

**Previous deployment (now stale, do NOT use):**
- HookMindCore: 0xf9e876... (old)
- AgentRegistry: 0xb3411c... (old)
- YieldVault: 0xa02422... (old)
- ILInsurance: 0x42aa32... (old)
- USDC (mock): 0x86dd85... (old)

**All current addresses live in:** `apps/web/lib/constants.ts`

## Smart Contract Architecture

**HookMindCore.sol** — the Uniswap v4 Hook:
- `beforeSwap()` → applies dynamic fee via LPFeeLibrary + optional BeforeSwapDelta spread
- `afterSwap()` → emits FeesRouteToVault, routes 1% toll to YieldVault
- `afterAddLiquidity()` → auto-enrolls LP in ILInsurance
- `afterRemoveLiquidity()` → triggers IL payout check
- `updateNeuralState()` → called by agent daemon, verifies ECDSA signature, updates fee
- Emits `AgentSignalProcessed(poolId, agent, newFeeBps, volatilityScore, ilProtectionActive, ipfsCid)`
- Uses EIP-1153 transient storage (TSTORE/TLOAD) for gas-efficient fee passing
- Guardrails: MIN_FEE (5 bps), MAX_FEE (500 bps), MIN_UPDATE_INTERVAL, nonce replay protection

**ILInsurance.sol:**
- `payPremium()` → LP pays 10 USDC, position marked as insured
- `processExit()` → calculates IL exposure on liquidity removal
- `claimInsurance()` → epoch-prorated USDC payout (7-day epochs)
- IL threshold: 2% (200 bps), max payout: 500 USDC per LP, max pool risk: 15% per epoch

**AgentRegistry.sol:**
- One-time activation fee: 0.00244 ETH (~$5)
- ECDSA key registration for agent authorization

## Frontend Pages

All pages use the `useLanguage()` hook for i18n (en/es/zh):

| Route | Component | Description |
|---|---|---|
| `/` | `app/page.tsx` | Landing page with hero, problems, features, how-it-works, tech stack, CTA + **AgentSignalFeed live** |
| `/dashboard` | `app/dashboard/page.tsx` | Protocol dashboard with metrics + **AgentSignalFeed** |
| `/agents` | `app/agents/page.tsx` | Operator console, metrics, assignments, leaderboard |
| `/leaderboard` | `app/leaderboard/page.tsx` | Operator rankings by decisions/accuracy |
| `/builder` | `app/builder/page.tsx` | Visual strategy builder (drag-and-drop nodes) |
| `/pools` | `app/pools/page.tsx` | Protected pools table with analytics charts |
| `/strategies` | `app/strategies/page.tsx` | Pre-built strategy marketplace |
| `/plugins` | `app/plugins/page.tsx` | Agent extension marketplace |
| `/skills` | `app/skills/page.tsx` | AI skills with stack panel |
| `/vault` | `app/vault/page.tsx` | LP Insurance & Activation gateway + **SwapQuotePanel** + **PoolIntelligenceFeed** |
| `/swap` | `app/swap/page.tsx` | Standalone swap page |
| `/docs` | `app/docs/page.tsx` | Protocol docs with 11 tabs |

## Key Frontend Components

| File | Purpose |
|---|---|
| `components/ui/AgentSignalFeed.tsx` | Live feed of `AgentSignalProcessed` events from blockchain |
| `components/ui/SwapQuotePanel.tsx` | Uniswap Trading API quote/swap widget |
| `components/ui/PoolIntelligenceFeed.tsx` | Real-time pool state display |
| `components/ui/InstitutionalCompliance.tsx` | Compliance status display |
| `components/ui/NodeSettingsModal.tsx` | Agent node settings modal |
| `components/ui/YieldActivityFeed.tsx` | Yield/revenue activity feed |
| `components/nav/Navbar.tsx` | Main navigation with i18n switcher |
| `components/nav/Footer.tsx` | Footer with i18n |

## Key Frontend Hooks

| File | Purpose |
|---|---|
| `hooks/useAgentSignals.ts` | Fetches `AgentSignalProcessed` events via `getLogs` (24h lookback, 12s refresh) |
| `hooks/useUniswapQuote.ts` | Gets quotes from Uniswap Trading API via `/api/uniswap` proxy |
| `hooks/usePoolIntelligenceFeed.ts` | Reads on-chain pool state in real time |
| `hooks/useHookMind.ts` | Core hook for contract interactions |

## API Routes

- `apps/web/app/api/uniswap/route.ts` — Server-side proxy for Uniswap Trading API (injects `UNISWAP_API_KEY`, avoids CORS). Supports `?endpoint=quote|check_approval|swap`.

## Agent Daemon

**Location:** `packages/agent/`
**Run:** `pnpm run dev:agent` (from monorepo root) or `cd packages/agent && npx tsx watch src/index.ts`

**Architecture:**
```
src/
├── index.ts         # Entry point — starts Express server + engine loop
├── engine.ts        # Main loop: read pool → compute volatility → query LLM → pin IPFS → submit tx
├── server.ts        # Express API server (REST endpoints for external integrations)
├── signer.ts        # ECDSA signing of agent signals
├── logger.ts        # Winston logger
├── providers/       # LLM providers (OpenAI, Anthropic, Gemini, Grok, mock)
├── ipfs/            # Pinata IPFS pinning
├── strategies/      # Fee calculation strategies
├── worker/          # Data processing workers (variance, TWAP)
├── ws/              # WebSocket server for real-time updates
└── mcp/             # MCP tools integration
```

**Engine loop (every AGENT_UPDATE_INTERVAL_MS):**
1. Read pool state & TWAP from Unichain
2. Compute volatility score (0–10,000) via PredictiveInventoryModel
3. Query LLM provider for fee recommendation
4. Pin audit log to IPFS (Pinata)
5. Sign signal with ECDSA (AGENT_PRIVATE_KEY)
6. Submit `updateNeuralState()` tx to HookMindCore on-chain

**Known issue:** Pinata IPFS pinning returns `Unauthorized` if PINATA_JWT is expired. Non-fatal — agent continues submitting on-chain txs without IPFS CID.

## Environment Variables (.env.local)

All in root `.env.local`, consumed by both `apps/web` and `packages/agent`:

| Key | Purpose |
|---|---|
| `UNICHAIN_SEPOLIA_RPC` | RPC endpoint (https://sepolia.unichain.org) |
| `DEPLOYER_PRIVATE_KEY` | Contract deployment key |
| `AGENT_PRIVATE_KEY` | Agent signing key for ECDSA signals |
| `AGENT_EOA_ADDRESS` | Agent's Ethereum address |
| `AGENT_UPDATE_INTERVAL_MS` | Loop interval (default: 20000ms) |
| `ACTIVE_LLM_PROVIDER` | Which LLM to use (openai/anthropic/gemini/grok/mock) |
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GROK_API_KEY` | xAI Grok API key |
| `PINATA_JWT` | Pinata IPFS JWT token |
| `PINATA_GATEWAY` | Pinata gateway URL |
| `UNISWAP_API_KEY` | Uniswap Trading API key |
| `TARGET_POOL_ID` | Pool ID for the agent to manage |
| `HOOK_MIND_CORE_ADDRESS` | Current HookMindCore contract address |
| `AGENT_REGISTRY_ADDRESS` | Current AgentRegistry address |
| `YIELD_VAULT_ADDRESS` | Current YieldVault address |
| `IL_INSURANCE_ADDRESS` | Current ILInsurance address |
| `USDC_UNICHAIN` | USDC address on Unichain Sepolia |

## Uniswap Trading API Integration

- **API Key:** stored as `UNISWAP_API_KEY` in `.env.local`
- **Supported chains:** chainId 1301 (Unichain Sepolia) IS supported (confirmed April 2026)
- **Proxy route:** `POST /api/uniswap?endpoint=quote|check_approval|swap`
- **SwapQuotePanel:** Works on chainId 1301, no longer shows "testnet warning" (fixed April 2026)
- **Skill installed:** `npx skills add uniswap/uniswap-ai --skill swap-integration` → `.agents/skills/swap-integration/`

## i18n System

- **3 languages:** English (`en.json`), Spanish (`es.json`), Chinese (`zh.json`)
- **Location:** `apps/web/dictionaries/`
- **Context:** `apps/web/context/LanguageContext.tsx` — provides `useLanguage()` hook
- **Switcher:** Built into Navbar, persists to localStorage
- **Tone:** Institutional, clear, grandma-friendly. NO jargon like "swarm", "neural", "P2P mesh". Use "AI agent", "dynamic fees", "insurance", "protection".

## Revenue Model

Three sustainable revenue streams (all live on testnet):

| Stream | Amount | Mechanism |
|---|---|---|
| Agent Activation | ~$5 (0.00244 ETH) | One-time fee via AgentRegistry |
| IL Insurance Premium | 10 USDC / LP position | Paid on afterAddLiquidity, grows insurance pool |
| Protocol Fee | 1% of swap fees | SOFTWARE_TOLL_BPS = 100 in HookMindCore.sol |

## Demo Day Strategy (May 28, 2026)

**Lead with IL Insurance** — the unique differentiator. No competitor (including VolVantage, the hackathon winner) has on-chain IL insurance with auto-enrollment.

**Show the Agent Signal Feed live** — proves AI is making real decisions on-chain with ECDSA signatures and IPFS audit logs.

**DO NOT lead with swap functionality** — it's infrastructure, not a differentiator.

**Judges/VCs:** 1KX, Shak BC, Blockchain Builders (Stanford), Lucero Ventures

## Legal Positioning

- **Non-custodial, software-only** — protocol does not hold user funds
- **Mexico (Ley Fintech):** Non-custodial DeFi protocols outside CNBV registration requirements
- **EU (MiCA):** Non-custodial DeFi excluded under Art. 2(4) / Recital 22
- **Audit trail:** Every AI decision ECDSA-signed + IPFS-pinned

## Common Commands

```bash
# Frontend dev server
pnpm --filter web dev

# AI agent daemon
pnpm run dev:agent

# Smart contract tests
pnpm run test:contracts

# Deploy contracts (Unichain Sepolia)
pnpm run deploy:unichain-sepolia

# TypeScript check
cd apps/web && npx tsc --noEmit

# Next.js build
cd apps/web && npx next build
```

## Important Rules for AI Assistants

1. **Never recreate existing files.** Check hooks/, components/ui/, and lib/ before creating new functionality.
2. **Use the existing Uniswap API proxy** (`/api/uniswap?endpoint=...`). Don't call the Trading API directly from the client.
3. **Use the existing i18n system.** All user-visible text must go through dictionaries (en.json, es.json, zh.json) and the `useLanguage()` hook.
4. **Current contract addresses are in `apps/web/lib/constants.ts`.** Do not hardcode addresses elsewhere.
5. **The tsconfig target is `es5`.** Do not use BigInt literals (`0n`). Use `BigInt(0)` instead.
6. **Language tone:** Institutional, clear, no jargon. "AI-powered dynamic fees" not "neural swarm signals". "Impermanent loss insurance" not "IL protection mesh".
7. **The agent daemon uses mock LLM by default** (`ACTIVE_LLM_PROVIDER=mock`). Set to `openai`, `anthropic`, `gemini`, or `grok` for real inference.
