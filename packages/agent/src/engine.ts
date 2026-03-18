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
import { NeuralDataWorker } from "./worker/dataProcessor";
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
    private readonly dataWorker = new NeuralDataWorker();
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
        log.info("📡 Step 1 — Reading pool state & TWAP from Unichain...");
        const poolState = await this.poolReader.readPoolState(hookAddress, poolKeyHash);
        const twap = await this.poolReader.getTWAP(poolKeyHash);
        const history = await this.poolReader.getPriceHistory(poolKeyHash);
        
        // ── STEP 2: Statistical Volatility & Flash Loan Detection ──────────
        log.info("📊 Step 2 — Running Neural Data Worker (Variance + Guards)...");
        let analysis;
        try {
            analysis = this.dataWorker.prepareNeuralPayload(
                poolState.spotPrice, 
                twap, 
                history, 
                poolState
            );
        } catch (error: any) {
            log.error(`🛑 NEURAL GUARDRAIL: ${error.message}`);
            this.wsServer.broadcast({ 
                type: "guardrail_alert", 
                message: error.message 
            });
            return; // Abort cycle
        }

        const volatilityScore = analysis.volatilityScore;
        const ilExposure = this.ilMonitor.computeExposure(poolState);
        
        this.wsServer.broadcast({ type: "metrics", volatilityScore, ilExposure });
        log.info(`  → σ² Variance metrics processed. Score: ${volatilityScore}/10000`);

        // ── STEP 3: Query LLM for optimal hook parameters ──────────────────────
        log.info("🧠 Step 3 — Querying Neural Provider with Verified Data...");
        const llmDecision = await this.llmRouter.query({
            systemPrompt: AGENT_SYSTEM_PROMPT,
            userMessage: JSON.stringify(analysis.jsonPayload, null, 2),
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
        let cid = "ipfs://pending_testnet";
        try {
            cid = await this.pinata.upload(auditPayload);
            log.info(`  → IPFS CID: ${cid}`);
        } catch (err: any) {
            log.warn(`  → IPFS pinning failed (non-fatal): ${err.message}`);
        }
        this.wsServer.broadcast({ type: "ipfs_cid", cid });
        // ── STEP 5: Sign the hook signal with ECDSA ────────────────────────────
        log.info("✍️  Step 5 — Signing agent signal...");
        log.info(`  → Params: pool=${poolKeyHash}, fee=${llmDecision.feeBps}, IL=${llmDecision.activateIL}, chain=${this.chain.id}`);
        const signature = await this.signer.signSignal({
            poolId: poolKeyHash,
            fee: llmDecision.feeBps,
            ilProtect: llmDecision.activateIL,
            chainId: this.chain.id,
        });

        // ── STEP 6: Submit signal to HookMindCore on-chain (Asynchronous Update)
        log.info("⛓️  Step 6 — Submitting on-chain neural state update...");
        const HOOK_ABI = parseAbi([
            "function updateNeuralState((address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks) key, uint24 newFee, bool ilProtect, bytes signature) external",
        ]);
        const txHash = await this.walletClient.writeContract({
            address: hookAddress,
            abi: HOOK_ABI,
            functionName: "updateNeuralState",
            args: [
                poolState.key,
                llmDecision.feeBps,
                llmDecision.activateIL,
                signature,
            ],
        });
        log.info(`  ✅ Neural State Updated! TxHash: ${txHash}`);
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
    analysis: any,
    twap: number,
    ilExposure: bigint
): string {
    return JSON.stringify({
        marketCondition: {
            spotPrice: poolState.spotPrice,
            twap10m: twap,
            priceVariance: analysis.variance,
            volatilityScore: analysis.score,
            isStable: analysis.score < 3000
        },
        liquidity: {
            depth: poolState.liquidity.toString(),
            ilExposureBps: Number(ilExposure) / 100,
        },
        poolMetadata: {
            currentFeeBps: poolState.currentFeeBps,
            recentSwapCount: poolState.recentSwapCount,
            block: poolState.blockNumber.toString()
        }
    }, null, 2);
}
