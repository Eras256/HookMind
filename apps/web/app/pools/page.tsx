'use client';
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Layers, Cpu, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useLanguage } from "@/context/LanguageContext";

// ── Mock pool analytics data ───────────────────────────────────────────────
const generatePoolHistory = () =>
    Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        fee: Math.floor(2000 + Math.random() * 7000),
        vol: Math.floor(1000 + Math.random() * 8500),
    }));

function ILBar({ pct }: { pct: number }) {
    const color = pct > 70 ? "var(--color-neural-red)" : pct > 30 ? "var(--color-neural-gold)" : "var(--color-neural-green)";
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
                />
            </div>
            <span className="text-xs font-mono" style={{ color }}>{pct}%</span>
        </div>
    );
}

function FeeBar({ fee, max }: { fee: number; max: number }) {
    const pct = (fee / max) * 100;
    const color = fee >= 8000 ? "var(--color-neural-red)" : fee <= 1000 ? "var(--color-neural-green)" : "var(--color-neural-cyan)";
    return (
        <div>
            <span className="text-xs font-mono font-bold" style={{ color }}>{fee.toLocaleString()} bps</span>
            <div className="flex h-1 mt-1 rounded-full bg-white/10 overflow-hidden">
                <div className="rounded-full" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

export default function PoolsPage() {
    const { t, language } = useLanguage();
    const [analyticsPool, setAnalyticsPool] = useState<any | null>(null);
    const [analyticsData] = useState(() => generatePoolHistory());

    const hookPools = useMemo(() => [
        { pair: "WETH/USDC", t0: "⟠", t1: "💵", tvl: "$4.2M", vol24h: "$890K", currentFee: 7200, maxFee: 10000, status: t.pools.status_monitoring, strategy: "Volatility Shield", ilRisk: 65, lastUpdate: language === 'en' ? "12s ago" : language === 'es' ? "hace 12s" : "12秒前", agentEOA: "0xA3b4...F21c" },
        { pair: "cbBTC/USDC", t0: "₿", t1: "💵", tvl: "$1.8M", vol24h: "$320K", currentFee: 3000, maxFee: 10000, status: t.pools.status_monitoring, strategy: "Peg Keeper", ilRisk: 22, lastUpdate: language === 'en' ? "8s ago" : language === 'es' ? "hace 8s" : "8秒前", agentEOA: "0xE7c2...09aB" },
        { pair: "UNI/ETH", t0: "🦄", t1: "⟠", tvl: "$980K", vol24h: "$210K", currentFee: 10000, maxFee: 10000, status: t.pools.status_alert, strategy: "MEV Defender", ilRisk: 89, lastUpdate: language === 'en' ? "3s ago" : language === 'es' ? "hace 3s" : "3秒前", agentEOA: "0x8f1D...4Cc3" },
        { pair: "USDC/USDT", t0: "💵", t1: "💵", tvl: "$6.1M", vol24h: "$1.4M", currentFee: 500, maxFee: 10000, status: t.pools.status_monitoring, strategy: "Peg Keeper", ilRisk: 4, lastUpdate: language === 'en' ? "15s ago" : language === 'es' ? "hace 15s" : "15秒前", agentEOA: "0x3Dc1...A8f2" },
    ], [t, language]);

    const summaryStats = useMemo(() => [
        { label: t.pools.stat_tvl, value: "$13.1M", icon: TrendingUp },
        { label: t.pools.stat_active, value: "4", icon: Layers },
        { label: t.pools.stat_avg_fee, value: "5,475 bps", icon: Cpu },
        { label: t.pools.stat_nodes, value: "3 / 3", icon: Cpu },
    ], [t]);

    return (
        <>
            {/* Pool Analytics Modal */}
            <AnimatePresence>
                {analyticsPool && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setAnalyticsPool(null)}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-void/98 border border-neural-magenta/25 rounded-2xl p-7 backdrop-blur-[28px]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-white">{analyticsPool.pair} — {t.pools.chart_title}</h3>
                                    <p className="text-sm text-gray-500 font-mono mt-0.5">{t.pools.chart_subtitle}</p>
                                </div>
                                <button onClick={() => setAnalyticsPool(null)} className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={analyticsData} margin={{ left: -20, right: 8 }}>
                                    <defs>
                                        <linearGradient id="gFee" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-neural-cyan)" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="var(--color-neural-cyan)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gVol" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-neural-magenta)" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="var(--color-neural-magenta)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.1)" tickLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.1)" tickLine={false} tick={{ fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: "rgba(10,10,18,0.95)", border: "1px solid rgba(252,114,255,0.3)", borderRadius: 10, fontSize: 11, fontFamily: "JetBrains Mono" }} />
                                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                                    <Area type="monotone" dataKey="fee" stroke="var(--color-neural-cyan)" fill="url(#gFee)" strokeWidth={2} name={t.pools.chart_fee_legend} />
                                    <Area type="monotone" dataKey="vol" stroke="var(--color-neural-magenta)" fill="url(#gVol)" strokeWidth={2} name={t.pools.chart_vol_legend} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="pt-20 px-5 max-w-7xl mx-auto pb-16">
                {/* Header */}
                <div className="pt-8 mb-8">
                    <div className="inline-flex items-center gap-2 neon-badge mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-neural-cyan animate-pulse" />
                        {t.pools.hero_badge}
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-2">
                        {t.pools.hero_title}{" "}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-neural-cyan to-neural-magenta">
                            {t.pools.hero_subtitle}
                        </span>
                    </h1>
                    <p className="text-gray-500">{t.pools.hero_desc}</p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {summaryStats.map(({ label, value, icon: Icon }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="glass-card p-4 flex items-center gap-3"
                        >
                            <div className="p-2 rounded-lg bg-white/5">
                                <Icon size={16} className="text-neural-magenta" />
                            </div>
                            <div>
                                <div className="text-xl font-black font-mono text-white">{value}</div>
                                <div className="text-[11px] text-gray-500 font-mono">{label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Pool Cards */}
                <div className="space-y-3">
                    {hookPools.map((pool, i) => (
                        <motion.div
                            key={pool.pair}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="glass-card p-5"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-7 gap-4 items-center">
                                {/* Pair */}
                                <div className="md:col-span-1">
                                    <div className="text-2xl mb-0.5">{pool.t0}{pool.t1}</div>
                                    <div className="font-black text-white">{pool.pair}</div>
                                    <div className="text-[11px] text-gray-500 font-mono mt-0.5">{pool.agentEOA}</div>
                                </div>

                                {/* TVL / Vol */}
                                <div className="md:col-span-1 text-center">
                                    <div className="text-xs text-gray-500 font-mono uppercase">{t.pools.table_tvl}</div>
                                    <div className="font-bold text-white">{pool.tvl}</div>
                                    <div className="text-xs text-gray-600">{pool.vol24h} {t.pools.table_vol_24h}</div>
                                </div>

                                {/* Current Fee */}
                                <div className="md:col-span-1">
                                    <div className="text-xs text-gray-500 font-mono uppercase mb-1">{t.pools.table_fee}</div>
                                    <FeeBar fee={pool.currentFee} max={pool.maxFee} />
                                </div>

                                {/* IL Risk */}
                                <div className="md:col-span-2">
                                    <div className="text-xs text-gray-500 font-mono uppercase mb-1">{t.pools.table_il_risk}</div>
                                    <ILBar pct={pool.ilRisk} />
                                </div>

                                {/* Status + Strategy */}
                                <div className="md:col-span-1 text-center py-2 md:py-0">
                                    <span className={pool.status === t.pools.status_alert ? "px-2 py-0.5 rounded text-[10px] md:text-xs font-mono font-bold text-neural-red bg-neural-red/10 border border-neural-red/30 uppercase animate-pulse inline-block" : "status-running inline-block"}>
                                        {pool.status}
                                    </span>
                                    <div className="text-[10px] md:text-[11px] text-gray-500 font-mono mt-1">{pool.strategy}</div>
                                    <div className="text-[9px] md:text-[10px] text-gray-700 font-mono">{pool.lastUpdate}</div>
                                </div>

                                {/* Actions */}
                                <div className="md:col-span-1 flex gap-2 justify-end">
                                    <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setAnalyticsPool(pool)}
                                        className="btn-ghost text-xs px-3 py-2 rounded-lg"
                                    >
                                        {t.pools.btn_analytics}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => toast.loading(t.pools.toast_switching.replace('{pair}', pool.pair), { id: pool.pair })}
                                        className="btn-ghost text-xs px-3 py-2 rounded-lg"
                                    >
                                        {t.pools.btn_strategy}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </>
    );
}
