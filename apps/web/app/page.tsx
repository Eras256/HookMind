"use client";
import { useAgentStream } from "@hookmind/sdk";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, Shield, TrendingUp } from "lucide-react";
export default function MatrixPage() {
    const { events, connected, latestEvent } = useAgentStream();
    return (
        <div className="pt-24 px-6 max-w-7xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 neon-badge mb-6"
                >
                    <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                    {connected ? "AGENT ONLINE — UNICHAIN" : "CONNECTING..."}
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
                >
                    The AI Mesh That
                    <br />
                    <span className="text-[#06B6D4] glow-text">Controls Your Hook</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-xl max-w-2xl mx-auto"
                >
                    Autonomous AI agents monitor Uniswap v4 pools every block and submit
                    cryptographically signed signals to update fees, protect LPs from
                    impermanent loss, and smooth yield — all on-chain, all audited on IPFS.
                </motion.p>
            </div>
            {/* Live Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[
                    { label: "Dynamic Fee", value: `${latestEvent?.type === "llm_decision" ? (latestEvent.data as any)?.feeBps : "3000"} bps`, icon: Zap },
                    { label: "Volatility", value: `${latestEvent?.volatilityScore ?? 5000}/10k`, icon: Activity },
                    { label: "IL Protection", value: "ACTIVE", icon: Shield },
                    { label: "Epoch Yield", value: "Loading...", icon: TrendingUp },
                ].map(({ label, value, icon: Icon }) => (
                    <motion.div
                        key={label}
                        className="glass-card p-5"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2 uppercase tracking-wider">
                            <Icon className="w-3.5 h-3.5 text-[#06B6D4]" />
                            {label}
                        </div>
                        <div className="text-2xl font-bold text-white">{value}</div>
                    </motion.div>
                ))}
            </div>
            {/* Live Agent Event Feed */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#06B6D4]" />
                    Live Neural Feed
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
                    <AnimatePresence initial={false}>
                        {events.slice(0, 30).map((event: any, i: number) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-start gap-3 py-2 border-b border-white/5"
                            >
                                <span className="text-[#06B6D4] opacity-60 shrink-0 text-xs mt-0.5">
                                    {new Date().toLocaleTimeString()}
                                </span>
                                <span className={`shrink-0 text-xs px-2 py-0.5 rounded ${event.type === "tx_confirmed" ? "bg-green-900/40 text-green-400" :
                                    event.type === "llm_decision" ? "bg-purple-900/40 text-purple-300" :
                                        event.type === "ipfs_cid" ? "bg-cyan-900/40 text-cyan-400" :
                                            event.type === "error" ? "bg-red-900/40 text-red-400" :
                                                "bg-white/5 text-gray-400"
                                    }`}>
                                    {event.type.toUpperCase()}
                                </span>
                                <span className="text-gray-400 break-all">
                                    {JSON.stringify(event.data ?? event.txHash ?? event.cid ?? event.message ?? "")}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {events.length === 0 && (
                        <p className="text-gray-600 text-center py-8">
                            Waiting for agent signals...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
