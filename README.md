# HookMind Protocol 🧠
> *"The First Autonomous AI Agent Mesh that Controls a Uniswap v4 Hook in Real-Time."*
[![CI](https://github.com/yourorg/hookmind/actions/workflows/ci.yml/badge.svg)](https://github.com/yourorg/hookmind/actions)
[![Unichain](https://img.shields.io/badge/Unichain-Live-0052FF?logo=uniswap)](https://sepolia.uniscan.xyz)
[![UHI9](https://img.shields.io/badge/UHI9-Hookathon-06B6D4)](https://atrium.academy)
## The Problem
LPs on Uniswap v4 face three unsolved problems:
1. **Static fees** — pool fees don't react to real-time volatility, hurting LP returns.
2. **Impermanent Loss** — no native protection mechanism exists at the hook layer.
3. **Unpredictable yield** — fee distributions spike and crash based on swap volume.
## The Solution: HookMind
HookMind deploys autonomous AI agents that monitor pools every block and submit
cryptographically signed signals to `HookMindCore.sol` — a Uniswap v4 hook that:
- ✅ Sets **dynamic fees** based on AI-computed volatility scores (500–10000 bps)
- ✅ Activates **IL protection mode** when LP exposure exceeds configurable threshold
- ✅ Routes fees to **ERC-4626 YieldVault** for smooth epoch-based distribution
- ✅ Enrolls LPs in **USDC IL Insurance** funded by Circle CCTP v2
## How It Works
[Unichain Block] → [Agent Reads Pool] → [LLM Decides] → [Signs Signal] → [submitAgentSignal()] → [Hook Updates] ↓ [Pinata IPFS Audit CID]

## Sponsor Integrations
| Sponsor          | Integration                                                      |
|------------------|------------------------------------------------------------------|
| **Unichain**     | Primary deployment chain + perp DEX for delta hedging             |
| **Circle**       | USDC IL insurance pool + CCTP v2 cross-chain top-up               |
| **Reactive Net** | RSC monitors IL events and triggers cross-chain compensation       |
| **EigenLayer**   | AVS consensus layer for the agent price oracle feed               |
## Repository Structure
packages/contracts/ — Foundry: HookMindCore + AgentRegistry + YieldVault + ILInsurance packages/agent/ — Node.js AI Daemon (5 LLM providers, ECDSA signing, IPFS audit) packages/mcp/ — Model Context Protocol server (8 tools) packages/sdk/ — TypeScript SDK (React hooks for live data) apps/web/ — Next.js 15 Neural UI (GPGPU 50K particles, glassmorphism)

## Quick Start
```bash
git clone https://github.com/yourorg/hookmind && cd hookmind
pnpm install
cp .env.example .env.local  # fill in your keys
# Run tests
pnpm forge:test
# Deploy to Unichain Sepolia
pnpm deploy:unichain-sepolia
# Start agent + frontend
pnpm dev & pnpm dev:agent
```
Security Measures
ECDSA signature verification on every agent signal (prevents unauthorized hook manipulation)
Nonce-based replay attack protection
Fee clamped to [500, 10000] bps — no unbounded parameter changes
Global Pausable circuit breaker controlled by admin multisig
Slither static analysis integrated in CI
Foundry invariant fuzzing: 10,000 runs per test
Submission Info
Demo Video: [Loom link]
GitHub: https://github.com/yourorg/hookmind
Live Hook: [Uniscan link]
Track: UHI9 — Impermanent Loss & Yield Systems
Sponsor Tracks: Unichain, Circle, Reactive Network, EigenLayer
