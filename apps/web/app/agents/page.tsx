"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Plus, Cpu, Key, Activity } from "lucide-react";
const LLM_PROVIDERS = [
    { id: "anthropic", name: "Claude 4.6", badge: "RECOMMENDED", color: "#CC785C" },
    { id: "openai", name: "GPT-4o", badge: "FAST", color: "#10A37F" },
    { id: "gemini", name: "Gemini 2.0", badge: "MULTIMODAL", color: "#4285F4" },
    { id: "grok", name: "Grok 3", badge: "REALTIME", color: "#1DA1F2" },
    { id: "ollama", name: "Ollama (Local)", badge: "PRIVATE", color: "#7C3AED" },
];
export default function AgentsPage() {
    const [selected, setSelected] = useState("anthropic");
    return (
        <div className="pt-24 px-6 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-black mb-2">
                    Agent <span className="text-[#06B6D4]">Builder</span>
                </h1>
                <p className="text-gray-400">
                    Configure the AI that controls your Uniswap v4 Hook parameters in real-time.
                    Select your Neural Provider and deploy your operator node.
                </p>
            </div>
            {/* LLM Provider Selector */}
            <div className="glass-card p-6 mb-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#06B6D4]" />
                    Neural Provider Matrix
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {LLM_PROVIDERS.map((p) => (
                        <motion.button
                            key={p.id}
                            onClick={() => setSelected(p.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`text-left p-4 rounded-xl border transition-all duration-200 ${selected === p.id
                                    ? "border-[#06B6D4] bg-[rgba(6,182,212,0.08)]"
                                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/20"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold">{p.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44` }}>
                                    {p.badge}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">ID: {p.id}</p>
                        </motion.button>
                    ))}
                </div>
            </div>
            {/* Strategy Parameters */}
            <div className="glass-card p-6 mb-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#06B6D4]" />
                    Hook Strategy Parameters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { label: "Min Fee (bps)", id: "minFee", default: "500", hint: "Minimum 500 = 0.05%" },
                        { label: "Max Fee (bps)", id: "maxFee", default: "10000", hint: "Maximum 10000 = 1.0%" },
                        { label: "Update Interval (ms)", id: "interval", default: "12000", hint: "1 block = ~12s on Unichain" },
                        { label: "IL Threshold (bps)", id: "ilThresh", default: "200", hint: "2% IL triggers protection" },
                    ].map(({ label, id, default: def, hint }) => (
                        <div key={id}>
                            <label className="block text-sm text-gray-400 mb-1">{label}</label>
                            <input
                                id={id}
                                type="number"
                                defaultValue={def}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#06B6D4] focus:outline-none focus:ring-1 focus:ring-[#06B6D4] transition-colors"
                            />
                            <p className="text-xs text-gray-600 mt-1">{hint}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Deploy Button */}
            <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 32px rgba(6,182,212,0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-black"
                style={{ background: "linear-gradient(135deg, #06B6D4, #0052FF)" }}
            >
                <Plus className="w-5 h-5" />
                Deploy Agent Node on Unichain
            </motion.button>
        </div>
    );
}
