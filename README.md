# 🧠 HookMind Protocol
> **The Neural Liquidity Mesh: First Autonomous AI Agent Overlay for Uniswap v4 on Unichain.**

[![Unichain](https://img.shields.io/badge/Network-Unichain-0052FF?logo=uniswap&logoColor=white)](https://unichain.org)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=next.js)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Contracts-Solidity%200.8.26-363636?logo=solidity)](https://soliditylang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ⚡ The Vision
Traditional liquidity provision is static. In a world of high-frequency volatility, fixed-fee pools are inefficient: they leave money on the table for arbitrageurs and expose LPs to uncompensated risk. **HookMind** fixes this by deploying a distributed mesh of AI Agents that act as the "brain" for Uniswap v4 pools.

HookMind uses **real-time neural signals** to adjust pool parameters on-the-fly, ensuring that LPs are always optimally positioned.

---

## 🚀 Key Features

### 1. Neural Dynamic Fees
Every block, HookMind Agents calculate market volatility. If a surge is detected, the AI signs a signal to increase fees (up to 10,000 bps), capturing "toxic flow" revenue for LPs.

### 2. Autonomous IL Shield
When the pool price deviates beyond a neural-estimated "danger zone," the hook activates **IL Protection Mode**, adjusting the liquidity curve or payout structure to mitigate losses.

### 3. Epoch-Based Yield Smoothing
Fees are routed to an **ERC-4626 Neural Vault** that drips rewards over 7-day epochs, creating a stable return profile for institutional and retail LPs.

### 4. Immutable Audit Trail
Every single AI decision is:
- Computed off-chain by LLMs (Claude, GPT-o, Grok).
- Pinned to **IPFS via Pinata** for permanent record.
- **ECDSA-Signed** by the Agent's EOA to prevent malicious overrides.

---

## 🛠 Tech Stack

### Frontend & UI
- ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) **React 19** ⚛️
- ![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white) **Next.js 15 (App Router)** 🚀
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) **Tailwind CSS v4** 🎨
- ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white) **Framer Motion** ✨
- ![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js&logoColor=white) **GPGPU Neural Particle Engine** 🧊

### Agent & AI
- ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) **Node.js 22 (Daemon)** 🟢
- ![LLMs](https://img.shields.io/badge/AI_Models-Anthropic%20|%20OpenAI%20|%20Gemini-orange) **Anthropic Claude 3.5, Gemini 1.5, GPT-4o** 🤖
- ![Pinata](https://img.shields.io/badge/Storage-Pinata_IPFS-E12F2F) **Web3 Archiving** 📂
- ![Viem](https://img.shields.io/badge/Web3-Viem-yellow) **High-performance Ethereum interactions** ⛓️

### Smart Contracts
- ![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white) **Uniswap v4 Hooks** 🏗️
- ![Foundry](https://img.shields.io/badge/Foundry-FF0000?logo=rust&logoColor=white) **Toolchain** 🔨
- ![Circle](https://img.shields.io/badge/Circle-USDC_CCTP-2775CA?logo=circle&logoColor=white) **IL Insurance** 💵

---

## 📂 Repository Structure

```text
.
├── apps/
│   └── web/            # Neural Dashboard (Next.js 15)
├── packages/
│   ├── agent/          # AI Execution Daemon (LLM + Signing)
│   ├── contracts/      # HookMindCore & Vaults (Solidity/Foundry)
│   ├── cli/            # Node-based operator toolkit
│   ├── mcp/            # Model Context Protocol server
│   ├── sdk/            # TypeScript SDK for integrators
│   └── desktop/        # Tauri Desktop Wallet & Node Manager
```

---

## 🎨 Design Philosophy: Neural Institutional
HookMind's UI follows a **Level 6 Sui-Loop Institutional Standard**.
- **Neural GPGPU Canvas**: 50,000 real-time particles reacting to pool volatility.
- **Glassmorphism**: Layered depth with high-fidelity transparency.
- **Thematic Consistency**: Using neural-cyan and neural-magenta variables for a cohesive brand identity.

---

## 🚦 Getting Started

### 1. Requirements
- Node.js 22+
- Pnpm 9+
- Foundry (for contracts)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Eras256/HookMind
cd HookMind

# Install dependencies
pnpm install

# Setup env
cp .env.example .env.local
```

### 3. Development
```bash
# Start the web dashboard
pnpm dev

# Start the agent daemon
pnpm dev:agent
```

---

## 🛡 Security Architecture
- **ECDSA Guardians**: Every signal must be signed by an authorized EOA stored in `AgentRegistry.sol`.
- **Parametric Constraints**: Fees and protecting flags are clamped within strict sanity bounds at the contract level.
- **Multisig Circuit Breaker**: Emergency pause functionality for extreme market conditions.

---

## 🏆 Hackathon Tracks
- **Unichain**: Primary scaling layer for real-time AI signals.
- **Circle (USDC)**: Native payout currency for IL Insurance pools via CCTP.
- **EigenLayer**: Future-proofing with AVS for agent delegation.

---
Created with 🧠 by **HookMind Labs** for the **UHI9 Hookathon**.
