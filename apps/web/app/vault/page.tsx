"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Clock, DollarSign, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid,
} from "recharts";
import { toast } from "sonner";

// ── Synthetic epoch drip data ──────────────────────────────────────────────
const generateDripData = () => {
    const data = [];
    let accrued = 0;
    let claimable = 0;
    for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h += 6) {
            accrued += Math.random() * 800 + 200;
            claimable = accrued * ((d * 24 + h) / 168);
            data.push({
                label: `D${d + 1} ${h}:00`,
                accrued: Math.round(accrued),
                claimable: Math.round(claimable),
            });
        }
    }
    return data;
};

const DRIP_DATA = generateDripData();

// ── IL Gauge ───────────────────────────────────────────────────────────────
function ILGauge({ pct }: { pct: number }) {
    const stroke = pct > 3 ? "#FF3366" : pct > 1.5 ? "#EAB308" : "#00FFA3";
    const r = 52;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - Math.min(pct, 5) / 5);
    return (
        <div className="relative w-36 h-36 mx-auto">
            <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
                <circle cx="75" cy="75" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle
                    cx="75" cy="75" r={r} fill="none"
                    stroke={stroke}
                    strokeWidth="10"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 8px ${stroke})`, transition: "stroke-dashoffset 0.8s ease" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-black font-mono" style={{ color: stroke }}>{pct.toFixed(2)}%</div>
                <div className="text-xs text-gray-600 font-mono">IL EXPOSURE</div>
            </div>
        </div>
    );
}

export default function VaultPage() {
    const [enrolling, setEnrolling] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const ilPct = 2.31; // Mocked live from SDK

    const handleEnroll = async () => {
        setEnrolling(true);
        toast.loading("Awaiting approve USDC (10 USDC premium)...", { id: "enroll" });
        await new Promise((r) => setTimeout(r, 1200));
        toast.loading("Submitting payPremium() on-chain...", { id: "enroll" });
        await new Promise((r) => setTimeout(r, 1500));
        toast.success("IL Insurance activated! Your LP position is protected.", { id: "enroll" });
        setEnrolled(true);
        setEnrolling(false);
    };

    const handleClaim = () => {
        toast.loading("Simulating Flash Accounting — estimating claimable yield...", { id: "claim" });
        setTimeout(() => toast.success("Yield claim submitted! Receiving ~1,240 USDC from epoch drip.", { id: "claim" }), 2000);
    };

    return (
        <div className="pt-20 px-5 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="pt-8 mb-10">
                <div className="inline-flex items-center gap-2 neon-badge mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-neural-cyan animate-pulse" />
                    YIELD & INSURANCE
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-3">
                    Yield{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-neural-cyan to-neural-magenta">
                        Vault
                    </span>{" "}
                    & IL Shield
                </h1>
                <p className="text-gray-500 max-w-2xl">
                    Swap fees smooth over 7-day epochs via ERC-4626. Enroll your LP position in IL insurance for 10 USDC premium — protected up to 500 USDC.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* ── YieldVault Panel (3 cols) ─────────────────────── */}
                <div className="lg:col-span-3 glass-card p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-neural-cyan" />
                            ERC-4626 Epoch Drip
                        </h2>
                        <span className="neon-badge text-[10px]">EPOCH 14 · 3d 12h LEFT</span>
                    </div>

                    {/* Accrued vs Claimable Chart */}
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={DRIP_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradAccrued" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FC72FF" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#FC72FF" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradClaimable" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00F2FE" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#00F2FE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                                <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="rgba(255,255,255,0.1)" tickLine={false} interval={3} />
                                <YAxis stroke="rgba(255,255,255,0.1)" tickLine={false} tick={{ fontSize: 9 }} />
                                <Tooltip
                                    contentStyle={{ background: "rgba(8,8,18,0.95)", border: "1px solid rgba(252,114,255,0.3)", borderRadius: 10, fontSize: 11, fontFamily: "JetBrains Mono" }}
                                    formatter={(v: any) => [`${v.toLocaleString()} USDC`]}
                                />
                                <Area type="monotone" dataKey="accrued" stroke="#FC72FF" fill="url(#gradAccrued)" strokeWidth={2} name="Accrued" />
                                <Area type="monotone" dataKey="claimable" stroke="#00F2FE" fill="url(#gradClaimable)" strokeWidth={2} name="Claimable" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { label: "Total Accrued This Epoch", value: "4,820 USDC", icon: DollarSign, color: "#FC72FF" },
                            { label: "Claimable Now (51% done)", value: "2,458 USDC", icon: Zap, color: "#00F2FE" },
                            { label: "Drip Rate / second", value: "0.00039 USDC", icon: Clock, color: "#A78BFA" },
                            { label: "Total Depositors", value: "247 LPs", icon: Shield, color: "#00FFA3" },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="bg-black/30 rounded-xl p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg shrink-0" style={{ background: `${color}15` }}>
                                    <Icon className="w-4 h-4" style={{ color }} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] text-gray-600 font-mono uppercase tracking-wider truncate">{label}</div>
                                    <div className="text-sm md:text-base font-black text-white font-mono mt-0.5">{value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,242,254,0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClaim}
                        className="w-full py-3.5 rounded-xl font-bold text-sm btn-primary"
                    >
                        Claim Yield (2,458 USDC)
                    </motion.button>
                </div>

                {/* ── IL Insurance Panel (2 cols) ───────────────────── */}
                <div className="lg:col-span-2 glass-card p-6 flex flex-col gap-5">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-neural-magenta" />
                        IL Insurance Pool
                    </h2>

                    {/* Live IL Gauge */}
                    <ILGauge pct={ilPct} />

                    {/* Info Box */}
                    <div
                        className="rounded-xl p-4 text-sm leading-relaxed"
                        style={{ background: "rgba(252,114,255,0.06)", border: "1px solid rgba(252,114,255,0.2)" }}
                    >
                        Pay a <strong className="text-white">10 USDC premium</strong> to activate insurance.
                        If your LP exits with IL &gt; <strong className="text-white">2%</strong>, the pool auto-compensates up to{" "}
                        <strong className="text-white">500 USDC</strong> via Circle CCTP v2.
                    </div>

                    {/* Pool stats */}
                    <div className="space-y-2.5">
                        {[
                            { label: "Pool Balance (USDC)", value: "82,400" },
                            { label: "Active Enrollments", value: "611" },
                            { label: "IL Threshold", value: "2.00%" },
                            { label: "Max Payout / LP", value: "500 USDC" },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between text-sm">
                                <span className="text-gray-500 font-mono">{label}</span>
                                <span className="font-bold text-white font-mono">{value}</span>
                            </div>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(252,114,255,0.5)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleEnroll}
                        disabled={enrolling || enrolled}
                        className="w-full py-3.5 rounded-xl font-bold text-sm mt-auto flex items-center justify-center gap-2"
                        style={
                            enrolled
                                ? { background: "rgba(0,255,163,0.15)", border: "1px solid rgba(0,255,163,0.4)", color: "#00FFA3" }
                                : { background: "linear-gradient(135deg, #FC72FF, #00F2FE)", color: "#000", opacity: enrolling ? 0.7 : 1 }
                        }
                    >
                        {enrolled ? (
                            <><CheckCircle2 className="w-4 h-4" /> Protected — LP Enrolled</>
                        ) : enrolling ? (
                            <><div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> Enrolling...</>
                        ) : (
                            <><Shield className="w-4 h-4" /> Pay Premium & Enroll (10 USDC)</>
                        )}
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
