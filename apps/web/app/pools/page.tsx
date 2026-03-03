// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { Activity, Droplets, Zap, Filter, ArrowRight } from "lucide-react";

export default function PoolsPage() {
    const pools = [
        { name: "WETH / USDC", fee: "Dynamic AI", tvl: "$42.1M", volume24h: "$12.4M", status: "Active" },
        { name: "WBTC / WETH", fee: "Dynamic AI", tvl: "$18.5M", volume24h: "$5.1M", status: "Active" },
        { name: "UNI / WETH", fee: "Dynamic AI", tvl: "$8.9M", volume24h: "$2.2M", status: "Active" },
        { name: "cbBTC / USDC", fee: "Dynamic AI", tvl: "$2.4M", volume24h: "$600K", status: "Active" },
    ];

    return (
        <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen">
            <div className="mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 neon-badge mb-6"
                >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    INTELLIGENCE
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black tracking-tighter mb-4"
                >
                    Agent-Managed <span className="text-[#06B6D4] glow-text">Pools</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-lg max-w-2xl"
                >
                    Monitor real-time liquidity pools controlled by HookMind's neural mesh. Fees are dynamically adjusted, protecting LPs natively in v4.
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card overflow-hidden"
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-[#06B6D4]" />
                        Active Pairs
                    </h2>
                    <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs uppercase tracking-wider text-gray-500 bg-black/40">
                                <th className="p-4 font-medium">Pool</th>
                                <th className="p-4 font-medium">Fee Strategy</th>
                                <th className="p-4 font-medium">TVL</th>
                                <th className="p-4 font-medium">24h Vol</th>
                                <th className="p-4 font-medium">Network Status</th>
                                <th className="p-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {pools.map((pool, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4 font-medium text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                                            <Droplets className="w-4 h-4 text-gray-400 group-hover:text-[#06B6D4] transition-colors" />
                                        </div>
                                        {pool.name}
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(6,182,212,0.1)] text-[#06B6D4] text-xs font-semibold border border-[rgba(6,182,212,0.2)]">
                                            <Zap className="w-3 h-3" />
                                            {pool.fee}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-300 font-mono text-sm">{pool.tvl}</td>
                                    <td className="p-4 text-gray-300 font-mono text-sm">{pool.volume24h}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                            <span className="text-green-400">Monitoring</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="inline-flex items-center justify-center p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 cursor-pointer">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
