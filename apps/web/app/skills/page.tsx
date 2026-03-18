'use client';
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

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
    const { t, language } = useLanguage();

    const AI_SKILLS_BASE = useMemo(() => [
        { id: "volatility-analyst", name: t.skills.names.vol, tier: "CORE", icon: "📉", description: t.skills.descriptions.vol, compatible: ["claude", "gpt4o", "gemini", "grok", "ollama"], tags: ["Math", "Core Logic", "Fee Decisions"], _active: true, performance: { accuracy: "97.3%", decisions: 18420 } },
        { id: "il-predictor", name: t.skills.names.il, tier: "CORE", icon: "🧮", description: t.skills.descriptions.il, compatible: ["claude", "gpt4o", "gemini", "grok"], tags: ["IL Math", "Protection"], _active: true, performance: { accuracy: "95.8%", decisions: 12038 } },
        { id: "ipfs-auditor", name: t.skills.names.ipfs, tier: "CORE", icon: "📋", description: t.skills.descriptions.ipfs, compatible: ["claude", "gpt4o", "gemini", "grok", "ollama"], tags: ["Audit", "IPFS", "Safety"], _active: true, performance: { accuracy: "99.9%", decisions: 18420 } },
        { id: "social-sentiment", name: t.skills.names.social, tier: "PRO", icon: "🐦", description: t.skills.descriptions.social, compatible: ["claude", "grok"], tags: ["Social", "NLP", "Sentiment"], _active: false, performance: { accuracy: "88.2%", decisions: 4201 } },
        { id: "mev-classifier", name: t.skills.names.mev, tier: "PRO", icon: "🤖", description: t.skills.descriptions.mev, compatible: ["claude", "gpt4o", "gemini"], tags: ["MEV", "Pattern Recognition"], _active: false, performance: { accuracy: "91.6%", decisions: 7823 } },
        { id: "epoch-strategist", name: t.skills.names.epoch, tier: "PRO", icon: "⏱️", description: t.skills.descriptions.epoch, compatible: ["claude", "gemini"], tags: ["ERC-4626", "Yield", "Timing"], _active: false, performance: { accuracy: "93.4%", decisions: 5619 } },
        { id: "macro-observer", name: t.skills.names.macro, tier: "EXPERIMENTAL", icon: "🌍", description: t.skills.descriptions.macro, compatible: ["claude", "gpt4o"], tags: ["Macro", "Experimental"], _active: false, performance: { accuracy: "79.1%", decisions: 924 } },
        { id: "cross-pool-arb", name: t.skills.names.arb, tier: "EXPERIMENTAL", icon: "🔍", description: t.skills.descriptions.arb, compatible: ["claude", "gpt4o", "grok"], tags: ["Arbitrage", "Cross-Pool", "Alpha"], _active: false, performance: { accuracy: "82.3%", decisions: 2134 } },
    ], [t]);

    const [skillsState, setSkillsState] = useState(AI_SKILLS_BASE.map((s) => ({ ...s, active: s._active })));

    const toggle = (id: string) => {
        setSkillsState((prev) => {
            const updated = prev.map((s) => s.id === id ? { ...s, active: !s.active } : s);
            const skill = updated.find((s) => s.id === id)!;
            toast.success(skill.active ? t.skills.toast_activated.replace("{name}", skill.name) : t.skills.toast_deactivated.replace("{name}", skill.name));
            const activeIds = updated.filter((s) => s.active).map((s) => s.id);
            localStorage.setItem("hm-skills-active", JSON.stringify(activeIds));
            return updated;
        });
    };

    const activeSkills = skillsState.filter((s) => s.active);
    const accuracyBoost = +(activeSkills.length * 2.3 - 4.6).toFixed(1);

    return (
        <div className="pt-20 px-5 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="pt-8 mb-6">
                <div className="inline-flex items-center gap-2 neon-badge mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-neural-cyan animate-pulse" />
                    {t.skills.hero_badge}
                </div>
                <h1 className="text-5xl font-black tracking-tighter mb-3">
                    {t.skills.hero_title}{" "}
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#00F2FE,#FC72FF)" }}>
                        {t.skills.hero_subtitle}
                    </span>
                </h1>
                <p className="text-gray-500 max-w-2xl mb-4">
                    {t.skills.hero_desc}
                </p>
                {/* Info Banner */}
                <div
                    className="flex items-start gap-3 p-4 rounded-xl text-sm max-w-2xl bg-neural-cyan/5 border border-neural-cyan/20"
                >
                    <span className="text-neural-cyan shrink-0">💡</span>
                    <span className="text-gray-300" dangerouslySetInnerHTML={{ __html: t.skills.banner_info }} />
                </div>
            </div>

            {/* Skills List */}
            <div className="space-y-3 mb-10">
                {skillsState.map((skill, i) => {
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
                                    {t.skills.warning_experimental}
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
                                            {skill.tags.map((tag) => (
                                                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-gray-500 border border-white/8">{tag}</span>
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
                                        <span>{t.skills.stat_accuracy.replace("{pct}", skill.performance.accuracy)}</span>
                                        <span>·</span>
                                        <span>{t.skills.stat_decisions.replace("{count}", skill.performance.decisions.toLocaleString())}</span>
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
                    <h2 className="font-black text-lg">{t.skills.panel_stack_title}</h2>
                    <div
                        className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-neural-green/10 text-neural-green border border-neural-green/30"
                    >
                        {accuracyBoost > 0 ? t.skills.panel_stack_boost.replace("{boost}", accuracyBoost.toString()) : "—"}
                    </div>
                </div>

                {activeSkills.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 font-mono text-sm">{t.skills.panel_stack_empty}</div>
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
                            <span>🧠</span> {t.skills.llm_provider}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
