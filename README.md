# 🧠 HookMind Protocol
> **The Neural Liquidity Mesh: Proactive AI Agent Overlays for Uniswap v4 on Unichain.**

[![Unichain](https://img.shields.io/badge/Network-Unichain%20Sepolia-0052FF?logo=uniswap&logoColor=white)](https://unichain.org)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=next.js)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Contracts-Solidity%200.8.26-363636?logo=solidity)](https://soliditylang.org)
[![Technical Paper](https://img.shields.io/badge/Docs-Technical%20Paper-blue)](TECHNICAL_PAPER.md)
[![Watch the Demo](https://img.shields.io/badge/Demo-Watch_Video-FF0000?logo=youtube&logoColor=white)](#)

---

## ⚡ The Vision
Traditional liquidity provision is static and reactive. **HookMind** transforms Uniswap v4 pools from passive AMMs into **proactive neural meshes**. By decoupling heavy AI computation (LLMs & Variance Analysis) from the swap path, HookMind achieves institutional-grade intelligence without sacrificing the **1s block times of Unichain**.

The protocol introduces a **4-Layer Autonomous Stack**:
1. **Intelligence Layer**: Multi-LLM agents (Claude 3.5/GPT-4o) analyzing volatility.
2. **Registry Layer**: 1-Click SaaS registration with native ETH activation.
3. **Execution Layer**: Uniswap v4 Hooks with EIP-1153 Transient Storage.
4. **Security Layer**: Prorated IL Insurance and Fee-Smoothing Yield Vaults.

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

### 1. O(1) Asynchronous Neural State
To maintain Unichain's performance, AI verification is handled out-of-band. The HookMindCore simply reads from a **Cached Intelligence Mapping**, ensuring that $O(1)$ swap latency is preserved even when complex LLM logic governs the parameters.

### 2. 1-Click Native SaaS Activation
Institutional friction is eliminated. The **AgentRegistry** allows for atomic node deployment where the **SaaS Activation Fee (0.0015 ETH)** is paid in the same transaction as registration. No ERC-20 approvals (`approve`) are required for activation.

### 3. Transient Storage (EIP-1153)
The protocol utilizes modern EVM opcodes (`TSTORE`/`TLOAD`) to pass state between `beforeSwap` and `afterSwap` callbacks. This drastically reduces gas costs for dynamic fee application and prevents cross-transaction state pollution.

### 4. Fee-Smoothing Yield Vault (ERC-4626)
Liquidity provider fees are not immediately dumped. The **YieldVault** implements a **Drip-Release Model** over 7-day epochs, transforming volatile swap revenue into stable, predictable yield for LPs.

### 5. Prorated IL Insurance
LPs can enroll in the **ILInsurance** pool. In the event of extreme volatility, losses are compensated using an **Epoch-based Prorating Formula**, ensuring pool solvency even during black-swan events. 

### 6. Neural Guardrails (Flash Loan Protection)
The Agent Node implements a **Heuristic Deviation Filter**. Updates are automatically aborted if block price movements exceed 15%, protecting the neural mesh from flash-loan-induced manipulation.

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
