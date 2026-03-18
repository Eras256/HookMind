"use client";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Book, Rocket, Layers, Code, Cpu, Workflow, Terminal, Zap, Package, DollarSign, Shield,
    CheckCircle2, Copy, ExternalLink, Activity
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

// ─────────────────────────────────────────────────────────────────────────────
// Sections
// ─────────────────────────────────────────────────────────────────────────────

function OverviewSection() {
    const { t } = useLanguage();
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Hero Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                    { label: t.docs.overview.version, value: "v1.0.0", color: "text-neural-cyan" },
                    { label: t.docs.overview.network, value: "Unichain", color: "text-neural-magenta" },
                    { label: t.docs.overview.hook_standard, value: "v4 ERC-7683", color: "text-purple-400" },
                    { label: t.docs.overview.agent_models, value: "5 Providers", color: "text-amber-400" },
                    { label: t.docs.overview.ipfs_audits, value: "100% Signed", color: "text-emerald-400" },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white/5 border border-white/10 rounded-xl p-4 ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-mono">{stat.label}</div>
                        <div className={`text-lg sm:text-xl font-black ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Executive Summary */}
            <div className="glass-card p-8">
                <h2 className="text-2xl font-black mb-4">{t.docs.overview.what_is}</h2>
                <p className="text-gray-400 leading-relaxed mb-6 font-mono text-sm">
                    {t.docs.overview.desc}
                </p>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neural-cyan mb-3">{t.docs.overview.problems_solved}</h3>
                <ul className="space-y-2 text-gray-300 font-mono text-sm list-disc list-inside">
                    <li>{t.docs.overview.static_fees} → <strong className="text-white">{t.docs.overview.dynamic_ai_fees}</strong> (500–10000 bps)</li>
                    <li>{t.docs.overview.il} → <strong className="text-white">{t.docs.overview.native_il_protection}</strong></li>
                    <li>{t.docs.overview.volatile_yield} → <strong className="text-white">{t.docs.overview.smooth_yield}</strong></li>
                </ul>
            </div>

            {/* How It Works */}
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { title: t.docs.overview.how_it_works.title_1, desc: t.docs.overview.how_it_works.desc_1, color: "#00F2FE" },
                    { title: t.docs.overview.how_it_works.title_2, desc: t.docs.overview.how_it_works.desc_2, color: "#FC72FF" },
                    { title: t.docs.overview.how_it_works.title_3, desc: t.docs.overview.how_it_works.desc_3, color: "#00FFA3" },
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
                <h2 className="text-2xl font-black mb-6">{t.docs.overview.revenue_title}</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { title: t.docs.overview.rev_card_1_title, price: t.docs.overview.rev_card_1_price, desc: t.docs.overview.rev_card_1_desc, border: "#FC72FF" },
                        { title: t.docs.overview.rev_card_2_title, price: t.docs.overview.rev_card_2_price, desc: t.docs.overview.rev_card_2_desc, border: "#00F2FE" },
                        { title: t.docs.overview.rev_card_3_title, price: t.docs.overview.rev_card_3_price, desc: t.docs.overview.rev_card_3_desc, border: "#00FFA3" },
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
                <h3 className="text-lg font-bold mb-4">{t.docs.overview.audited_actions_title}</h3>
                <table className="w-full text-left font-mono text-xs">
                    <thead>
                        <tr className="text-gray-500 border-b border-white/10 uppercase tracking-wider">
                            <th className="pb-3 pr-4">{t.agents.table_block}</th>
                            <th className="pb-3 pr-4">{t.agents.table_pool}</th>
                            <th className="pb-3 pr-4">{t.agents.table_action}</th>
                            <th className="pb-3 pr-4">Tx Hash</th>
                            <th className="pb-3 pr-4">{t.agents.table_status}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { tx: "0x4f2a...bd91", pool: "WETH/USDC", action: "submitAgentSignal(7200bps)", block: "1420271", status: "SUCCESS" },
                            { tx: "0x8a1c...e3f2", pool: "cbBTC/USDC", action: "triggerILProtection()", block: "1420268", status: "SUCCESS" },
                            { tx: "0x1d9b...a7c4", pool: "UNI/ETH", action: "submitAgentSignal(11200bps)", block: "1420260", status: "REVERT (GUARDRAIL)" },
                        ].map((row, i) => (
                            <tr key={i} className="border-b border-white/3">
                                <td className="py-3 pr-4 text-gray-400">{row.block}</td>
                                <td className="py-3 pr-4 text-white">{row.pool}</td>
                                <td className="py-3 pr-4 text-gray-500 text-[10px]">{row.action}</td>
                                <td className="py-3 pr-4 text-neural-cyan truncate max-w-[80px]">{row.tx}</td>
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
    const { t } = useLanguage();
    const steps = [
        {
            title: t.docs.quickstart.step_1,
            content: <CodeSnippet code={`git clone https://github.com/Eras256/HookMind\ncd HookMind && pnpm install`} />
        },
        {
            title: t.docs.quickstart.step_2,
            content: (
                <CodeSnippet code={`# packages/agent/.env\nUNICHAIN_RPC=https://mainnet.unichain.org\nAGENT_PRIVATE_KEY=0x...\nANTHROPIC_API_KEY=sk-ant-...\nPINATA_JWT=eyJ...\nHOOKMIND_CORE=0x...   # HookMindCore.sol\nAGENT_REGISTRY=0x...  # AgentRegistry.sol`} lang="env" />
            )
        },
        {
            title: t.docs.quickstart.step_3,
            content: (
                <div className="text-sm font-mono text-gray-400 mt-2">
                    {t.docs.quickstart.step_3_desc.split('→').map((part, i) => (
                        <span key={i}>
                            {part}
                            {i < t.docs.quickstart.step_3_desc.split('→').length - 1 && <strong className="text-white bg-white/10 px-1 rounded">/agents</strong>}
                        </span>
                    ))}<br />
                    <CodeSnippet code={`npx hookmind-cli register-node --network unichain`} />
                </div>
            )
        },
        {
            title: t.docs.quickstart.step_4,
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
            title: t.docs.quickstart.step_5,
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
    const { t } = useLanguage();
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="flex flex-col gap-6 relative">
                <div className="absolute left-6 top-6 bottom-6 w-px bg-white/10 -z-10 hidden md:block" />
                {[
                    { color: "border-cyan-500", text: "text-cyan-400", title: t.docs.architecture.layer_1_title, desc: t.docs.architecture.layer_1_desc },
                    { color: "border-fuchsia-500", text: "text-fuchsia-400", title: t.docs.architecture.layer_2_title, desc: t.docs.architecture.layer_2_desc },
                    { color: "border-purple-500", text: "text-purple-400", title: t.docs.architecture.layer_3_title, desc: t.docs.architecture.layer_3_desc },
                    { color: "border-emerald-500", text: "text-emerald-400", title: t.docs.architecture.layer_4_title, desc: t.docs.architecture.layer_4_desc },
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
                <h3 className="text-lg font-bold mb-6">{t.docs.architecture.flow_title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { tag: "01", text: t.docs.architecture.flow_1 },
                        { tag: "02", text: t.docs.architecture.flow_2 },
                        { tag: "03", text: t.docs.architecture.flow_3 },
                        { tag: "04", text: t.docs.architecture.flow_4 },
                    ].map((step, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl relative">
                            <div className="text-neural-cyan font-mono font-bold mb-2">{step.tag}</div>
                            <div className="text-xs text-gray-400 font-mono">{step.text}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4">{t.docs.architecture.monorepo_title}</h3>
                <pre className="text-xs font-mono bg-void p-4 rounded-xl border border-white/10 text-gray-500 leading-relaxed">
                    . <br />
                    ├── apps/ <br />
                    │   └── <span className="text-emerald-400">web/                 # Next.js 15 App ({t.nav.home} Dashboard)</span> <br />
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
    const { t } = useLanguage();
    const contracts = [
        {
            name: "HookMindCore.sol",
            desc: t.docs.contracts.core_desc,
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
            name: "AgentRegistry.sol", desc: t.docs.contracts.registry_desc, color: "border-[#FC72FF]",
            details: <CodeSnippet lang="solidity" code={`mapping(address => AgentInfo) public agents;\n// { isActive, signalCount, lastCid, stakedAmount }`} />
        },
        {
            name: "YieldVault.sol", desc: t.docs.contracts.vault_desc, color: "border-[#00FFA3]",
            details: <div className="text-sm font-mono text-gray-400">drip_rate = pendingFees / 7 days<br />claimable = min(accrued, elapsed * drip_rate)</div>
        },
        {
            name: "ILInsurance.sol", desc: t.docs.contracts.insurance_desc, color: "border-purple-500",
            details: <CodeSnippet lang="solidity" code={`function claimInsurance(address lp) external { ... }`} />
        },
        {
            name: "HookMindFees.sol", desc: t.docs.contracts.fees_desc, color: "border-amber-500",
            details: <div className="text-sm font-mono text-gray-400">90% Treasury, 10% Protocol Development.</div>
        }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {contracts.map((c, i) => (
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
    const { t } = useLanguage();
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
    const { t } = useLanguage();
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
    const { t } = useLanguage();
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
                {TOOLS.map((tool, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <div className="font-mono font-bold text-neural-magenta mb-2">{tool.name}</div>
                        <div className="text-xs text-neural-cyan font-mono mb-2">Params: {tool.params}</div>
                        <div className="text-xs text-gray-400">{tool.desc}</div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function SdkSection() {
    const { t } = useLanguage();
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
    const { t } = useLanguage();
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-card p-6">
                <h2 className="text-xl font-black mb-4 flex items-center gap-2"><DollarSign className="text-amber-400" /> HookMindFees.sol</h2>
                <p className="text-gray-400 mb-6 text-sm">{t.docs.overview.rev_card_1_desc}</p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-amber-500/30 p-5 rounded-xl">
                        <h3 className="font-bold text-amber-400 mb-2">{t.docs.overview.rev_card_1_title}</h3>
                        <div className="text-2xl font-black text-white mb-2">{t.docs.overview.rev_card_1_price}</div>
                        <p className="text-xs text-gray-500 font-mono">{t.docs.overview.rev_card_1_desc}</p>
                    </div>
                    <div className="bg-white/5 border border-emerald-500/30 p-5 rounded-xl">
                        <h3 className="font-bold text-emerald-400 mb-2">{t.docs.overview.rev_card_2_title}</h3>
                        <div className="text-2xl font-black text-white mb-2">{t.docs.overview.rev_card_2_price}</div>
                        <p className="text-xs text-gray-500 font-mono">{t.docs.overview.rev_card_2_desc}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SecuritySection() {
    const { t } = useLanguage();
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
                <h3 className="font-bold text-lg mb-4 text-neural-red flex items-center gap-2"><Shield /> {t.docs.security.threat_matrix}</h3>
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
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTabId = searchParams.get("tab") || "overview";

    const TABS = useMemo(() => [
        { id: "overview", label: t.docs.tabs.overview, icon: Book },
        { id: "quickstart", label: t.docs.tabs.quickstart, icon: Rocket },
        { id: "architecture", label: t.docs.tabs.architecture, icon: Layers },
        { id: "contracts", label: t.docs.tabs.contracts, icon: Code },
        { id: "agent", label: t.docs.tabs.agent, icon: Cpu },
        { id: "builder", label: t.docs.tabs.builder, icon: Workflow },
        { id: "api", label: t.docs.tabs.api, icon: Terminal },
        { id: "mcp", label: t.docs.tabs.mcp, icon: Package },
        { id: "sdk", label: t.docs.tabs.sdk, icon: Zap },
        { id: "fees", label: t.docs.tabs.fees, icon: DollarSign },
        { id: "security", label: t.docs.tabs.security, icon: Shield },
    ], [t]);

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
            case "builder": return <div className="glass-card p-10 text-center"><Workflow className="mx-auto text-neural-magenta mb-4" size={48} /><h2 className="text-xl font-bold">{t.docs.builder.title}</h2><Link href="/builder" className="inline-block mt-4 px-6 py-2 bg-neural-magenta text-black font-bold rounded-lg hover:scale-105 transition-transform">{t.docs.builder.button}</Link></div>;
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
                        {t.docs.hero_badge}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
                        {TABS.find(tab => tab.id === activeTabId)?.label}
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
