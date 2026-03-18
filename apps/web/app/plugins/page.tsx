'use client';
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, Download, Globe } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

function PluginCard({ plugin }: { plugin: any }) {
    const { t } = useLanguage();
    const [installed, setInstalled] = useState(plugin._installed);

    const toggle = async () => {
        if (installed) {
            toast.success(t.plugins.toast_uninstalled.replace("{name}", plugin.name));
            setInstalled(false);
        } else {
            toast.loading(t.plugins.toast_installing.replace("{name}", plugin.name), { id: plugin.id });
            await new Promise((r) => setTimeout(r, 1500));
            toast.success(t.plugins.toast_success, { id: plugin.id });
            setInstalled(true);
            const stored = JSON.parse(localStorage.getItem("hm-plugins-installed") ?? "[]");
            localStorage.setItem("hm-plugins-installed", JSON.stringify([...stored, plugin.id]));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className={`relative p-5 rounded-2xl flex flex-col gap-3 transition-all duration-200 border bg-white/4 ${installed ? "border-neural-cyan/30" : "border-white/8"}`}
        >
            {/* Official badge */}
            {plugin.isOfficial && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30">
                    <CheckCircle2 size={10} /> {t.plugins.badge_official}
                </div>
            )}
            {plugin.isGlobal && !plugin.isOfficial && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-green-300 bg-green-500/20 border border-green-500/30">
                    <Globe size={10} /> {t.plugins.badge_global}
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
                {plugin.tags.map((tTag: string) => (
                    <span key={tTag} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/8 text-gray-400 border border-white/10">{tTag}</span>
                ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto">
                <span className="text-[11px] text-gray-600 font-mono">
                    {t.plugins.stat_installs.replace("{count}", plugin.installs.toLocaleString())}
                </span>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={toggle}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border ${installed
                        ? "bg-neural-red/10 text-neural-red border-neural-red/30"
                        : "bg-neural-cyan/10 text-neural-cyan border-neural-cyan/30"
                        }`}
                >
                    {installed ? <><CheckCircle2 size={11} /> {t.plugins.btn_uninstall}</> : <>{t.plugins.btn_install}</>}
                </motion.button>
            </div>
        </motion.div>
    );
}

export default function PluginsPage() {
    const { t } = useLanguage();
    
    const PLUGINS = useMemo(() => [
        { id: "pyth-oracle", name: "Pyth Network Oracle", category: t.plugins.tabs.oracles, version: "v2.1.0", author: "Pyth Network", description: t.plugins.descriptions.pyth, tags: ["Oracle", "Realtime", "Official"], icon: "🔭", isGlobal: true, isOfficial: true, _installed: true, installs: 8420 },
        { id: "unichain-mempool", name: "Unichain Mempool Scanner", category: t.plugins.tabs.oracles, version: "v1.0.2", author: "HookMind Labs", description: t.plugins.descriptions.mempool, tags: ["Mempool", "MEV", "Defense"], icon: "📡", isGlobal: false, isOfficial: true, _installed: false, installs: 1203 },
        { id: "chainlink-ccip", name: "Chainlink CCIP Bridge", category: t.plugins.tabs.oracles, version: "v3.0.0", author: "Chainlink", description: t.plugins.descriptions.chainlink, tags: ["Cross-Chain", "Official"], icon: "🔗", isGlobal: true, isOfficial: true, _installed: false, installs: 5671 },
        { id: "guardrail-monitor", name: "Guardrail Monitor Pro", category: t.plugins.tabs.risk, version: "v1.5.0", author: "HookMind Labs", description: t.plugins.descriptions.guardrail, tags: ["Safety", "Monitoring", "ECDSA"], icon: "🛡️", isGlobal: false, isOfficial: true, _installed: true, installs: 2891 },
        { id: "il-hedger", name: "IL Auto-Hedger", category: t.plugins.tabs.risk, version: "v2.0.1", author: "HookMind Labs", description: t.plugins.descriptions.hedger, tags: ["IL Insurance", "Auto", "CCTP"], icon: "⚖️", isGlobal: false, isOfficial: true, _installed: false, installs: 743 },
        { id: "rug-detector", name: "Rug Pull Detector", category: t.plugins.tabs.risk, version: "v0.9.5", author: "Community", description: t.plugins.descriptions.rug, tags: ["Security", "AI", "Beta"], icon: "🚨", isGlobal: false, isOfficial: false, _installed: false, installs: 329 },
        { id: "epoch-optimizer", name: "Epoch Yield Optimizer", category: t.plugins.tabs.yield, version: "v1.2.0", author: "HookMind Labs", description: t.plugins.descriptions.epoch, tags: ["ERC-4626", "Yield", "Epoch"], icon: "📈", isGlobal: false, isOfficial: true, _installed: false, installs: 1876 },
        { id: "auto-compounder", name: "Vault Auto-Compounder", category: t.plugins.tabs.yield, version: "v2.1.0", author: "Community", description: t.plugins.descriptions.compound, tags: ["Compound", "Passive", "Yield"], icon: "🔄", isGlobal: false, isOfficial: false, _installed: true, installs: 4201 },
        { id: "circle-cctp", name: "Circle CCTP v2 Connector", category: t.plugins.tabs.yield, version: "v2.0.0", author: "Circle", description: t.plugins.descriptions.circle, tags: ["USDC", "Cross-Chain", "Official"], icon: "💵", isGlobal: true, isOfficial: true, _installed: false, installs: 6234 },
        { id: "telegram-alerts", name: "Telegram Alerts Pro", category: t.plugins.tabs.notifications, version: "v3.0.0", author: "Community", description: t.plugins.descriptions.telegram, tags: ["Telegram", "Alerts", "Realtime"], icon: "✈️", isGlobal: true, isOfficial: false, _installed: false, installs: 9102 },
        { id: "discord-webhook", name: "Discord Webhook Notifier", category: t.plugins.tabs.notifications, version: "v2.5.0", author: "Community", description: t.plugins.descriptions.discord, tags: ["Discord", "Webhook"], icon: "💬", isGlobal: true, isOfficial: false, _installed: false, installs: 7432 },
        { id: "pnl-reporter", name: "P&L Real-Time Reporter", category: t.plugins.tabs.notifications, version: "v1.4.0", author: "HookMind Labs", description: t.plugins.descriptions.pnl, tags: ["P&L", "Analytics", "LP"], icon: "📊", isGlobal: false, isOfficial: true, _installed: false, installs: 2187 },
    ], [t]);

    const TABS = useMemo(() => [
        { id: "All Plugins", label: t.plugins.tabs.all },
        { id: "Data & Oracles", label: t.plugins.tabs.oracles },
        { id: "Risk & Defense", label: t.plugins.tabs.risk },
        { id: "Yield & Vault", label: t.plugins.tabs.yield },
        { id: "Notifications", label: t.plugins.tabs.notifications },
        { id: "Installed", label: t.plugins.tabs.installed.replace("{count}", "3") },
    ], [t]);

    const [activeTab, setActiveTab] = useState("All Plugins");
    const [search, setSearch] = useState("");

    const installedCount = PLUGINS.filter((p) => p._installed).length;

    const filtered = PLUGINS.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
        const matchTab = activeTab === "All Plugins" ? true : activeTab === "Installed" ? p._installed : p.category === TABS.find(tx => tx.id === activeTab)?.label;
        return matchSearch && matchTab;
    });

    return (
        <div className="pt-20 px-5 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="pt-8 mb-8">
                <div className="inline-flex items-center gap-2 neon-badge-magenta mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-neural-magenta animate-pulse" style={{ boxShadow: "0 0 6px var(--color-neural-magenta)" }} />
                    {t.plugins.hero_badge}
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-2">
                    {t.plugins.hero_title}{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-neural-cyan to-neural-magenta">
                        {t.plugins.hero_subtitle}
                    </span>
                </h1>
                <p className="text-gray-500 max-w-2xl">
                    {t.plugins.hero_desc}
                </p>
            </div>

            {/* Search + Tabs + Count */}
            <div className="flex flex-col gap-4 mb-8">
                <div className="relative max-w-md">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t.plugins.search_placeholder}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-mono bg-white/5 border border-white/10 text-white focus:border-neural-magenta focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {TABS.map((tab) => (
                        <motion.button
                            key={tab.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border ${activeTab === tab.id
                                ? "bg-neural-magenta/15 text-neural-magenta border-neural-magenta/40"
                                : "bg-white/4 text-gray-500 border-white/8"
                                }`}
                        >
                            {tab.label}
                        </motion.button>
                    ))}
                </div>
                <p className="text-xs text-gray-600 font-mono">
                    {t.plugins.count_info.replace("{filtered}", filtered.length.toString()).replace("{installed}", installedCount.toString())}
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
