"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Book, Rocket, Layers, Code, Cpu, Workflow, Terminal, Zap, Package, DollarSign, Shield,
    CheckCircle2, Copy, ExternalLink, Activity
} from "lucide-react";
import { toast } from "sonner";

const TABS = [
    { id: "overview", label: "Overview", icon: Book },
    { id: "quickstart", label: "Quick Start", icon: Rocket },
    { id: "architecture", label: "Architecture", icon: Layers },
    { id: "contracts", label: "Contracts", icon: Code },
    { id: "agent", label: "Agent Daemon", icon: Cpu },
    { id: "builder", label: "Hook Builder", icon: Workflow },
    { id: "api", label: "API & Webhooks", icon: Terminal },
    { id: "mcp", label: "MCP Tools", icon: Zap },
    { id: "sdk", label: "TypeScript SDK", icon: Package },
    { id: "fees", label: "Fee System", icon: DollarSign },
    { id: "security", label: "Security", icon: Shield },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sections
// ─────────────────────────────────────────────────────────────────────────────

function OverviewSection() {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Hero Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                    { label: "Version", value: "v1.0.0", color: "text-neural-cyan" },
                    { label: "Network", value: "Unichain", color: "text-neural-magenta" },
                    { label: "Hook Standard", value: "v4 ERC-7683", color: "text-purple-400" },
                    { label: "Agent Models", value: "5 Providers", color: "text-amber-400" },
                    { label: "IPFS Audits", value: "100% Signed", color: "text-emerald-400" },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white/5 border border-white/10 rounded-xl p-4 ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-mono">{stat.label}</div>
                        <div className={`text-lg sm:text-xl font-black ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Executive Summary */}
            <div className="glass-card p-8">
                <h2 className="text-2xl font-black mb-4">What is HookMind?</h2>
                <p className="text-gray-400 leading-relaxed mb-6 font-mono text-sm">
                    HookMind is the first Autonomous AI Agent Mesh that controls Uniswap v4 Hooks on Unichain in real time.
                    Every AI decision is ECDSA-signed by the Agent EOA, pinned immutably to IPFS via Pinata, and executed
                    on-chain via HookMindCore.sol — creating a fully auditable, unstoppable DeFi intelligence layer.
                </p>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neural-cyan mb-3">Three Problems Solved:</h3>
                <ul className="space-y-2 text-gray-300 font-mono text-sm list-disc list-inside">
                    <li>Static Fees → <strong className="text-white">Dynamic AI Fees</strong> (500–10000 bps, real-time)</li>
                    <li>Impermanent Loss → <strong className="text-white">Native IL Protection + Insurance</strong> (CCTP)</li>
                    <li>Volatile Yield → <strong className="text-white">Smooth Yield</strong> via ERC-4626 7-day Epoch Drip</li>
                </ul>
            </div>

            {/* How It Works */}
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { title: "Off-Chain Intelligence", desc: "Agent reads Unichain blocks, calls LLM (Claude/GPT/Grok), gets fee recommendation as JSON.", color: "#00F2FE" },
                    { title: "Immutable Audit Trail", desc: "Decision pinned to IPFS via Pinata before any on-chain action. Anyone can verify.", color: "#FC72FF" },
                    { title: "On-Chain Execution", desc: "Agent signs ECDSA, calls submitAgentSignal() on HookMindCore.sol. Hook applies new fee.", color: "#00FFA3" },
                ].map((step, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-[0.02] rounded-bl-full" style={{ backgroundColor: step.color }} />
                        <div className="text-4xl font-black opacity-20 mb-2 font-mono" style={{ color: step.color }}>0{i + 1}</div>
                        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                        <p className="text-sm text-gray-400 font-mono leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>

            {/* Business Model */}
            <div>
                <h2 className="text-2xl font-black mb-6">Protocol Revenue</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { title: "Per-Agent License", price: "5 USDC / ~100 MXN", desc: "One-time fee paid to HookMindFees.sol. 90% Treasury, 10% Dev.", border: "#FC72FF" },
                        { title: "Signal Commission", price: "1% of Marketplace", desc: "Operators sell their AI signals. HookMind auto-deducts 1%.", border: "#00F2FE" },
                        { title: "B2B API Access", price: "Custom Pricing", desc: "Webhook subscriptions, MCP server access, bulk signal feeds.", border: "#00FFA3" },
                    ].map((card, i) => (
                        <div key={i} className="bg-white/5 border-l-4 rounded-xl p-6" style={{ borderLeftColor: card.border }}>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-1">{card.title}</h3>
                            <div className="text-xl font-black text-white mb-2">{card.price}</div>
                            <p className="text-xs text-gray-500 font-mono">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Verified Actions */}
            <div className="glass-card p-6 overflow-x-auto">
                <h3 className="text-lg font-bold mb-4">Live Audited Actions</h3>
                <table className="w-full text-left font-mono text-xs">
                    <thead>
                        <tr className="text-gray-500 border-b border-white/10 uppercase tracking-wider">
                            <th className="pb-3 pr-4">Tx Hash</th>
                            <th className="pb-3 pr-4">Pool</th>
                            <th className="pb-3 pr-4">Action</th>
                            <th className="pb-3 pr-4">Block</th>
                            <th className="pb-3 pr-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { tx: "0x4f2a...bd91", pool: "WETH/USDC", action: "submitAgentSignal(7200bps)", block: "1420271", status: "SUCCESS" },
                            { tx: "0x8a1c...e3f2", pool: "cbBTC/USDC", action: "triggerILProtection()", block: "1420268", status: "SUCCESS" },
                            { tx: "0x1d9b...a7c4", pool: "UNI/ETH", action: "submitAgentSignal(11200bps)", block: "1420260", status: "REVERT (GUARDRAIL)" },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-white/3">
                                <td className="py-3 pr-4 text-neural-cyan">{row.tx}</td>
                                <td className="py-3 pr-4 text-white">{row.pool}</td>
                                <td className="py-3 pr-4 text-gray-400">{row.action}</td>
                                <td className="py-3 pr-4 text-gray-500">{row.block}</td>
                                <td className={`py-3 pr-4 ${row.status.includes("REVERT") ? "text-red-400" : "text-emerald-400"}`}>{row.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 text-[10px] text-gray-500 font-mono text-right">Agent EOA: 0xA3b4...F21c</div>
            </div>
        </motion.div>
    );
}

function CodeSnippet({ code, lang = "bash" }: { code: string; lang?: string }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        toast.success("Copied to clipboard");
    };
    return (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-void mt-3 font-mono text-xs">
            <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-gray-500">{lang}</span>
                <button onClick={handleCopy} className="text-gray-500 hover:text-white transition-colors">
                    <Copy size={14} />
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-gray-300">
                <code>{code}</code>
            </pre>
        </div>
    );
}

function QuickstartSection() {
    const steps = [
        {
            title: "Clone & Install",
            content: <CodeSnippet code={`git clone https://github.com/Eras256/HookMind\ncd HookMind && pnpm install`} />
        },
        {
            title: "Configure Environment",
            content: (
                <CodeSnippet code={`# packages/agent/.env\nUNICHAIN_RPC=https://mainnet.unichain.org\nAGENT_PRIVATE_KEY=0x...\nANTHROPIC_API_KEY=sk-ant-...\nPINATA_JWT=eyJ...\nHOOKMIND_CORE=0x...   # HookMindCore.sol\nAGENT_REGISTRY=0x...  # AgentRegistry.sol`} lang="env" />
            )
        },
        {
            title: "Pay Deployment License (100 MXN)",
            content: (
                <div className="text-sm font-mono text-gray-400 mt-2">
                    Go to <strong className="text-white bg-white/10 px-1 rounded">/agents</strong> → Click "Deploy New Agent" → Pay 5 USDC<br />
                    or use CLI:
                    <CodeSnippet code={`npx hookmind-cli register-node --network unichain`} />
                </div>
            )
        },
        {
            title: "Start the Agent Daemon",
            content: (
                <>
                    <CodeSnippet code={`pnpm --filter @hookmind/agent dev`} />
                    <pre className="text-[10px] text-gray-500 font-mono mt-2 bg-black/50 p-3 rounded-xl border border-white/5 uppercase">
                        [ENGINE] 🟢 Agent daemon started. Watching Unichain...<br />
                        [BLOCK 1420271] ETH/USDC volatility: 7840 → Adjusting fee...
                    </pre>
                </>
            )
        },
        {
            title: "Launch the Frontend",
            content: (
                <CodeSnippet code={`pnpm --filter @hookmind/web dev\n# Open http://localhost:3000\n# Connect RainbowKit wallet to monitor the Dashboard`} />
            )
        }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 relative">
            <div className="absolute left-6 top-6 bottom-6 w-px bg-white/10 -z-10" />
            {steps.map((step, i) => (
                <div key={i} className="flex gap-6">
                    <div className="w-12 h-12 rounded-full bg-void border border-neural-cyan flex items-center justify-center font-mono font-bold text-neural-cyan shrink-0">
                        0{i + 1}
                    </div>
                    <div className="flex-1 pt-3 pb-8">
                        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                        {step.content}
                    </div>
                </div>
            ))}
        </motion.div>
    );
}

function ArchitectureSection() {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="flex flex-col gap-6 relative">
                <div className="absolute left-6 top-6 bottom-6 w-px bg-white/10 -z-10 hidden md:block" />
                {[
                    { color: "border-cyan-500", text: "text-cyan-400", title: "Capa 1: Off-Chain Neural Mesh", desc: "ElizaOS-inspired engine. Reads Unichain blocks via viem publicClient. Computes volatility score (0–10000) and IL exposure. Routes to LLM (Claude/GPT/Grok/Gemini/Ollama) which responds with strict JSON." },
                    { color: "border-fuchsia-500", text: "text-fuchsia-400", title: "Capa 2: Immutable Audit Layer", desc: "JSON response is serialized and pinned to IPFS via Pinata SDK. Returns a CID (Content Identifier) — the immutable proof of AI reasoning. CID is stored in AgentRegistry.sol." },
                    { color: "border-purple-500", text: "text-purple-400", title: "Capa 3: ECDSA Signature Layer", desc: "Agent private key signs: hash(fee_bps | il_flag | cid | nonce | poolId). Signature is SECP256K1. Recoverable address must match registry entry. Prevents unauthorized manipulation." },
                    { color: "border-emerald-500", text: "text-emerald-400", title: "Capa 4: Uniswap v4 Hook Execution", desc: "submitAgentSignal() validates signature + nonce + guardrails (500→10000). Updates dynamicFee in beforeSwap hook. Emits AgentSignalExecuted event for frontend WebSocket." },
                ].map((layer, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-6">
                        <div className={`w-12 h-12 rounded-xl bg-black border-2 flex items-center justify-center font-bold font-mono shrink-0 ml-0 md:ml-0.5 ${layer.color} ${layer.text}`}>
                            L{i + 1}
                        </div>
                        <div className={`glass-card p-6 flex-1 border-l-4`} style={{ borderLeftColor: layer.text }}>
                            <h3 className={`font-bold mb-2 ${layer.text}`}>{layer.title}</h3>
                            <p className="text-gray-400 text-sm font-mono leading-relaxed">{layer.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-6">Execution Flow E2E</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { tag: "01", text: "Block Detected: Agent reads Unichain N+1" },
                        { tag: "02", text: "AI Decides: LLM outputs fee_bps = 7200" },
                        { tag: "03", text: "IPFS Pinned: Decision audited, CID=QmX..." },
                        { tag: "04", text: "Hook Updated: submitAgentSignal() executed" },
                    ].map((step, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl relative">
                            <div className="text-neural-cyan font-mono font-bold mb-2">{step.tag}</div>
                            <div className="text-xs text-gray-400 font-mono">{step.text}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4">Monorepo Structure</h3>
                <pre className="text-xs font-mono bg-void p-4 rounded-xl border border-white/10 text-gray-500 leading-relaxed">
                    . <br />
                    ├── apps/ <br />
                    │   └── <span className="text-emerald-400">web/                 # Next.js 15 App (Neural Dashboard)</span> <br />
                    └── packages/ <br />
                    &nbsp;&nbsp;&nbsp; ├── <span className="text-cyan-400">contracts/           # Solidity Foundry (Uniswap v4 Hooks)</span> <br />
                    &nbsp;&nbsp;&nbsp; ├── <span className="text-fuchsia-400">agent/               # Node.js Daemon (Execution Engine)</span> <br />
                    &nbsp;&nbsp;&nbsp; ├── <span className="text-purple-400">mcp/                 # Model Context Protocol Server</span> <br />
                    &nbsp;&nbsp;&nbsp; └── <span className="text-blue-400">sdk/                 # TypeScript Web3 SDK</span>
                </pre>
            </div>
        </motion.div>
    );
}

function ContractsSection() {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {[
                {
                    name: "HookMindCore.sol",
                    desc: "The central Uniswap v4 hook. Accepts AI signals, applies dynamic fees.",
                    color: "border-[#00F2FE]",
                    details: (
                        <>
                            <table className="w-full text-left font-mono text-xs mb-4">
                                <thead><tr className="text-gray-500 border-b border-white/10"><th className="pb-2">Function</th><th className="pb-2">Point</th><th className="pb-2">Description</th></tr></thead>
                                <tbody>
                                    <tr className="border-b border-white/3"><td className="py-2 text-neural-cyan">beforeSwap</td><td className="py-2 text-white">beforeSwap</td><td className="py-2 text-gray-400">Applies dynamic AI fee</td></tr>
                                    <tr className="border-b border-white/3"><td className="py-2 text-neural-cyan">afterSwap</td><td className="py-2 text-white">afterSwap</td><td className="py-2 text-gray-400">Extracts fee to YieldVault</td></tr>
                                    <tr className="border-b border-white/3"><td className="py-2 text-neural-magenta">submitAgentSignal</td><td className="py-2 text-white">External</td><td className="py-2 text-gray-400">Authorized EOA signature execution</td></tr>
                                </tbody>
                            </table>
                            <CodeSnippet lang="solidity" code={`require(fee_bps >= MIN_FEE && fee_bps <= MAX_FEE, "Fee out of range");\nrequire(ecrecover(msgHash, v, r, s) == registry.agents(signal.agentId), "Invalid sig");\nrequire(signal.nonce == nonces[agentId]++, "Replay attack detected");`} />
                        </>
                    )
                },
                {
                    name: "AgentRegistry.sol", desc: "RBAC contract mapping EOA → Agent Info", color: "border-[#FC72FF]",
                    details: <CodeSnippet lang="solidity" code={`mapping(address => AgentInfo) public agents;\n// { isActive, signalCount, lastCid, stakedAmount }`} />
                },
                {
                    name: "YieldVault.sol", desc: "ERC-4626 vault distributing swap fees over 7-day epochs.", color: "border-[#00FFA3]",
                    details: <div className="text-sm font-mono text-gray-400">drip_rate = pendingFees / 7 days<br />claimable = min(accrued, elapsed * drip_rate)</div>
                },
                {
                    name: "ILInsurance.sol", desc: "Compensates LPs up to 500 USDC on >2% IL using Circle CCTP.", color: "border-purple-500",
                    details: <CodeSnippet lang="solidity" code={`function claimInsurance(address lp) external { ... }`} />
                },
                {
                    name: "HookMindFees.sol", desc: "Handles agent license payments (5 USDC) and marketplace cuts.", color: "border-amber-500",
                    details: <div className="text-sm font-mono text-gray-400">90% Treasury, 10% Protocol Development.</div>
                }
            ].map((c, i) => (
                <div key={i} className={`glass-card p-6 border-l-4`} style={{ borderLeftColor: c.color.replace("border-[", "").replace("]", "") }}>
                    <h3 className="font-bold font-mono text-lg mb-2">{c.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{c.desc}</p>
                    {c.details}
                </div>
            ))}
        </motion.div>
    );
}

function AgentSection() {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="font-bold text-lg mb-4">Daemon Architecture</h3>
                    <pre className="text-xs font-mono bg-void p-4 rounded-xl border border-white/10 text-gray-500 leading-relaxed overflow-x-auto">
                        packages/agent/src/ <br />
                        ├── <span className="text-neural-magenta">engine.ts</span>           <span className="text-white/30">← Main daemon loop</span><br />
                        ├── services/ <br />
                        │   ├── <span className="text-neural-cyan">volatilityService.ts</span>  <span className="text-white/30">← Math: σ = std(p)</span><br />
                        │   ├── <span className="text-neural-cyan">ilService.ts</span>          <span className="text-white/30">← √(P1/P0) IL</span><br />
                        │   ├── <span className="text-neural-green">llmRouter.ts</span>          <span className="text-white/30">← Multi-provider dispatcher</span><br />
                        │   └── ipfsService.ts<br />
                        └── server.ts                 <span className="text-white/30">← Express API server</span>
                    </pre>
                </div>

                <div className="glass-card p-6">
                    <h3 className="font-bold text-lg mb-4">Engine Loop (Every 12s)</h3>
                    <ol className="list-decimal list-inside text-xs font-mono text-gray-400 space-y-2">
                        <li><span className="text-white">readBlock()</span> → Unichain txs</li>
                        <li><span className="text-neural-cyan">computeVolatility()</span> → Price impact std</li>
                        <li><span className="text-neural-cyan">computeIL()</span> → Entry vs Current price</li>
                        <li><span className="text-neural-magenta">callLLM()</span> → Context injected</li>
                        <li><span className="text-emerald-400">pinToIPFS()</span> → Upload reasoning JSON</li>
                        <li><span className="text-purple-400">signECDSA()</span> → EOA wallet sig</li>
                        <li><span className="text-white">submitSignal()</span> → HookMindCore TX</li>
                    </ol>
                </div>
            </div>

            <div className="glass-card p-6">
                <h3 className="font-bold text-lg mb-4">Core Prompt Template</h3>
                <CodeSnippet lang="text" code={`You are HookMind, an autonomous DeFi agent controlling Uniswap v4 hooks on Unichain.
Current pool: {pool}. Volatility score: {vol}/10000. IL exposure: {il}%. Last fee: {lastFee} bps.

Rules: fee MUST be between 500 and 10000 bps. If vol > 7000, increase fee. 
If IL > 2%, set il_protect=true. 

Respond ONLY in JSON:
{ "fee_bps": number, "il_protect": boolean, "reasoning": string }`} />
            </div>
        </motion.div>
    );
}

function ApiSection() {
    const ENDPOINTS = [
        { method: "GET", path: "/health", desc: "Agent daemon health check" },
        { method: "POST", path: "/api/auth/keys", desc: "Generate API key" },
        { method: "GET", path: "/api/pools/:id/state", desc: "Current fee + IL status of pool" },
        { method: "POST", path: "/api/signals/submit", desc: "Submit agent signal manually" },
        { method: "GET", path: "/api/audit/:cid", desc: "Fetch IPFS audit log by CID" },
        { method: "POST", path: "/api/webhooks", desc: "Register webhook endpoint" },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-card p-6">
                <h3 className="font-bold text-lg mb-4">REST API Reference</h3>
                <table className="w-full text-left font-mono text-xs">
                    <thead><tr className="text-gray-500 border-b border-white/10"><th className="pb-2">Method</th><th className="pb-2">Endpoint</th><th className="pb-2">Description</th></tr></thead>
                    <tbody>
                        {ENDPOINTS.map((e, i) => (
                            <tr key={i} className="border-b border-white/3">
                                <td className="py-2 pr-4">
                                    <span className={`px-2 py-0.5 rounded font-bold ${e.method === "GET" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>{e.method}</span>
                                </td>
                                <td className="py-2 pr-4 text-white">{e.path}</td>
                                <td className="py-2 pr-4 text-gray-500">{e.desc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="font-bold text-sm mb-4">Webhook Payload</h3>
                    <CodeSnippet lang="json" code={`{\n  "event": "GUARDRAIL_REJECTED",\n  "pool": "WETH/USDC",\n  "proposed_fee": 11200,\n  "block": 1420271,\n  "agent_eoa": "0xA3b4...F21c"\n}`} />
                </div>
                <div className="glass-card p-6">
                    <h3 className="font-bold text-sm mb-4">HMAC-SHA256 Verification</h3>
                    <CodeSnippet lang="javascript" code={`const isValid = crypto\n  .createHmac('sha256', webhookSecret)\n  .update(rawBody)\n  .digest('hex') === req.headers['x-hookmind-signature'];`} />
                </div>
            </div>
        </motion.div>
    );
}

function McpSection() {
    const TOOLS = [
        { name: "get_pool_intelligence", desc: "Returns current dynamic fee, volatility score, and IL exposure", params: "poolId: string" },
        { name: "get_agent_status", desc: "Agent uptime, nonces burned, last block", params: "—" },
        { name: "dry_run_signal", desc: "Simulates signal without on-chain execution", params: "poolId, fee_bps, il_protect" },
        { name: "read_ipfs_audit_log", desc: "Fetches AI reasoning JSON from IPFS", params: "cid: string" },
        { name: "list_active_pools", desc: "Returns all HookMind managed pools", params: "—" },
        { name: "get_vault_state", desc: "ERC-4626 epoch status, drip rate", params: "epochId?: number" },
        { name: "list_operator_nodes", desc: "Leaderboard of authorized operators", params: "—" },
        { name: "submit_manual_signal", desc: "Submit signal (requires JWT)", params: "poolId, fee, jwt" },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-neural-magenta/10 border border-neural-magenta/30 p-4 rounded-xl text-sm text-neural-magenta font-mono mb-6">
                Model Context Protocol (MCP) allows external AIs (Claude Desktop, Cursor IDE) to interact directly with the HookMind agent daemon securely.
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {TOOLS.map((t, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <div className="font-mono font-bold text-neural-magenta mb-2">{t.name}</div>
                        <div className="text-xs text-neural-cyan font-mono mb-2">Params: {t.params}</div>
                        <div className="text-xs text-gray-400">{t.desc}</div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function SdkSection() {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-card p-6">
                <h3 className="font-bold mb-4">TypeScript SDK</h3>
                <CodeSnippet lang="bash" code={`pnpm install @hookmind/sdk`} />
                <CodeSnippet lang="typescript" code={`import { HookMindClient, useAgentStream } from '@hookmind/sdk';\n\nconst client = new HookMindClient({ baseUrl: 'http://localhost:3001' });\nconst data = await client.getPoolIntelligence('WETH/USDC');\nconsole.log(data.fee_bps); // 7200\n\n// React WS Hook\nconst { events } = useAgentStream({ url: 'ws://localhost:3001/ws' });`} />
            </div>
            <div className="glass-card p-6">
                <h3 className="font-bold mb-4">Python SDK</h3>
                <CodeSnippet lang="bash" code={`pip install hookmind-sdk`} />
                <CodeSnippet lang="python" code={`from hookmind import HookMindClient\nclient = HookMindClient(api_key="hm_sk_...")\nstate = client.get_pool_state("WETH/USDC")`} />
            </div>
        </motion.div>
    );
}

function FeesSection() {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-card p-6">
                <h2 className="text-xl font-black mb-4 flex items-center gap-2"><DollarSign className="text-amber-400" /> HookMindFees.sol</h2>
                <p className="text-gray-400 mb-6 text-sm">A centralized fee distributor contract managing all protocol revenue streams.</p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-amber-500/30 p-5 rounded-xl">
                        <h3 className="font-bold text-amber-400 mb-2">Agent Deployment License</h3>
                        <div className="text-2xl font-black text-white mb-2">5 USDC</div>
                        <p className="text-xs text-gray-500 font-mono">Paid once per new EOA operator node registered to the network.</p>
                    </div>
                    <div className="bg-white/5 border border-emerald-500/30 p-5 rounded-xl">
                        <h3 className="font-bold text-emerald-400 mb-2">Signal Marketplace</h3>
                        <div className="text-2xl font-black text-white mb-2">1% Cut</div>
                        <p className="text-xs text-gray-500 font-mono">Commission deducted automatically on peer-to-peer strategy/signal subscriptions.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SecuritySection() {
    const MATRIX = [
        { v: "Unauthorized Fee Changes", p: "ECDSA logic inside smart contract. Only registered agent EOAs can submitAgentSignal()" },
        { v: "Replay Attacks", p: "Atomic on-chain nonce per agent. Signatures instantly become invalid after use." },
        { v: "Out-of-Range Fees", p: "Solidity Guardrails: require(fee >= 500 && fee <= 10000)" },
        { v: "Malicious LLM Output", p: "JSON strict parsing + schema validation before wallet signing." },
        { v: "MEV on Fee Adjustments", p: "Flash Accounting (EIP-1153): fees take effect next block, preventing sandwiching." },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-card p-6">
                <h3 className="font-bold text-lg mb-4 text-neural-red flex items-center gap-2"><Shield /> Threat Matrix</h3>
                <table className="w-full text-left font-mono text-xs border border-white/10 rounded-lg overflow-hidden block">
                    <tbody>
                        {MATRIX.map((m, i) => (
                            <tr key={i} className="border-b border-white/5 bg-white/2">
                                <td className="p-3 w-1/3 text-neural-red font-bold border-r border-white/5">{m.v}</td>
                                <td className="p-3 text-emerald-400">{m.p}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Shell
// ─────────────────────────────────────────────────────────────────────────────

function DocsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTabId = searchParams.get("tab") || "overview";

    const setTab = (id: string) => {
        router.push(`/docs?tab=${id}`, { scroll: false });
    };

    const renderContent = () => {
        switch (activeTabId) {
            case "overview": return <OverviewSection />;
            case "quickstart": return <QuickstartSection />;
            case "architecture": return <ArchitectureSection />;
            case "contracts": return <ContractsSection />;
            case "agent": return <AgentSection />;
            case "builder": return <div className="glass-card p-10 text-center"><Workflow className="mx-auto text-neural-magenta mb-4" size={48} /><h2 className="text-xl font-bold">See Interactive Hook Builder</h2><Link href="/builder" className="inline-block mt-4 px-6 py-2 bg-neural-magenta text-black font-bold rounded-lg hover:scale-105 transition-transform">Go to Builder</Link></div>;
            case "api": return <ApiSection />;
            case "mcp": return <McpSection />;
            case "sdk": return <SdkSection />;
            case "fees": return <FeesSection />;
            case "security": return <SecuritySection />;
            default: return <OverviewSection />;
        }
    };

    return (
        <div className="pt-24 px-5 max-w-7xl mx-auto pb-24 flex gap-8 flex-col lg:flex-row items-start relative">

            {/* Sidebar Navigation */}
            <div className="w-full lg:w-64 shrink-0 lg:sticky top-28 overflow-x-auto lg:overflow-visible">
                <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0 pb-4 lg:pb-0">
                    {TABS.map((tab) => {
                        const active = activeTabId === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-sm font-semibold transition-all text-left
                  ${active ? "bg-neural-cyan/10 text-neural-cyan border border-neural-cyan/30" : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"}`}
                            >
                                <Icon size={16} className={active ? "text-neural-cyan" : "text-gray-500"} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 neon-badge mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-neural-cyan animate-pulse" />
                        PROTOCOL DOCUMENTATION
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
                        {TABS.find(t => t.id === activeTabId)?.label}
                    </h1>
                </div>

                <AnimatePresence mode="wait">
                    <div key={activeTabId}>
                        {renderContent()}
                    </div>
                </AnimatePresence>
            </div>

        </div>
    );
}

export default function DocsPage() {
    return (
        <Suspense fallback={<div className="pt-32 text-center text-gray-500 font-mono">Loading documentation...</div>}>
            <DocsContent />
        </Suspense>
    );
}
