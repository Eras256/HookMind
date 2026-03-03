# 🕵️ Project Analysis: HookMind 100%

## 📂 Core Monorepo Strategy
HookMind is structured as a **PNPM Workspace** monorepo, optimized for shared types and rapid deployment across multiple targets (Web, Desktop, Daemon).

---

## 🌎 1. apps/web (Neural Dashboard)
**Purpose:** The high-fidelity institutional interface for monitoring AI agents and managing yield.
- **Tech:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion, Wagmi/Viem.
- **Visuals:** Features a "GPGPU Neural Canvas" with 50K particles. Uses CSS variables for consistent branding (`neural-cyan`, `neural-magenta`).
- **Pages:**
    - `/dashboard`: Real-time monitoring.
    - `/pools`: Hook-level analytics (Recharts).
    - `/strategies`: Marketplace for AI signals.
    - `/vault`: ERC-4626 staking and insurance claims.
    - `/leaderboard`: Rank of top operator nodes.

---

## 🤖 2. packages/agent (Execution Daemon)
**Purpose:** The "brain" that runs off-chain, processes data, and signs transactions.
- **Core Logic:** Every 12 seconds (average block time), it extracts pool data from Unichain.
- **AI Routing:** Supports Anthropic (Claude), Google (Gemini), and OpenAI (GPT).
- **Auditability:** Every decision JSON is uploaded to **IPFS via Pinata**. Return CID is part of the on-chain signal.
- **Security:** Uses `viem`'s `privateKeyToAccount` for ECDSA signing of signals.

---

## 🏛 3. packages/contracts (Uniswap v4 Hooks)
**Purpose:** On-chain enforcement of AI decisions.
- **HookMindCore.sol:** The main entry point. Overrides `beforeSwap` to apply dynamic fees retrieved from the `AgentRegistry`.
- **AgentRegistry.sol:** A permissioned registry where operators must be registered. Stores the mapping of Agent EOA -> Agent Health/Stats.
- **YieldVault.sol:** An ERC-4626 implementation that smooths out chaotic swap fees into steady epoch-based payouts.
- **ILInsurance.sol:** Integration with **Circle CCTP** to handle cross-chain insurance payouts for LPs.

---

## 🛠 4. packages/mcp (Model Context Protocol)
**Purpose:** Allows other AI agents (like Claude Desktop or Cursor) to "talk" to the HookMind network.
- **Tools:** Includes `get_pool_intelligence`, `dry_run_signal`, and `read_ipfs_audit_log`.
- **Standard:** Follows the Anthropic MCP specification.

---

## 📦 5. packages/sdk & packages/cli
**Purpose:** Developer and Operator ergonomics.
- **SDK:** A TypeScript client that abstracts `viem` and `axios` calls for the Dashboard and third-party integrators.
- **CLI:** A command-line utility for managing agent lifecycle (`register-node`, `withdraw-fees`).

---

## 🖥 6. packages/desktop (Tauri App)
**Purpose:** A local-first, secure node manager.
- **Tech:** Rust + Vite/React.
- **Benefit:** Allows running the agent logic with local private key storage without full-stack dependency exposure.

---

## 🧬 Summary Pitch
HookMind is not just a dashboard; it is an **autonomous economic middleware**. It sits between the user and the pool, using cryptographically verified AI intelligence to extract the maximum possible value for Liquidity Providers on the next generation of Uniswap deployment.
