'use client';
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Layers, Cpu, X, ExternalLink, Shield, ShieldOff, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLanguage } from "@/context/LanguageContext";
import { usePoolIntelligenceFeed } from "@/hooks/usePoolIntelligenceFeed";
import { HOOK_MIND_CORE_ADDRESS, TARGET_POOL_ID, USDC_ADDRESS, WETH_ADDRESS } from "@/lib/constants";
import { useState } from "react";

const EXPLORER = "https://sepolia.uniscan.xyz";

function feeLabel(bps: number) { return `${(bps / 10000).toFixed(2)}%`; }
function volColor(s: number) { return s >= 7000 ? "var(--color-neural-red)" : s >= 4000 ? "var(--color-neural-gold)" : "var(--color-neural-green)"; }
function addr(a: string) { return `${a.slice(0,6)}…${a.slice(-4)}`; }

export default function PoolsPage() {
    const { t } = useLanguage();
    const { history, loading, error, latest } = usePoolIntelligenceFeed();
    const [showModal, setShowModal] = useState(false);

    const chartData = [...history].reverse().map((s, i) => ({
        time: `T-${history.length - 1 - i}`,
        fee: s.currentDynamicFee,
        vol: s.volatilityScore / 10, // scale to similar axis
    }));

    const ilRisk = latest ? Math.round(latest.volatilityScore / 100) : 0;

    return (
        <div className="pt-20 px-5 max-w-7xl mx-auto pb-20 space-y-8">
            {/* Header */}
            <div className="pt-8">
                <div className="inline-flex items-center gap-2 neon-badge mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-neural-cyan animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neural-cyan">
                        {t.pools.hero_badge}
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-2">
                    {t.pools.hero_title}{' '}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-neural-cyan to-neural-magenta">
                        {t.pools.hero_subtitle}
                    </span>
                </h1>
                <p className="text-gray-500 font-mono text-sm max-w-xl">{t.pools.hero_desc}</p>
            </div>

            {/* Stats row — real data */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: t.pools.stat_tvl,    value: loading ? "…" : "Live",            icon: TrendingUp },
                    { label: t.pools.stat_active,  value: "1",                               icon: Layers     },
                    { label: t.pools.stat_avg_fee, value: latest ? feeLabel(latest.currentDynamicFee) : "…", icon: Cpu },
                    { label: t.pools.stat_nodes,   value: "1",                               icon: Cpu        },
                ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="glass-card p-4 flex items-center gap-3">
                        <Icon size={16} className="text-neural-cyan shrink-0" />
                        <div>
                            <div className="text-[10px] text-gray-500 font-mono uppercase">{label}</div>
                            <div className="text-base font-black text-white font-mono">{value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Single real pool card */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-neural-cyan/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-neural-cyan/20 flex items-center justify-center text-sm">💵</div>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm -ml-2">⟠</div>
                            </div>
                            <div>
                                <div className="font-black text-xl text-white">USDC / WETH</div>
                                <div className="text-[10px] text-gray-500 font-mono">Unichain Sepolia · HookMind v1</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {latest?.ilProtectionActive ? (
                                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-neural-green border border-neural-green/30 rounded-full px-2 py-0.5">
                                    <Shield size={9} /> IL ACTIVE
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[10px] font-mono text-gray-500 border border-white/10 rounded-full px-2 py-0.5">
                                    <ShieldOff size={9} /> IL STANDBY
                                </span>
                            )}
                            <span className="text-[10px] font-mono text-neural-cyan border border-neural-cyan/20 rounded-full px-2 py-0.5">
                                {t.pools.status_monitoring}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Dynamic Fee</div>
                            <div className="text-lg font-black text-neural-cyan font-mono">
                                {latest ? feeLabel(latest.currentDynamicFee) : "…"}
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Volatility</div>
                            <div className="text-lg font-black font-mono" style={{ color: latest ? volColor(latest.volatilityScore) : "white" }}>
                                {latest ? latest.volatilityScore.toLocaleString() : "…"}
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">IL Risk</div>
                            <div className="text-lg font-black font-mono" style={{ color: volColor(ilRisk * 100) }}>
                                {ilRisk}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* On-chain links */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <a href={`${EXPLORER}/address/${HOOK_MIND_CORE_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-neural-cyan transition-colors">
                        Hook {addr(HOOK_MIND_CORE_ADDRESS)} <ExternalLink size={9} />
                    </a>
                    <span className="text-gray-700 text-[10px]">·</span>
                    <a href={`${EXPLORER}/address/${USDC_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-neural-cyan transition-colors">
                        USDC {addr(USDC_ADDRESS)} <ExternalLink size={9} />
                    </a>
                    <span className="text-gray-700 text-[10px]">·</span>
                    <a href={`${EXPLORER}/address/${WETH_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-neural-cyan transition-colors">
                        WETH {addr(WETH_ADDRESS)} <ExternalLink size={9} />
                    </a>
                </div>

                {/* Mini chart of fee history */}
                {chartData.length > 1 && (
                    <div>
                        <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">Fee History (on-chain snapshots)</div>
                        <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gFee2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-neural-cyan)" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="var(--color-neural-cyan)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                                    <XAxis dataKey="time" tick={{ fontSize: 8 }} stroke="rgba(255,255,255,0.1)" tickLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.1)" tickLine={false} tick={{ fontSize: 8 }} />
                                    <Tooltip contentStyle={{ background:"rgba(8,8,18,0.95)", border:"1px solid rgba(0,242,254,0.2)", borderRadius:8, fontSize:11 }} formatter={(v: any) => [`${v} bps`, "Fee"]} />
                                    <Area type="monotone" dataKey="fee" stroke="var(--color-neural-cyan)" fill="url(#gFee2)" strokeWidth={2} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-xs font-mono text-neural-red/70 bg-neural-red/5 border border-neural-red/20 rounded-xl px-4 py-2 mt-4">
                        {error}
                    </div>
                )}
            </div>

            {/* Pool ID reference */}
            <div className="text-[10px] font-mono text-gray-700 break-all px-1">
                Pool ID: {TARGET_POOL_ID}
            </div>
        </div>
    );
}
