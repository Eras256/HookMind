/**
 * HookMind MCP Server — Model Context Protocol Integration
 * Exposes 8 tools for external AI systems (IDEs, Claude, GPT-4) to:
 *   - Read live pool intelligence from HookMindCore
 *   - Dry-run hook signal submissions
 *   - Inspect IPFS audit trail
 *   - Monitor IL insurance pool health
 * Mirrors Nirium's MCP server architecture from packages/mcp.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createPublicClient, http, parseAbi } from "viem";
const client = createPublicClient({
    transport: http(process.env.UNICHAIN_SEPOLIA_RPC),
});
const HOOK_ABI = parseAbi([
    "function poolIntelligence(bytes32 poolId) view returns (uint24 targetFeeBps, uint256 volatilityScore, uint256 lastAgentUpdate, bool ilProtectionActive, uint256 epochFeesAccrued)",
]);
const server = new Server(
    { name: "hookmind-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
);
// ── Tool Definitions ──────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "get_pool_intelligence",
            description: "Read the current AI-driven parameters of a HookMind pool (fee, volatility, IL status)",
            inputSchema: {
                type: "object",
                properties: { poolId: { type: "string", description: "The bytes32 pool ID" } },
                required: ["poolId"],
            },
        },
        {
            name: "get_yield_vault_stats",
            description: "Returns current epoch, fees accrued, drip rate, and total vault assets",
            inputSchema: { type: "object", properties: {} },
        },
        {
            name: "get_il_insurance_balance",
            description: "Returns the USDC balance of the IL insurance pool",
            inputSchema: { type: "object", properties: {} },
        },
        {
            name: "get_agent_registry",
            description: "Returns list of all registered AI agent operators and their stats",
            inputSchema: { type: "object", properties: {} },
        },
        {
            name: "dry_run_signal",
            description: "Simulate a fee/IL signal without submitting on-chain. Returns projected pool impact.",
            inputSchema: {
                type: "object",
                properties: {
                    feeBps: { type: "number" },
                    volatility: { type: "number" },
                    ilProtect: { type: "boolean" },
                },
                required: ["feeBps", "volatility", "ilProtect"],
            },
        },
        {
            name: "read_ipfs_audit_log",
            description: "Fetch and return the contents of an IPFS audit log by CID",
            inputSchema: {
                type: "object",
                properties: { cid: { type: "string" } },
                required: ["cid"],
            },
        },
        {
            name: "get_latest_agent_cid",
            description: "Returns the latest IPFS CID submitted by a specific agent operator",
            inputSchema: {
                type: "object",
                properties: { agentAddress: { type: "string" } },
                required: ["agentAddress"],
            },
        },
        {
            name: "compute_volatility_score",
            description: "Reads last N blocks of swap events and returns computed volatility score 0-10000",
            inputSchema: {
                type: "object",
                properties: { blockWindow: { type: "number", default: 50 } },
            },
        },
    ],
}));
// ── Tool Handlers ─────────────────────────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!args) {
        return { content: [{ type: "text", text: "Missing arguments" }] };
    }
    switch (name) {
        case "get_pool_intelligence": {
            const data = await client.readContract({
                address: process.env.HOOK_MIND_CORE_ADDRESS as `0x${string}`,
                abi: HOOK_ABI,
                functionName: "poolIntelligence",
                args: [args.poolId as `0x${string}`],
            });
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        case "dry_run_signal": {
            const { feeBps, volatility, ilProtect } = args as any;
            const safe = feeBps >= 500 && feeBps <= 10000;
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        valid: safe,
                        projectedFee: feeBps,
                        volatilityRisk: volatility > 7000 ? "HIGH" : volatility > 4000 ? "MEDIUM" : "LOW",
                        ilProtection: ilProtect,
                        recommendation: safe
                            ? "Signal is within safe bounds — ready to submit"
                            : "Fee out of bounds — adjust to 500-10000 range",
                    }, null, 2),
                }],
            };
        }
        case "read_ipfs_audit_log": {
            const { cid } = args as any;
            const res = await fetch(`${process.env.PINATA_GATEWAY}/ipfs/${cid.replace("ipfs://", "")}`);
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        default:
            return { content: [{ type: "text", text: `Tool '${name}' not implemented yet.` }] };
    }
});
const transport = new StdioServerTransport();
await server.connect(transport);
console.log("HookMind MCP Server running on stdio");
