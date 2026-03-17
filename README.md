# 🧠 HookMind Protocol
> **The Neural Liquidity Mesh: Proactive AI Agent Overlays for Uniswap v4 on Unichain.**

[![Unichain](https://img.shields.io/badge/Network-Unichain%20Sepolia-0052FF?logo=uniswap&logoColor=white)](https://unichain.org)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=next.js)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Contracts-Solidity%200.8.26-363636?logo=solidity)](https://soliditylang.org)
[![Technical Paper](https://img.shields.io/badge/Docs-Technical%20Paper-blue)](TECHNICAL_PAPER.md)

---

## ⚡ The Vision
Traditional liquidity provision is static. **HookMind** transforms Uniswap v4 pools from passive AMMs into **proactive neural meshes**. By decoupling heavy AI computation from the swap path, HookMind achieves institutional-grade intelligence without sacrificing the **1s block times of Unichain**.

**[Read the Full Technical Paper here →](TECHNICAL_PAPER.md)**

---

## ⛓️ Deployed Contracts (Unichain Sepolia)

| Contract | Address | Description |
| :--- | :--- | :--- |
| **HookMindCore** | [`0x450113E691b4be42EB9ca3a3E0F585a2D79915c0`](https://unichain-sepolia.blockscout.com/address/0x450113E691b4be42EB9ca3a3E0F585a2D79915c0) | The central v4 Hook managing dynamic fees and LP protection. |
| **AgentRegistry** | [`0xeF00B7Cea0B1AB51340619b7afD48c0a5dfCc013`](https://unichain-sepolia.blockscout.com/address/0xeF00B7Cea0B1AB51340619b7afD48c0a5dfCc013) | Decoupled RBAC for authorized AI Agent operators. |
| **YieldVault** | [`0xB4637368A6cFbfae9A9218F87CA77d813Bed7877`](https://unichain-sepolia.blockscout.com/address/0xB4637368A6cFbfae9A9218F87CA77d813Bed7877) | ERC-4626 Vault using **Flash Accounting** for zero-gas fee routing. |
| **ILInsurance** | [`0x6A919739d655b9073135679ca0c8C5aB33448844`](https://unichain-sepolia.blockscout.com/address/0x6A919739d655b9073135679ca0c8C5aB33448844) | Solvent insurance pool with **Prorated Payouts** and risk caps. |

---

## 🚀 Advanced Architecture

### 1. 1-Click Native SaaS Activation ($O(1)$ Deployment)
HookMind eliminates ERC-20 approval friction. The **SaaS Activation Fee** is paid directly in Native ETH (0.0015 ETH) in the same transaction as agent registration, ensuring a seamless "1-Click" experience for institutional operators.

### 2. Asynchronous Neural State ($O(1)$ Swaps)
To respect Unichain's speed, all AI-heavy computation (LLM routing, cryptographic verification) is performed asynchoronously. The hook simply reads a cached `currentDynamicFee` mapping, ensuring swap latency remains near-zero.

### 3. Transient Storage & Flash Accounting
Utilizing **EIP-1153**, HookMind passes parameters between hook calls via `TSTORE`/`TLOAD`. Fees are collected using the **Uniswap v4 Singleton ledger** (`manager.take`), eliminating unnecessary token transfers and ensuring a strictly **non-custodial** flow of technological tolls.

### 4. Neural Guardrails (Anti-Manipulation)
The Agent Node implements a **Heuristic Noise Filter**. Any price deviation exceeding 15% in a single block (Flash Loan signature) triggers an automatic abort, preventing the AI from updating state based on manipulated data.

### 5. Zero-Custody Infrastructure Tolls
HookMind operates as a **SaaS (Software-as-a-Service)** platform. It implements a 1% **Software Toll** on generated efficiencies and a one-time **SaaS Activation Fee** in Native ETH. The protocol never maintains custody of user funds.

---

## 🛠 Tech Stack

### Smart Contracts (Solidity)
- **Uniswap v4 Hooks**: Advanced logic using `TSTORE` and `Flash Accounting`.
- **Foundry**: Comprehensive suite including integration tests (`HookMind.t.sol`).
- **OpenZeppelin**: ECDSA and RBAC modules.

### Autonomous Agent (Node.js)
- **Statistical Engine**: Variance-based volatility analysis ($\sigma^2$).
- **Multi-LLM Matrix**: Native support for **OpenAI (GPT-4o)**, **Anthropic (Claude 3.5)**, and **Gemini 1.5 Pro**.
- **Neural Mock Mode**: A deterministic simulation engine for CI/CD testing and low-latency demo environments.
- **Viem**: Optimized interaction with Unichain Sepolia.

---

## 🛡 Security Architecture
- **ECDSA Sig Verification**: Only out-of-band signals from registered agents are accepted.
- **Parametric Constraints**: All dynamic fees are clamped between 5 bps and 100 bps on-chain.
- **Neural TWAP**: Agent decisions are weighted against a 10-minute TWAP to ignore high-frequency noise.

---

## 🏆 Deployment Status
- **Contracts**: 100% Deployed & Verified on Unichain Sepolia.
- **Agent Node**: 100% Functional with **Flash Loan Protection**.
- **Dashboard**: High-fidelity telemetry connected to real-time events.

---
Created with 🧠 by **HookMind Labs** for the **Unichain Hookathon**.
