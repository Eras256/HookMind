# HookMind Protocol

**AI-powered liquidity protection for Uniswap v4 on Unichain.**  
Automatic dynamic fees + on-chain impermanent loss insurance = safer, smarter LP positions.

[![Network](https://img.shields.io/badge/Network-Unichain%20Sepolia-0052FF?logo=uniswap&logoColor=white)](https://unichain.org)
[![Program](https://img.shields.io/badge/Uniswap%20Foundation-Acceleration%20Program-FF007A?logo=uniswap)](https://uniswapfoundation.org)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=next.js)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Contracts-Solidity%200.8.26-363636?logo=solidity)](https://soliditylang.org)
[![Demo Day](https://img.shields.io/badge/Demo%20Day-May%2028%202026-purple)](#)

---

## What HookMind Does

Liquidity providers on Uniswap v4 face two problems:

1. **Static fees** can't react to volatility — LPs lose silently to arbitrageurs during price spikes.
2. **Impermanent loss** reduces LP value with no safety net.

HookMind solves both:

- **AI Dynamic Fees** — agents analyze on-chain data every 12 seconds and update pool fees automatically via the `beforeSwap` hook. More volatile market = higher fee = better LP protection.
- **IL Insurance** — LPs pay a 10 USDC premium when adding liquidity. If exit IL exceeds 2%, the insurance pool pays out automatically, prorated per epoch.
- **Full Transparency** — every AI decision is ECDSA-signed and permanently stored on IPFS before execution. Verifiable by anyone.

---

## Live Contracts (Unichain Sepolia)

| Contract | Address | Role |
|---|---|---|
| **HookMindCore** | [`0xf9e876...955c8`](https://sepolia.uniscan.xyz/address/0xf9e8768686d0138ee041898a906ddd78519955c8) | Uniswap v4 Hook — dynamic fees + IL enrollment |
| **AgentRegistry** | [`0xb3411c...5f4e`](https://sepolia.uniscan.xyz/address/0xb3411c3e83bf0e79a00821206fb89ff8130c5f4e) | On-chain agent authorization via ECDSA |
| **YieldVault** | [`0xa02422...9a79b`](https://sepolia.uniscan.xyz/address/0xa0242258bc39d2b2daaf4913f30803f77b01a79b) | Protocol fee collection (1% of swap fees) |
| **ILInsurance** | [`0x42aa32...07eef`](https://sepolia.uniscan.xyz/address/0x42aa32c49e993936d23a3cc746173c6954a07eef) | USDC insurance pool with epoch-prorated payouts |

---

## Revenue Model

HookMind has three sustainable revenue streams — all live on testnet:

| Stream | Amount | Mechanism |
|---|---|---|
| Agent Activation | ~$5 (0.00244 ETH) | One-time fee to register an AI agent on-chain |
| IL Insurance Premium | 10 USDC / LP position | Paid on `afterAddLiquidity`, grows the insurance pool |
| Protocol Fee | 1% of swap fees | `SOFTWARE_TOLL_BPS = 100` in `HookMindCore.sol` |

**Unit economics at scale:** 10,000 active LPs × 10 USDC/month = $100K/month from insurance alone. Protocol fees scale with TVL.

---

## Architecture

```
Off-chain AI Agent (Node.js)
  ↓ reads Unichain block data every 12s
  ↓ computes volatility score (0–10,000) via PredictiveInventoryModel
  ↓ signs recommendation with ECDSA key
  ↓ pins decision to IPFS (audit trail)
  ↓ calls updateNeuralState() on HookMindCore

HookMindCore.sol (Uniswap v4 Hook)
  ├── beforeSwap()     → applies dynamic fee override via LPFeeLibrary
  ├── afterSwap()      → emits fee events, IL exposure check
  ├── afterAddLiquidity()   → enrollLp() on ILInsurance
  └── afterRemoveLiquidity() → processExit() on ILInsurance

ILInsurance.sol
  ├── payPremium()     → LP pays 10 USDC, position marked as insured
  ├── processExit()    → calculates IL exposure on removal
  └── claimInsurance() → epoch-prorated USDC payout
```

**Key technical properties:**
- `TSTORE`/`TLOAD` (EIP-1153) — passes dynamic fee between `beforeSwap` and `afterSwap` with zero SLOADs
- `BeforeSwapReturnDelta` — asymmetric spread when volatility > 7000/10000
- ECDSA + nonce replay protection — only registered agents can update pool state
- Flash loan guard — agent rejects data with >15% spot-to-TWAP deviation

---

## API Integration (Uniswap Foundation Program)

HookMind integrates the **Uniswap Trading API** for swap quotes and execution:

```bash
# Server-side proxy (keeps API key secure)
POST /api/uniswap?endpoint=quote
POST /api/uniswap?endpoint=check_approval
POST /api/uniswap?endpoint=swap
```

Supported chains include Unichain Sepolia (1301) and Unichain mainnet (130).

**Installed skill:**
```bash
npx skills add uniswap/uniswap-ai --skill swap-integration
```

---

## Quickstart

```bash
# 1. Clone and install
git clone https://github.com/your-org/hookmind
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Add: UNISWAP_API_KEY, AGENT_EOA_ADDRESS, etc.

# 3. Start the frontend
pnpm --filter web dev

# 4. Run the AI agent (separate terminal)
cd packages/agent
node agent.js
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.26, Foundry, Uniswap v4, OpenZeppelin |
| Frontend | Next.js 15, wagmi v2, viem v2, RainbowKit, Framer Motion |
| AI Agent | Node.js, multi-LLM (Claude, GPT-4o, Gemini, Grok) |
| Data | IPFS/Pinata, Unichain Sepolia RPC |
| API | Uniswap Trading API (REST), ECDSA signing |

---

## Legal & Compliance

HookMind operates as a **non-custodial DeFi protocol**. Smart contracts are immutable and user-controlled. The protocol does not hold or manage user funds directly.

- **Mexico (Ley Fintech 2018):** Non-custodial DeFi protocols that do not offer fiat on/off ramps fall outside mandatory CNBV registration requirements. HookMind does not custody assets.
- **EU (MiCA 2024):** Non-custodial DeFi protocols are explicitly excluded from MiCA's licensing requirements under Art. 2(4).
- **US:** Protocol operates as non-custodial software. No securities offering is made.

> This is not financial advice. Liquidity provision and DeFi carry inherent risks. Always do your own research.

---

## Uniswap Foundation Acceleration Program

HookMind is part of the **Uniswap Foundation Acceleration Season** (2026 cohort). Selected from 57 applicants across 26 countries.

- **Demo Day:** May 28, 2026
- **Judges/VCs:** 1KX, Shak BC, Blockchain Builders (Stanford), Lucero Ventures
- **Focus:** Uniswap Trading API integration + institutional LP protection product

---

Built by **HookMind Labs** · Backed by the **Uniswap Foundation**
