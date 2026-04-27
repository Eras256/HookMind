# 📄 HookMind Protocol: Technical Whitepaper v1.1
> **The Neural Liquidity Mesh: Autonomous AI Agent Overlays for Uniswap v4 on Unichain.**

---

## 1. Executive Summary
The **HookMind Protocol** represents a paradigm shift in decentralized market making. By leveraging the modularity of **Uniswap v4 Hooks** and the high-throughput capabilities of **Unichain**, HookMind introduces an autonomous "neural layer" that manages liquidity pool parameters in real-time. 

Version 1.1 introduces an **Asynchronous Keeper Model**, utilizing **Transient Storage (EIP-1153)** and **Flash Accounting** to minimize gas while maintaining a sub-second response loop to volatility.

---

## 2. Infrastructure Architecture

### 2.1 The High-Performance Hook Layer
- **HookMindCore.sol**: Optimized for $O(1)$ execution.
  - **Asynchronous State**: AI signals are processed out-of-band via `updateNeuralState`, updating a local fee cache.
  - **Transient Storage**: Passing data between `beforeSwap` and `afterSwap` uses `TSTORE`/`TLOAD`, eliminating gas overhead for inter-hook communication.
  - **Flash Accounting**: Fees are routed to the YieldVault via the Singleton ledger (`manager.take`), avoiding external ERC-20 calls within the swap path.

### 2.2 The Autonomous Guardrail Layer (Agent Node)
- **Asynchronous Neural Loop**: Decouples crypto-heavy signature verification and LLM latency from block production.
- **Statistical Engine**: Calculates price variance ($\sigma^2$) over 10-minute sliding windows:
  $$\sigma^2 = \frac{1}{N-1} \sum_{i=1}^{N} (P_i - \bar{P})^2$$
- **Heuristic Noise Filter**: A defensive layer that aborts updates if single-block price deviations exceed **15%**, identifying them as Flash Loan attacks rather than organic volatility.

### 2.3 Neural Simulation & Fallback Matrix
- **Multi-Cloud LLM Hub**: Support for OpenAI, Anthropic, and Google Vertex AI.
- **Neural Mock Provider**: A deterministic execution environment used for high-fidelity simulation and protocol testing.
- **Circuit Breaker Fallback**: In the event of primary LLM provider downtime, the agent switches to an $O(1)$ statistical fallback model, ensuring the Hook remains updated with conservative, safe-bound parameters.

---

## 3. Mathematical Models & Logic

### 3.1 Neural Dynamic Fees
The fee logic is governed by a statistical variance model.
- **Input**: 10-minute TWAP and real-time variance.
- **Control Range**: 5 bps to 100 bps (500 - 10,000 pips).
- **Execution**: The hook reads the cached `currentDynamicFee[poolId]` in $O(1)$ during the `beforeSwap` callback.

### 3.2 Insurance Solvency & Prorating
To prevent "Bank Runs" during market crashes, the `ILInsurance` contract utilizes an **Epoch-based Prorating** model.
- **Withdraw Cap**: Each epoch (7 days) is limited to a Max Risk Factor (15% of total vault balance).
- **Prorated Payout Formula**:
  If $\sum Exposure_{lp} > P_{max}$:
  $$Payout_{lp} = \frac{Exposure_{lp} \times P_{max}}{\sum Exposure_{epoch}}$$

---

## 4. Security &# Technical Paper: Cognitive DeFi Infrastructure on Uniswap v4

**Abstract**: HookMind introduces a paradigm shift in Automated Market Maker (AMM) efficiency by integrating off-chain artificial intelligence with the **Uniswap v4 Hook** framework. Our implementation utilizes the novel `BeforeSwapReturnDelta` primitive to create the first real-time, risk-aware liquidity engine.

---

## 1. The Cognitive Execution Loop
HookMind operates as a feedback loop between Unichain's low-latency state and a decentralized AI swarm:

1.  **State Observation**: AI Agents (running as Dockerized daemons) monitor `PoolManager` events every 1-second block.
2.  **Neural Inference**: Agents utilize the **Uniswap AI Trading Skill** to compute optimal fee structures based on cluster volatility (σ).
3.  **Cryptographic Proof**: Decisions are signed via ECDSA and pinned to **IPFS**, ensuring that every hook execution is backed by a verifiable reasoning trail.

## 2. Advanced Hook Implementation: BeforeSwapReturnDelta
Unlike standard v4 hooks that only return a fee, HookMind leverages `BeforeSwapReturnDelta` to manage inventory skew. When volatility exceeds defined risk thresholds ($Score > 7000$):
-   The hook calculates a **price-improving delta** for balancing trades.
-   The hook calculates a **spread-increasing delta** for toxic flow.
This asymmetric pricing model protects LPs from toxic arbitrage far more effectively than a simple fee adjustment.
| :--- | :--- | :--- |
| **HookMindCore** | [`0xf9e8768686d0138ee041898a906ddd78519955c8`](https://unichain-sepolia.blockscout.com/address/0xf9e8768686d0138ee041898a906ddd78519955c8) | Primary entry point for `beforeSwap` and `afterSwap` logic. |
| **AgentRegistry** | [`0xb3411c3e83bf0e79a00821206fb89ff8130c5f4e`](https://unichain-sepolia.blockscout.com/address/0xb3411c3e83bf0e79a00821206fb89ff8130c5f4e) | RBAC contract enforcing ECDSA signature validity for agent updates. |
| **YieldVault** | [`0xa0242258bc39d2b2daaf4913f30803f77b01a79b`](https://unichain-sepolia.blockscout.com/address/0xa0242258bc39d2b2daaf4913f30803f77b01a79b) | Yield-generating buffer for automated fee compounding. |
| **ILInsurance** | [`0x42aa32c49e993936d23a3cc746173c6954a07eef`](https://unichain-sepolia.blockscout.com/address/0x42aa32c49e993936d23a3cc746173c6954a07eef) | Probabilistic insurance pool for LP loss mitigation. |

---

## 7. Conclusion
HookMind is an evolution of the liquidity provider role. By combining Uniswap v4's high-efficiency singleton architecture with sophisticated off-chain AI guardrails, HookMind creates a self-healing, high-performance liquidity mesh built for the next generation of DeFi on Unichain.

---
*Created by HookMind Labs. For more information, visit [hookmind.ai](https://hookmind.ai).*
