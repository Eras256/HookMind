"use client";
import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Download, Brain, TrendingUp, AlertTriangle, Star } from "lucide-react";
import { toast } from "sonner";

const STRATEGIES = [
    {
        id: 1,
        name: "Peg Keeper Shield",
        author: "HookMind Labs",
        risk: "Low",
        riskColor: "var(--color-neural-green)",
        apy: "8.4%",
        description: "Keeps stablecoin pair fees at minimum unless peg deviation > 0.5%. Silent protector for boring capital.",
        model: "Claude 4.6",
        installs: 12400,
        backtestMonths: 6,
        winRate: "91%",
        gradient: "linear-gradient(135deg, rgba(0,255,163,0.15), rgba(0,242,254,0.08))",
        borderColor: "rgba(0,255,163,0.25)",
    },
    {
        id: 2,
        name: "WETH/USDC Delta Optimizer",
        author: "QuantDefi Collective",
        risk: "Medium",
        riskColor: "var(--color-neural-cyan)",
        apy: "22.1%",
        description: "Uses 12-block rolling volatility windows to constantly rebalance the fee curve around the ETH volatility regime.",
        model: "GPT-4o",
        installs: 5830,
        backtestMonths: 9,
        winRate: "78%",
        gradient: "linear-gradient(135deg, rgba(0,242,254,0.12), rgba(167,139,250,0.08))",
        borderColor: "rgba(0,242,254,0.25)",
    },
    {
        id: 3,
        name: "Memetic Volatility Shield",
        author: "0xNeuralAgent",
        risk: "High",
        riskColor: "var(--color-neural-gold)",
        apy: "48.3%",
        description: "Built for meme tokens. Detects social-driven vol spikes via on-chain mempool pressure. Fees spike to 10000 bps aggressively.",
        model: "Grok 3",
        installs: 3210,
        backtestMonths: 3,
        winRate: "65%",
        gradient: "linear-gradient(135deg, rgba(234,179,8,0.12), rgba(252,114,255,0.08))",
        borderColor: "rgba(234,179,8,0.3)",
    },
    {
        id: 4,
        name: "Meme-Coin MEV Extractor",
        author: "ChaosQuant DAO",
        risk: "Extreme",
        riskColor: "var(--color-neural-red)",
        apy: "120%+",
        description: "Maximizes protocol revenue during meme supercycles. Runs at 10000 bps 24/7 during detected MEV storm windows. Not for the faint-hearted.",
        model: "DeepSeek R1",
        installs: 890,
        backtestMonths: 1,
        winRate: "44%",
        gradient: "linear-gradient(135deg, rgba(255,51,102,0.15), rgba(252,114,255,0.12))",
        borderColor: "rgba(255,51,102,0.4)",
    },
];

const RISK_LEVELS = { Low: 1, Medium: 2, High: 3, Extreme: 4 } as const;

export default function StrategiesPage() {
    const handleDeploy = (name: string, risk: string) => {
        if (risk === "Extreme") {
            toast.warning(`⚠️ "${name}" is an EXTREME risk strategy. Confirm in wallet.`);
        } else {
            toast.loading(`Cloning "${name}" strategy...`, { id: "deploy" });
            setTimeout(() => toast.success(`Strategy "${name}" deployed! Agent is live on Unichain.`, { id: "deploy" }), 2200);
        }
    };

    return (
        <div className="pt-20 px-5 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="pt-8 mb-12 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 neon-badge-magenta mb-5"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-neural-magenta animate-pulse" style={{ boxShadow: "0 0 6px var(--color-neural-magenta)" }} />
                    MARKETPLACE · {STRATEGIES.length} STRATEGIES
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-none"
                >
                    Strategy{" "}
                    <span
                        className="text-transparent bg-clip-text bg-linear-to-r from-neural-magenta to-neural-cyan"
                    >
                        Marketplace
                    </span>
                </motion.h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                    Deploy battle-tested AI strategies built by top quants. Each strategy runs fully autonomous — ECDSA signed, IPFS audited, zero human intervention.
                </p>
            </div>

            {/* Strategy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {STRATEGIES.map((strategy, idx) => (
                    <motion.div
                        key={strategy.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative overflow-hidden rounded-2xl flex flex-col"
                        style={{ background: strategy.gradient, border: `1px solid ${strategy.borderColor}`, backdropFilter: "blur(20px)" }}
                    >
                        {/* Top Section */}
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 pr-4">
                                    {/* Risk Badge */}
                                    <div
                                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3"
                                        style={{ background: `${strategy.riskColor}18`, color: strategy.riskColor, border: `1px solid ${strategy.riskColor}44` }}
                                    >
                                        {strategy.risk === "Extreme" && <AlertTriangle className="w-3 h-3" />}
                                        {strategy.risk === "Low" && <Shield className="w-3 h-3" />}
                                        {strategy.risk} risk
                                    </div>
                                    <h3 className="text-xl font-black text-white leading-tight">{strategy.name}</h3>
                                    <p className="text-sm text-gray-500 font-mono mt-1">by {strategy.author}</p>
                                </div>
                                {/* APY Card */}
                                <div className="text-right shrink-0">
                                    <div className="text-3xl font-black" style={{ color: strategy.riskColor }}>{strategy.apy}</div>
                                    <div className="text-xs text-gray-600 font-mono">Backtested APY</div>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm leading-relaxed mb-5">{strategy.description}</p>

                            {/* Metrics Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                {[
                                    { label: "AI Model", value: strategy.model.split(" ")[0] },
                                    { label: "Win Rate", value: strategy.winRate },
                                    { label: "Installs", value: `${(strategy.installs / 1000).toFixed(1)}K` },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-black/30 rounded-xl p-2.5 sm:p-3 text-center flex sm:flex-col justify-between items-center sm:justify-center">
                                        <div className="text-[10px] text-gray-600 font-mono uppercase tracking-wider shrink-0">{label}</div>
                                        <div className="text-xs sm:text-sm font-bold text-white font-mono">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 pt-0 flex flex-col sm:flex-row gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 btn-ghost py-3 text-sm rounded-xl"
                            >
                                View Audit Trail
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${strategy.riskColor}66` }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleDeploy(strategy.name, strategy.risk)}
                                className="flex-1 py-3 rounded-xl font-bold text-black text-sm flex items-center justify-center gap-2"
                                style={{ background: strategy.risk === "Extreme" ? "linear-gradient(135deg, var(--color-neural-red), var(--color-neural-magenta))" : strategy.riskColor }}
                            >
                                <Zap className="w-4 h-4" /> 1-Click Deploy
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
