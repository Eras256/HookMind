"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu, Key, Eye, EyeOff, Database, Download, ExternalLink, Save } from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import Link from "next/link";

const AI_PROVIDERS = [
    { id: "claude", name: "Claude 4.6", badge: "RECOMMENDED", badgeColor: "text-neural-cyan border-neural-cyan/30", desc: "Best reasoning for volatile markets" },
    { id: "gpt4o", name: "GPT-4o", badge: "FAST", badgeColor: "text-neural-green border-neural-green/30", desc: "Low latency, high throughput" },
    { id: "gemini", name: "Gemini 2.0", badge: "MULTIMODAL", badgeColor: "text-blue-400 border-blue-400/30", desc: "Cross-modal market analysis" },
    { id: "grok", name: "Grok 3", badge: "REALTIME", badgeColor: "text-neural-gold border-neural-gold/30", desc: "Live social + on-chain signals" },
    { id: "ollama", name: "Ollama (Local)", badge: "PRIVATE", badgeColor: "text-neural-purple border-neural-purple/30", desc: "Air-gapped, zero data leakage" },
];

const STORAGE_KEY = "hm-node-settings";

interface Settings {
    provider: string;
    minFee: number;
    maxFee: number;
    updateInterval: number;
    ilThreshold: number;
    pinataKey: string;
    llmKey: string;
}

const DEFAULT_SETTINGS: Settings = {
    provider: "claude",
    minFee: 500,
    maxFee: 10000,
    updateInterval: 12000,
    ilThreshold: 2.0,
    pinataKey: "",
    llmKey: "",
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function NodeSettingsModal({ isOpen, onClose }: Props) {
    const { address, isConnected } = useAccount();
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [showPinata, setShowPinata] = useState(false);
    const [showLLM, setShowLLM] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setSettings(JSON.parse(stored));
        } catch { }
    }, []);

    const set = (k: keyof Settings, v: any) =>
        setSettings((prev) => ({ ...prev, [k]: v }));

    const save = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        toast.success("Configuration saved. Agent restarting...");
        onClose();
    };

    const downloadConfig = () => {
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hookmind-config-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Config downloaded!");
    };

    const llmLabel =
        settings.provider === "claude" ? "Anthropic API Key" :
            settings.provider === "gpt4o" ? "OpenAI API Key" :
                settings.provider === "gemini" ? "Google AI API Key" :
                    settings.provider === "grok" ? "xAI / Grok API Key" :
                        "Ollama Base URL";

    const agentEOA = typeof window !== "undefined"
        ? localStorage.getItem("hm-agent-eoa") ?? "Not configured"
        : "Not configured";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        className="fixed right-0 top-0 h-full w-[420px] z-50 flex flex-col overflow-hidden bg-void/97 backdrop-blur-[28px] border-l border-neural-magenta/20"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/8 shrink-0">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h2 className="text-lg font-black text-white">Node Operator Settings</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Configure your AI agent parameters for Unichain</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            {isConnected && address && (
                                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-mono bg-neural-magenta/8 border border-neural-magenta/20 text-neural-magenta">
                                    <span className="w-1.5 h-1.5 rounded-full bg-neural-magenta" />
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
                            {/* ── Section 1: AI Provider ── */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Cpu size={14} className="text-neural-magenta" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">AI Provider</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {AI_PROVIDERS.map((p) => {
                                        const active = settings.provider === p.id;
                                        return (
                                            <motion.button
                                                key={p.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => set("provider", p.id)}
                                                className={`text-left p-3 rounded-xl transition-all duration-200 relative border ${active ? "bg-neural-magenta/10 border-neural-magenta" : "bg-white/3 border-white/6"}`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-bold text-white">{p.name}</span>
                                                </div>
                                                <div className={`text-[10px] font-mono font-bold border rounded px-1.5 py-0.5 inline-block mb-1.5 ${p.badgeColor}`}>
                                                    {p.badge}
                                                </div>
                                                <p className="text-[11px] text-gray-500 leading-tight">{p.desc}</p>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* ── Section 2: Fee Strategy ── */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-neural-magenta text-sm">⚡</span>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Fee Strategy Config</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500 font-mono block mb-1">Min Fee (bps)</label>
                                            <input
                                                type="number"
                                                value={settings.minFee}
                                                onChange={(e) => set("minFee", +e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neural-magenta focus:outline-none w-full font-mono"
                                            />
                                            <p className="text-[10px] text-gray-600 mt-1 font-mono">500 = 0.05%</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 font-mono block mb-1">Max Fee (bps)</label>
                                            <input
                                                type="number"
                                                value={settings.maxFee}
                                                onChange={(e) => set("maxFee", +e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neural-magenta focus:outline-none w-full font-mono"
                                            />
                                            <p className="text-[10px] text-gray-600 mt-1 font-mono">10000 = 1.00%</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-mono block mb-1">Update Interval (ms)</label>
                                        <input
                                            type="number"
                                            value={settings.updateInterval}
                                            onChange={(e) => set("updateInterval", +e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neural-magenta focus:outline-none w-full font-mono"
                                        />
                                        <p className="text-[10px] text-gray-600 mt-1 font-mono">~1 Unichain block</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-mono block mb-1">IL Protection Threshold (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={settings.ilThreshold}
                                            onChange={(e) => set("ilThreshold", +e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neural-magenta focus:outline-none w-full font-mono"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* ── Section 3: API Keys ── */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Key size={14} className="text-neural-magenta" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">API Key Config</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-500 font-mono block mb-1">PINATA_API_KEY</label>
                                        <div className="relative">
                                            <input
                                                type={showPinata ? "text" : "password"}
                                                value={settings.pinataKey}
                                                onChange={(e) => set("pinataKey", e.target.value)}
                                                placeholder="pk_live_..."
                                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-10 text-white text-sm focus:border-neural-magenta focus:outline-none w-full font-mono"
                                            />
                                            <button
                                                onClick={() => setShowPinata(!showPinata)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                            >
                                                {showPinata ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-mono block mb-1">{llmLabel}</label>
                                        <div className="relative">
                                            <input
                                                type={showLLM ? "text" : "password"}
                                                value={settings.llmKey}
                                                onChange={(e) => set("llmKey", e.target.value)}
                                                placeholder={settings.provider === "ollama" ? "http://localhost:11434" : "sk-..."}
                                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-10 text-white text-sm focus:border-neural-magenta focus:outline-none w-full font-mono"
                                            />
                                            <button
                                                onClick={() => setShowLLM(!showLLM)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                            >
                                                {showLLM ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-600 font-mono">
                                        🔒 Keys stored locally. Never sent to HookMind servers.
                                    </p>
                                </div>
                            </section>

                            {/* ── Section 4: Daemon Status ── */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Database size={14} className="text-neural-magenta" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Daemon Status</h3>
                                </div>
                                <div className="space-y-2.5 font-mono">
                                    {[
                                        { label: "Agent EOA Wallet", value: agentEOA === "Not configured" ? "Not configured" : `${agentEOA.slice(0, 6)}...${agentEOA.slice(-4)}` },
                                        { label: "Nonces Burned", value: "1,847" },
                                        { label: "Last Signal", value: "12 secs ago" },
                                        { label: "Daemon Uptime", value: "14h 22m 08s" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-xs text-gray-500">{label}</span>
                                            <span className="text-xs text-white">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-white/8 space-y-2 shrink-0">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={save}
                                className="w-full py-3 rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2 bg-linear-to-r from-neural-magenta to-neural-cyan"
                            >
                                <Save size={15} /> Save & Restart Agent
                            </motion.button>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={downloadConfig}
                                    className="flex-1 py-2.5 rounded-xl text-sm btn-ghost flex items-center justify-center gap-1.5"
                                >
                                    <Download size={13} /> Download Config
                                </motion.button>
                                <Link
                                    href="/logs"
                                    onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl text-sm btn-ghost flex items-center justify-center gap-1.5 text-center"
                                >
                                    <ExternalLink size={13} /> View Agent Logs
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
