/**
 * AgentEngine — The Autonomous AI Decision Loop
 *
 * Every AGENT_UPDATE_INTERVAL_MS (default ~12s / 1 block):
 *   1. Read Unichain pool state via viem
 *   2. Compute volatility score from recent trades
 *   3. Query LLM (via MCP) for fee/IL strategy recommendation
 *   4. Sign a hook signal with the agent's private key (ECDSA)
 *   5. Submit the signal to HookMindCore.submitAgentSignal()
 *   6. Pin execution log to Pinata IPFS (immutable audit trail)
 *   7. Broadcast result to WebSocket clients (frontend real-time feed)
 *
 * Mirrors Nirium's continuous agent loop from packages/agent/src/engine.ts
 */
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { type Chain } from "viem/chains";
import { createLogger } from "./logger";
import { LLMRouter } from "./providers/llm/router";
import { PoolReader } from "./providers/chain/poolReader";
import { VolatilityStrategy } from "./strategies/volatilityFee";
import { ILMonitor } from "./strategies/ilMonitor";
import { PinataAudit } from "./ipfs/pinata";
import { AgentSigner } from "./signer";
import type { WSServer } from "./ws/server";
const log = createLogger("HookMind:Engine");
// Unichain chain definition
const unichain: Chain = {
    id: 130,             // Unichain Mainnet chainId
    name: "Unichain",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: { http: [process.env.UNICHAIN_MAINNET_RPC!] },
    },
} as const;
const unichainSepolia: Chain = {
    id: 1301,            // Unichain Sepolia chainId
    name: "Unichain Sepolia",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: { http: [process.env.UNICHAIN_SEPOLIA_RPC!] },
    },
} as const;
export class AgentEngine {
    private readonly wsServer: WSServer;
    private readonly account = privateKeyToAccount(
        process.env.AGENT_PRIVATE_KEY as `0x${string}`
    );
    private readonly chain = unichainSepolia; // change to unichain for mainnet
    private readonly client = createPublicClient({
        chain: unichainSepolia,
        transport: http(process.env.UNICHAIN_SEPOLIA_RPC),
    });
    private readonly walletClient = createWalletClient({
        account: this.account,
        chain: unichainSepolia,
        transport: http(process.env.UNICHAIN_SEPOLIA_RPC),
    });
    private readonly llmRouter = new LLMRouter();
    private readonly poolReader = new PoolReader(this.client);
    private readonly volatility = new VolatilityStrategy();
    private readonly ilMonitor = new ILMonitor();
    private readonly pinata = new PinataAudit();
    private readonly signer = new AgentSigner(this.account);
    private isAlive = true;
    constructor(wsServer: WSServer) {
        this.wsServer = wsServer;
        process.on("SIGINT", () => { this.isAlive = false; });
        process.on("SIGTERM", () => { this.isAlive = false; });
    }
    async run(): Promise<void> {
        const interval = parseInt(process.env.AGENT_UPDATE_INTERVAL_MS ?? "12000");
        log.info(`Agent loop started. Interval: ${interval}ms`);
        while (this.isAlive) {
            const cycleStart = Date.now();
            try {
                await this.executeCycle();
            } catch (err) {
                log.error("Cycle error (non-fatal):", err);
                this.wsServer.broadcast({ type: "error", message: String(err) });
            }
            // Maintain consistent block-aligned intervals
            const elapsed = Date.now() - cycleStart;
            const sleep = Math.max(0, interval - elapsed);
            await new Promise((r) => setTimeout(r, sleep));
        }
        log.info("Agent loop terminated.");
    }
    private async executeCycle(): Promise<void> {
        const hookAddress = process.env.HOOK_MIND_CORE_ADDRESS as `0x${string}`;
        const poolKeyHash = process.env.TARGET_POOL_ID as `0x${string}`;
        // ── STEP 1: Read current pool state from Unichain ──────────────────────
        log.info("📡 Step 1 — Reading pool state from Unichain...");
        const poolState = await this.poolReader.readPoolState(hookAddress, poolKeyHash);
        const recentSwaps = await this.poolReader.getRecentSwapEvents(hookAddress, 50n);
        this.wsServer.broadcast({ type: "pool_state", data: poolState });
        // ── STEP 2: Compute volatility score from recent swap deltas ───────────
        log.info("📊 Step 2 — Computing volatility score...");
        const volatilityScore = this.volatility.compute(recentSwaps);
        const ilExposure = this.ilMonitor.computeExposure(poolState);
        this.wsServer.broadcast({ type: "metrics", volatilityScore, ilExposure });
        log.info(`  → Volatility: ${volatilityScore}/10000 | IL Exposure: ${ilExposure}`);
        // ── STEP 3: Query LLM for optimal hook parameters ──────────────────────
        log.info("🧠 Step 3 — Querying Neural Provider...");
        const llmDecision = await this.llmRouter.query({
            systemPrompt: AGENT_SYSTEM_PROMPT,
            userMessage: buildLLMMessage(poolState, volatilityScore, ilExposure),
        });
        log.info(`  → LLM decision: fee=${llmDecision.feeBps}bps, IL=${llmDecision.activateIL}`);
        this.wsServer.broadcast({ type: "llm_decision", data: llmDecision });
        // ── STEP 4: Pin reasoning log to Pinata IPFS (immutable audit) ─────────
        log.info("📌 Step 4 — Pinning audit log to IPFS...");
        const auditPayload = {
            agentAddress: this.account.address,
            timestamp: new Date().toISOString(),
            blockNumber: poolState.blockNumber.toString(),
            volatility: volatilityScore,
            ilExposure: ilExposure.toString(),
            llmProvider: this.llmRouter.activeProvider,
            llmDecision,
            poolState,
        };
        const cid = await this.pinata.upload(auditPayload);
        log.info(`  → IPFS CID: ${cid}`);
        this.wsServer.broadcast({ type: "ipfs_cid", cid });
        // ── STEP 5: Sign the hook signal with ECDSA ────────────────────────────
        log.info("✍️  Step 5 — Signing agent signal...");
        const nonce = await this.poolReader.getAgentNonce(this.account.address);
        const signature = await this.signer.signSignal({
            poolId: poolKeyHash,
            feeBps: llmDecision.feeBps,
            volatility: volatilityScore,
            ilProtect: llmDecision.activateIL,
            ipfsCID: cid,
            nonce,
            chainId: this.chain.id,
        });
        // ── STEP 6: Submit signal to HookMindCore on-chain ─────────────────────
        log.info("⛓️  Step 6 — Submitting on-chain signal...");
        const HOOK_ABI = parseAbi([
            "function submitAgentSignal(tuple(address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks) key, uint24 newFeeBps, uint256 volatility, bool ilProtect, string ipfsCID, uint256 nonce, bytes signature) external",
        ]);
        const txHash = await this.walletClient.writeContract({
            address: hookAddress,
            abi: HOOK_ABI,
            functionName: "submitAgentSignal",
            args: [
                poolState.key,
                llmDecision.feeBps,
                BigInt(volatilityScore),
                llmDecision.activateIL,
                cid,
                nonce,
                signature,
            ],
        });
        log.info(`  ✅ Signal submitted! TxHash: ${txHash}`);
        this.wsServer.broadcast({ type: "tx_confirmed", txHash, cid });
    }
}
// ── Constants ────────────────────────────────────────────────────────────────
const AGENT_SYSTEM_PROMPT = `
You are a DeFi liquidity intelligence AI controlling a Uniswap v4 Hook via HookMind Protocol.
Your decisions directly update on-chain parameters for a live liquidity pool on Unichain.
You must analyze: pool volatility score (0-10000), impermanent loss exposure, and recent swap data.
Then respond ONLY with a valid JSON object in this exact schema:
{
  "feeBps":     <integer between 500 and 10000>,
  "activateIL": <boolean — true if IL exposure > 200 bps>,
  "reasoning":  "<1-sentence explanation>"
}
Principles:
- High volatility (>7000) → increase fee to protect LPs (up to 10000)
- Low volatility (<3000)  → decrease fee to attract volume (min 500)
- IL exposure >2%         → set activateIL: true
- Always prioritize LP capital protection over fee revenue.
`.trim();
function buildLLMMessage(
    poolState: any,
    volatility: number,
    ilExposure: bigint
): string {
    return JSON.stringify({
        currentFeeBps: poolState.currentFeeBps,
        volatilityScore: volatility,
        ilExposureBps: Number(ilExposure) / 100,
        recentSwapCount: poolState.recentSwapCount,
        liquidityDepth: poolState.liquidity.toString(),
        blockTimestamp: poolState.blockNumber.toString(),
    }, null, 2);
}
