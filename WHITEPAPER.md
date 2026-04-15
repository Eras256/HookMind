# HookMind Protocol: Autonomous AI Liquidity Management
**Technical Whitepaper & Specification**

## 1. Abstract
The predominant risk for Liquidity Providers (LPs) in decentralized exchanges is Impermanent Loss (IL) / Loss vs Rebalancing (LVR) driven by toxic flow and high-volatility events. Traditional static fees are fundamentally incapable of pricing risk dynamically without sacrificing capital efficiency. HookMind is an autonomous economic middleware for Uniswap v4 on Unichain that connects off-chain AI execution environments with on-chain fee and spread mechanics.

## 2. The Predictive Inventory Model
HookMind shifts the paradigm from "fee overrides" to active spread control via the `PredictiveInventoryModel`.

The model calculates an optimal dynamic fee $\Delta Fee$ by balancing historical variance ($\sigma^2$) with the deviation between the spot price and the TWAP:

$$ \Delta Fee = BaseFee + \alpha \times \left(\frac{\sigma^2}{\sigma^2_{max}}\right) \times (1 - TWAP_{Agreement}) $$

### Breakdown
1. **Historical Variance ($\sigma^2$)**: Measured dynamically across the last N blocks by the Agent Node. If variance crosses historical 95th percentiles, the base risk score rises.
2. **TWAP Agreement**: A normalized ratio between `0` and `1`. Spot manipulation (e.g., flash loans) drops the TWAP agreement to 0. Real price discovery maintains a score closer to `1`.
3. **$\alpha$ (Amplification Factor)**: Controls the steepness of the fee curve.

## 3. Security and Anti-Manipulation Guardrails
Because the AI engine runs off-chain, the on-chain Hook requires robust verifiability and strict bounds:

1. **Flash Loan Arbitrage Defense**: The off-chain agent rejects data points with $>15\%$ spot-to-TWAP deviation.
2. **Cryptographic Integrity**: Signals are signed by the agent's registered ECDSA key. The Hook verify the hash payload `(poolId, fee, volatilityScore, ilProtect, ipfsCid, nonce, chainId)`.
3. **Replay Protection**: The Hook maintains a strictly increasing linear `nonce` per registered operator.
4. **Hard Bounds**: The `HookMindCore` contract enforces $[MIN\_FEE, MAX\_FEE]$ (e.g., $5$ bps to $100$ bps). Any malicious or hallucinated LLM recommendation outside this bound reverts automatically.
5. **Circuit Breaker**: The protocol Pause state protects the vault and LP reserves in case of zero-day exploits.

## 4. The BeforeSwapReturnDelta Primitive
HookMind leverages one of Uniswap v4's most advanced novel primitives: the `BeforeSwapReturnDelta`.
When the agent's `volatilityScore` signals extreme market distress ($>7000/10000$), the Hook can return a non-zero `BeforeSwapDelta`. This effectively creates an **asymmetric spread** (charging a higher premium for the toxic side of the trade, while discounting the balancing side), protecting the pool's inventory dynamically.

## 5. Summary
HookMind separates computation (AI layer) from execution (Uniswap v4 Hook). By combining cryptographically verified LLM outputs with hardcoded on-chain bounds, it creates the first institutional-grade, zero-latency autonomous fee manager in DeFi.
