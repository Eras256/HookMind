"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, Download, Globe } from "lucide-react";
import { toast } from "sonner";

const TABS = ["All Plugins", "Data & Oracles", "Risk & Defense", "Yield & Vault", "Notifications", "Installed (3)"];

const PLUGINS = [
    { id: "pyth-oracle", name: "Pyth Network Oracle", category: "Data & Oracles", version: "v2.1.0", author: "Pyth Network", description: "Real-time price feeds for 100+ assets. Sub-second latency. Used for volatility scoring.", tags: ["Oracle", "Realtime", "Official"], icon: "🔭", isGlobal: true, _installed: true, installs: 8420 },
    { id: "unichain-mempool", name: "Unichain Mempool Scanner", category: "Data & Oracles", version: "v1.0.2", author: "HookMind Labs", description: "Scans pending transactions on Unichain before they land. Detects sandwich attacks before execution.", tags: ["Mempool", "MEV", "Defense"], icon: "📡", isGlobal: false, _installed: false, installs: 1203 },
    { id: "chainlink-ccip", name: "Chainlink CCIP Bridge", category: "Data & Oracles", version: "v3.0.0", author: "Chainlink", description: "Cross-chain price synchronization. Pulls market data from Ethereum mainnet into Unichain hooks.", tags: ["Cross-Chain", "Official"], icon: "🔗", isGlobal: true, _installed: false, installs: 5671 },
    { id: "guardrail-monitor", name: "Guardrail Monitor Pro", category: "Risk & Defense", version: "v1.5.0", author: "HookMind Labs", description: "Tracks all rejected signals by the HookMindCore guardrails. Sends alerts when rejection rate > 5%.", tags: ["Safety", "Monitoring", "ECDSA"], icon: "🛡️", isGlobal: false, _installed: true, installs: 2891 },
    { id: "il-hedger", name: "IL Auto-Hedger", category: "Risk & Defense", version: "v2.0.1", author: "HookMind Labs", description: "When IL exposure exceeds threshold, auto-buys IL insurance premium (10 USDC via Circle CCTP v2).", tags: ["IL Insurance", "Auto", "CCTP"], icon: "⚖️", isGlobal: false, _installed: false, installs: 743 },
    { id: "rug-detector", name: "Rug Pull Detector", category: "Risk & Defense", version: "v0.9.5", author: "Community", description: "Analyzes LP withdrawal patterns. Raises fees to 10000 bps and pauses pool if rug indicators > 80%.", tags: ["Security", "AI", "Beta"], icon: "🚨", isGlobal: false, _installed: false, installs: 329 },
    { id: "epoch-optimizer", name: "Epoch Yield Optimizer", category: "Yield & Vault", version: "v1.2.0", author: "HookMind Labs", description: "Maximizes ERC-4626 drip rate by timing fee injections at optimal epoch checkpoints.", tags: ["ERC-4626", "Yield", "Epoch"], icon: "📈", isGlobal: false, _installed: false, installs: 1876 },
    { id: "auto-compounder", name: "Vault Auto-Compounder", category: "Yield & Vault", version: "v2.1.0", author: "Community", description: "Re-deposits claimable vault yield back into the pool automatically. Compound interest effect.", tags: ["Compound", "Passive", "Yield"], icon: "🔄", isGlobal: false, _installed: true, installs: 4201 },
    { id: "circle-cctp", name: "Circle CCTP v2 Connector", category: "Yield & Vault", version: "v2.0.0", author: "Circle", description: "Official Circle CCTP v2 integration for paying IL insurance premiums cross-chain in USDC.", tags: ["USDC", "Cross-Chain", "Official"], icon: "💵", isGlobal: true, _installed: false, installs: 6234 },
    { id: "telegram-alerts", name: "Telegram Alerts Pro", category: "Notifications", version: "v3.0.0", author: "Community", description: "Sends real-time Telegram messages when fees change, IL spikes, or guardrails reject a signal.", tags: ["Telegram", "Alerts", "Realtime"], icon: "✈️", isGlobal: true, _installed: false, installs: 9102 },
    { id: "discord-webhook", name: "Discord Webhook Notifier", category: "Notifications", version: "v2.5.0", author: "Community", description: "Posts rich embeds to your Discord server for every on-chain agent action.", tags: ["Discord", "Webhook"], icon: "💬", isGlobal: true, _installed: false, installs: 7432 },
    { id: "pnl-reporter", name: "P&L Real-Time Reporter", category: "Notifications", version: "v1.4.0", author: "HookMind Labs", description: "Calculates LP P&L after each epoch close. Reports gains/losses vs holding benchmark.", tags: ["P&L", "Analytics", "LP"], icon: "📊", isGlobal: false, _installed: false, installs: 2187 },
];

const OFFICIAL_AUTHORS = ["Pyth Network", "Chainlink", "Circle", "HookMind Labs"];

function PluginCard({ plugin }: { plugin: typeof PLUGINS[0] }) {
    const [installed, setInstalled] = useState(plugin._installed);

    const toggle = async () => {
        if (installed) {
            toast.success(`${plugin.name} uninstalled.`);
            setInstalled(false);
        } else {
            toast.loading(`Installing ${plugin.name}...`, { id: plugin.id });
            await new Promise((r) => setTimeout(r, 1500));
            toast.success("Plugin installed! Restart agent to activate.", { id: plugin.id });
            setInstalled(true);
            const stored = JSON.parse(localStorage.getItem("hm-plugins-installed") ?? "[]");
            localStorage.setItem("hm-plugins-installed", JSON.stringify([...stored, plugin.id]));
        }
    };

    const isOfficial = OFFICIAL_AUTHORS.includes(plugin.author);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className={`relative p-5 rounded-2xl flex flex-col gap-3 transition-all duration-200 border bg-white/4 ${installed ? "border-neural-cyan/30" : "border-white/8"}`}
        >
            {/* Official badge */}
            {isOfficial && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30">
                    <CheckCircle2 size={10} /> OFFICIAL
                </div>
            )}
            {plugin.isGlobal && !isOfficial && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-green-300 bg-green-500/20 border border-green-500/30">
                    <Globe size={10} /> GLOBAL
                </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-3">
                <span className="text-3xl leading-none mt-0.5">{plugin.icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm leading-tight">{plugin.name}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{plugin.author} · {plugin.version}</div>
                </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-400 leading-relaxed">{plugin.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
                {plugin.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/8 text-gray-400 border border-white/10">{t}</span>
                ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto">
                <span className="text-[11px] text-gray-600 font-mono">{plugin.installs.toLocaleString()} installs</span>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={toggle}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border ${installed
                        ? "bg-neural-red/10 text-neural-red border-neural-red/30"
                        : "bg-neural-cyan/10 text-neural-cyan border-neural-cyan/30"
                        }`}
                >
                    {installed ? <><CheckCircle2 size={11} /> Uninstall</> : <>⚡ Install</>}
                </motion.button>
            </div>
        </motion.div>
    );
}

export default function PluginsPage() {
    const [activeTab, setActiveTab] = useState("All Plugins");
    const [search, setSearch] = useState("");

    const installed3 = PLUGINS.filter((p) => p._installed);

    const filtered = PLUGINS.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
        const matchTab = activeTab === "All Plugins" ? true : activeTab === "Installed (3)" ? p._installed : p.category === activeTab;
        return matchSearch && matchTab;
    });

    return (
        <div className="pt-20 px-5 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="pt-8 mb-8">
                <div className="inline-flex items-center gap-2 neon-badge-magenta mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-neural-magenta animate-pulse" style={{ boxShadow: "0 0 6px var(--color-neural-magenta)" }} />
                    PLUGIN MARKETPLACE
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-2">
                    Hook Intelligence{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-neural-cyan to-neural-magenta">
                        Plugins
                    </span>
                </h1>
                <p className="text-gray-500 max-w-2xl">
                    Extend your AI agent with specialized modules for Unichain. Install, manage, and combine plugins to build your edge.
                </p>
            </div>

            {/* Search + Tabs + Count */}
            <div className="flex flex-col gap-4 mb-8">
                <div className="relative max-w-md">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search plugins..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-mono bg-white/5 border border-white/10 text-white focus:border-neural-magenta focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {TABS.map((tab) => (
                        <motion.button
                            key={tab}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border ${activeTab === tab
                                ? "bg-neural-magenta/15 text-neural-magenta border-neural-magenta/40"
                                : "bg-white/4 text-gray-500 border-white/8"
                                }`}
                        >
                            {tab}
                        </motion.button>
                    ))}
                </div>
                <p className="text-xs text-gray-600 font-mono">
                    Showing {filtered.length} plugins · {installed3.length} installed
                </p>
            </div>

            {/* Plugin Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((plugin) => (
                    <PluginCard key={plugin.id} plugin={plugin} />
                ))}
            </div>
        </div>
    );
}
