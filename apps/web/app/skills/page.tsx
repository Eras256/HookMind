"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const AI_SKILLS = [
    { id: "volatility-analyst", name: "Volatility Analyst", tier: "CORE", icon: "📉", description: "Enables the agent to compute realized vs implied volatility ratios and score pool risk on a 0-10000 scale. Required for dynamic fee decisions.", compatible: ["claude", "gpt4o", "gemini", "grok", "ollama"], tags: ["Math", "Core Logic", "Fee Decisions"], _active: true, performance: { accuracy: "97.3%", decisions: 18420 } },
    { id: "il-predictor", name: "IL Loss Predictor", tier: "CORE", icon: "🧮", description: "Calculates real-time Impermanent Loss exposure using the √(P1/P0) formula. Triggers IL protection when exposure > configured threshold.", compatible: ["claude", "gpt4o", "gemini", "grok"], tags: ["IL Math", "Protection"], _active: true, performance: { accuracy: "95.8%", decisions: 12038 } },
    { id: "ipfs-auditor", name: "IPFS Audit Verifier", tier: "CORE", icon: "📋", description: "Before executing any signal, retrieves the last 5 IPFS audit logs and checks for consistency. Prevents drift in agent reasoning.", compatible: ["claude", "gpt4o", "gemini", "grok", "ollama"], tags: ["Audit", "IPFS", "Safety"], _active: true, performance: { accuracy: "99.9%", decisions: 18420 } },
    { id: "social-sentiment", name: "Social Sentiment Engine", tier: "PRO", icon: "🐦", description: "Aggregates Twitter/X and Farcaster mentions of pool tokens. Feeds bullish/bearish score to fee decisions. Raises fees during viral pumps.", compatible: ["claude", "grok"], tags: ["Social", "NLP", "Sentiment"], _active: false, performance: { accuracy: "88.2%", decisions: 4201 } },
    { id: "mev-classifier", name: "MEV Pattern Classifier", tier: "PRO", icon: "🤖", description: "Identifies sandwich, frontrun, and backrun patterns in the Unichain mempool in real-time. Raises fees preemptively when MEV bot detected.", compatible: ["claude", "gpt4o", "gemini"], tags: ["MEV", "Pattern Recognition"], _active: false, performance: { accuracy: "91.6%", decisions: 7823 } },
    { id: "epoch-strategist", name: "Epoch Yield Strategist", tier: "PRO", icon: "⏱️", description: "Optimizes fee collection timing across ERC-4626 epoch windows. Understands the 7-day drip curve and maximizes claimable yield for LPs.", compatible: ["claude", "gemini"], tags: ["ERC-4626", "Yield", "Timing"], _active: false, performance: { accuracy: "93.4%", decisions: 5619 } },
    { id: "macro-observer", name: "Macro Market Observer", tier: "EXPERIMENTAL", icon: "🌍", description: "Monitors Bitcoin dominance, ETH/BTC ratio, and total crypto market cap. Adjusts agent risk tolerance based on macro cycle phase.", compatible: ["claude", "gpt4o"], tags: ["Macro", "Experimental"], _active: false, performance: { accuracy: "79.1%", decisions: 924 } },
    { id: "cross-pool-arb", name: "Cross-Pool Arbitrage Detector", tier: "EXPERIMENTAL", icon: "🔍", description: "Scans multiple Unichain pools simultaneously for price discrepancies. Signals when a hook fee adjustment can capture arbitrage premium.", compatible: ["claude", "gpt4o", "grok"], tags: ["Arbitrage", "Cross-Pool", "Alpha"], _active: false, performance: { accuracy: "82.3%", decisions: 2134 } },
];

const TIER_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    CORE: { bg: "rgba(0,242,254,0.12)", text: "var(--color-neural-cyan)", border: "rgba(0,242,254,0.3)" },
    PRO: { bg: "rgba(167,139,250,0.12)", text: "var(--color-neural-purple)", border: "rgba(167,139,250,0.3)" },
    EXPERIMENTAL: { bg: "rgba(251,146,60,0.12)", text: "var(--color-neural-gold)", border: "rgba(251,146,60,0.3)" },
};

const PROVIDER_ICONS: Record<string, string> = {
    claude: "C", gpt4o: "G", gemini: "Ge", grok: "Gr", ollama: "🦙",
};
const PROVIDER_COLORS: Record<string, string> = {
    claude: "var(--color-neural-cyan)", gpt4o: "var(--color-neural-green)", gemini: "#60A5FA", grok: "var(--color-neural-gold)", ollama: "var(--color-neural-purple)",
};

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={`relative w-10 h-5 rounded-full transition-colors duration-300 shrink-0 ${active ? "bg-neural-cyan" : "bg-white/10"}`}
        >
            <motion.div
                animate={{ x: active ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
                style={{ boxShadow: active ? "0 0 8px var(--color-neural-cyan)" : "none" }}
            />
        </button>
    );
}

export default function SkillsPage() {
    const [skills, setSkills] = useState(AI_SKILLS.map((s) => ({ ...s, active: s._active })));

    const toggle = (id: string) => {
        setSkills((prev) => {
            const updated = prev.map((s) => s.id === id ? { ...s, active: !s.active } : s);
            const skill = updated.find((s) => s.id === id)!;
            toast.success(skill.active ? `${skill.name} activated` : `${skill.name} deactivated`);
            const activeIds = updated.filter((s) => s.active).map((s) => s.id);
            localStorage.setItem("hm-skills-active", JSON.stringify(activeIds));
            return updated;
        });
    };

    const activeSkills = skills.filter((s) => s.active);
    const accuracyBoost = +(activeSkills.length * 2.3 - 4.6).toFixed(1);

    return (
        <div className="pt-20 px-5 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="pt-8 mb-6">
                <div className="inline-flex items-center gap-2 neon-badge mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-neural-cyan animate-pulse" />
                    NEURAL MODULES
                </div>
                <h1 className="text-5xl font-black tracking-tighter mb-3">
                    AI Reasoning{" "}
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#00F2FE,#FC72FF)" }}>
                        Skills
                    </span>
                </h1>
                <p className="text-gray-500 max-w-2xl mb-4">
                    Specialized neural modules that enhance your agent's decision-making capacity on Unichain.
                </p>
                {/* Info Banner */}
                <div
                    className="flex items-start gap-3 p-4 rounded-xl text-sm max-w-2xl bg-neural-cyan/5 border border-neural-cyan/20"
                >
                    <span className="text-neural-cyan shrink-0">💡</span>
                    <span className="text-gray-300">
                        Skills inject specialized context into your AI provider's reasoning chain.
                        They are composable — <strong className="text-white">stack multiple skills</strong> for compound intelligence.
                    </span>
                </div>
            </div>

            {/* Skills List */}
            <div className="space-y-3 mb-10">
                {skills.map((skill, i) => {
                    const ts = TIER_STYLES[skill.tier];
                    return (
                        <motion.div
                            key={skill.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="glass-card p-5"
                        >
                            {/* EXPERIMENTAL warning */}
                            {skill.tier === "EXPERIMENTAL" && (
                                <div className="flex items-center gap-1.5 text-xs font-mono text-neural-gold mb-3 pb-3 border-b border-white/5">
                                    <AlertTriangle size={12} />
                                    Experimental: May reduce signal accuracy in production environments
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <span className="text-3xl leading-none shrink-0 mt-0.5">{skill.icon}</span>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="font-black text-white text-base">{skill.name}</h3>
                                        <div
                                            className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                                            style={{ background: ts.bg, color: ts.text, border: `1px solid ${ts.border}` }}
                                        >
                                            {skill.tier}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-400 leading-relaxed mb-3">{skill.description}</p>

                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Tags */}
                                        <div className="flex gap-1.5 flex-wrap">
                                            {skill.tags.map((t) => (
                                                <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-gray-500 border border-white/8">{t}</span>
                                            ))}
                                        </div>

                                        {/* Compatible Providers */}
                                        <div className="flex items-center gap-1 ml-auto">
                                            {Object.keys(PROVIDER_ICONS).map((p) => {
                                                const compat = skill.compatible.includes(p);
                                                return (
                                                    <div
                                                        key={p}
                                                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-opacity"
                                                        style={{
                                                            background: compat ? `${PROVIDER_COLORS[p]}20` : "rgba(255,255,255,0.05)",
                                                            color: compat ? PROVIDER_COLORS[p] : "#333",
                                                            border: `1px solid ${compat ? PROVIDER_COLORS[p] + "50" : "transparent"}`,
                                                            opacity: compat ? 1 : 0.3,
                                                            fontSize: "10px",
                                                        }}
                                                        title={p}
                                                    >
                                                        {PROVIDER_ICONS[p]}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Performance */}
                                    <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-600 font-mono">
                                        <span>{skill.performance.accuracy} accuracy</span>
                                        <span>·</span>
                                        <span>{skill.performance.decisions.toLocaleString()} decisions</span>
                                    </div>
                                </div>

                                {/* Toggle */}
                                <Toggle active={skill.active} onToggle={() => toggle(skill.id)} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Stack Composer */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-black text-lg">Active Skill Stack</h2>
                    <div
                        className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-neural-green/10 text-neural-green border border-neural-green/30"
                    >
                        {accuracyBoost > 0 ? `+${accuracyBoost}%` : "—"} Estimated Accuracy Boost
                    </div>
                </div>

                {activeSkills.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 font-mono text-sm">No skills active. Enable at least one skill above.</div>
                ) : (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-wrap gap-y-3">
                        {activeSkills.map((skill, i) => (
                            <div key={skill.id} className="flex items-center gap-2">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold"
                                    style={{
                                        background: `${TIER_STYLES[skill.tier].bg}`,
                                        border: `1px solid ${TIER_STYLES[skill.tier].border}`,
                                        color: TIER_STYLES[skill.tier].text,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    <span>{skill.icon}</span>
                                    <span>{skill.name.split(" ").slice(0, 2).join(" ")}</span>
                                </motion.div>
                                {i < activeSkills.length - 1 && (
                                    <ArrowRight size={14} className="text-gray-600 shrink-0" style={{ strokeDasharray: "3 2" }} />
                                )}
                            </div>
                        ))}
                        <ArrowRight size={14} className="text-gray-600 shrink-0" />
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-neural-magenta/10 border border-neural-magenta/30 text-neural-magenta whitespace-nowrap"
                        >
                            <span>🧠</span> LLM Provider
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
