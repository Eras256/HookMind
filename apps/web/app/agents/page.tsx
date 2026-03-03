"use client";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useState } from "react";
import { Zap, Shield, Activity, Database, Server, Lock, Settings, Download, Trophy } from "lucide-react";
import { toast } from "sonner";
import NodeSettingsModal from "@/components/ui/NodeSettingsModal";
import { LEADERBOARD_DATA } from "@/app/leaderboard/data";
import Link from "next/link";

const OPERATOR_METRICS = [
    { label: "Total Signals Sent", value: "1,847", icon: Zap, color: "text-neural-cyan", sublabel: "On-chain nonces burned", glow: "var(--color-neural-cyan)" },
    { label: "Approval Rate", value: "98.2%", icon: Shield, color: "text-neural-green", sublabel: "Guardrails passed", glow: "var(--color-neural-green)" },
    { label: "Daemon Uptime", value: "99.9%", icon: Activity, color: "text-neural-purple", sublabel: "Last 30 days", glow: "var(--color-neural-purple)" },
    { label: "Last IPFS CID", value: "QmXr7Y...", icon: Database, color: "text-neural-gold", sublabel: "Click to view audit", glow: "var(--color-neural-gold)" },
];

const ACTIVE_ASSIGNMENTS = [
    { pool: "WETH/USDC", fee: "7200 bps", lastSignal: "12 secs ago", status: "RUNNING" },
    { pool: "cbBTC/USDC", fee: "3000 bps", lastSignal: "8 secs ago", status: "RUNNING" },
    { pool: "UNI/ETH", fee: "10000 bps", lastSignal: "3 secs ago", status: "ALERT" },
];

const RECENT_SUBMISSIONS = [
    { block: "1,420,271", pool: "WETH/USDC", fee: "7200 bps", action: "FEE_ADJUST", cid: "QmXr7Y...3kPp", status: "APPROVED" },
    { block: "1,420,270", pool: "UNI/ETH", fee: "11200 bps", action: "FEE_ADJUST", cid: "QmAb4Z...9mQx", status: "REJECTED (GUARDRAIL)" },
    { block: "1,420,269", pool: "WETH/USDC", fee: "8500 bps", action: "FEE_ADJUST", cid: "QmCd9P...1rKz", status: "APPROVED" },
    { block: "1,420,268", pool: "cbBTC/USDC", fee: "3000 bps", action: "FEE_ADJUST", cid: "QmEf2L...4wNv", status: "APPROVED" },
    { block: "1,420,267", pool: "WETH/USDC", fee: "6800 bps", action: "IL_ACTIVATE", cid: "QmGh5M...7bJq", status: "APPROVED" },
];


export default function AgentsPage() {
    const { address, isConnected } = useAccount();
    const [settingsOpen, setSettingsOpen] = useState(false);

    // ── Wallet Gate ──────────────────────────────────────────────────────────
    if (!isConnected) {
        return (
            <div className="pt-32 flex flex-col items-center justify-center min-h-[70vh] gap-5">
                <div className="p-6 rounded-2xl bg-white/3 border border-white/8">
                    <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-center text-white mb-2">Connect Wallet to Activate Node</h2>
                    <p className="text-gray-500 text-sm text-center max-w-xs">
                        Your Operator Console is locked. Connect your wallet to access your AI agent node statistics on Unichain.
                    </p>
                </div>
            </div>
        );
    }

    const truncAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

    return (
        <>
            <NodeSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

            <div className="pt-20 px-5 max-w-7xl mx-auto pb-16">
                {/* ── Hero ─────────────────────────────────────────────── */}
                <div className="pt-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 neon-badge mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-neural-green animate-pulse" style={{ boxShadow: "0 0 6px var(--color-neural-green)" }} />
                            UNICHAIN NODE ONLINE
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter mb-2">
                            Operator {" "}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-neural-magenta to-neural-cyan">
                                Console
                            </span>
                        </h1>
                        <p className="text-gray-500">
                            Monitor your AI agent node performance on Unichain. Wallet:{" "}
                            <span className="font-mono text-white">{truncAddr}</span>
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <motion.button
                            whileHover={{ scale: 1.03, borderColor: "var(--color-neural-magenta)" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSettingsOpen(true)}
                            className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm"
                        >
                            <Settings size={15} /> Node Settings
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => toast.success("Keystore downloaded securely.")}
                            className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm"
                        >
                            <Download size={15} /> Download Keystore
                        </motion.button>
                    </div>
                </div>

                {/* ── KPI Grid ─────────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    {OPERATOR_METRICS.map(({ label, value, icon: Icon, color, sublabel, glow }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="glass-card p-5 cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-lg" style={{ background: `${glow}15` }}>
                                    <Icon size={14} style={{ color: glow }} />
                                </div>
                                <span className="text-[10px] text-gray-600 uppercase tracking-wider font-mono">{label}</span>
                            </div>
                            <div className={`text-2xl font-black font-mono ${color}`}>{value}</div>
                            <div className="text-[11px] text-gray-600 mt-0.5 font-mono">{sublabel}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                    {/* ── Active Pool Assignments ───────────────────────── */}
                    <div className="lg:col-span-1 glass-card p-5">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 font-mono mb-4 flex items-center gap-2">
                            <Server size={14} className="text-neural-magenta" /> Active Pool Assignments
                        </h2>
                        <div className="space-y-3">
                            {ACTIVE_ASSIGNMENTS.map((a) => (
                                <div
                                    key={a.pool}
                                    className={`flex items-center justify-between p-3 rounded-xl border ${a.status === "ALERT" ? "bg-neural-red/5 border-neural-red/30" : "bg-white/3 border-white/6"}`}
                                >
                                    <div>
                                        <div className="font-bold text-sm text-white font-mono">{a.pool}</div>
                                        <div className="text-xs text-gray-500 font-mono">{a.lastSignal}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-white font-mono mb-1">{a.fee}</div>
                                        <span className={a.status === "RUNNING" ? "status-running" : "px-2 py-0.5 rounded text-xs font-mono font-bold text-neural-red bg-neural-red/10 border border-neural-red/30 uppercase animate-pulse"}>
                                            {a.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Recent Submissions ────────────────────────────── */}
                    <div className="lg:col-span-2 glass-card p-5 overflow-x-auto">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 font-mono mb-4 flex items-center gap-2">
                            <Zap size={14} className="text-neural-cyan" /> Recent On-Chain Submissions
                        </h2>
                        <table className="w-full text-xs font-mono">
                            <thead>
                                <tr className="text-gray-600 border-b border-white/5">
                                    {["Block", "Pool", "Fee", "Action", "CID", "Status"].map((h) => (
                                        <th key={h} className="text-left pb-2 pr-4 font-semibold uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {RECENT_SUBMISSIONS.map((s, i) => {
                                    const rejected = s.status.includes("REJECTED");
                                    return (
                                        <motion.tr
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            className={`border-b border-white/3 ${rejected ? "bg-neural-red/5" : "bg-transparent"}`}
                                        >
                                            <td className="py-2.5 pr-4 text-gray-400">{s.block}</td>
                                            <td className="pr-4 text-white">{s.pool}</td>
                                            <td className="pr-4 text-neural-cyan">{s.fee}</td>
                                            <td className="pr-4 text-gray-400">{s.action}</td>
                                            <td className="pr-4">
                                                <a href={`https://ipfs.io/ipfs/${s.cid}`} target="_blank" rel="noopener noreferrer"
                                                    className="text-neural-magenta hover:text-white underline underline-offset-2 transition-colors">
                                                    {s.cid}
                                                </a>
                                            </td>
                                            <td className={rejected ? "text-neural-red" : "text-neural-green"}>{s.status}</td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Leaderboard Section ────────────────────────────────── */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-2">
                            <Trophy size={14} className="text-neural-gold" /> Network Leaderboard
                        </h2>
                        <Link href="/leaderboard" className="text-xs text-neural-magenta hover:underline flex items-center gap-1 font-mono uppercase tracking-tighter">
                            Full Rankings <Activity size={10} />
                        </Link>
                    </div>

                    <div className="space-y-2">
                        {LEADERBOARD_DATA.slice(0, 5).map((entry, i) => (
                            <motion.div
                                key={entry.address}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-4 p-3 rounded-xl bg-white/2 border border-white/5 hover:border-neural-magenta/30 hover:bg-neural-magenta/5 transition-all group"
                            >
                                <span className="text-lg w-8 text-center shrink-0">
                                    {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-mono text-sm text-white truncate group-hover:text-neural-magenta transition-colors">
                                        {entry.ens || `${entry.address.slice(0, 10)}...${entry.address.slice(-6)}`}
                                    </div>
                                    <div className="text-[10px] text-white/30 truncate">{entry.badge} — {entry.model}</div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-sm font-bold font-mono text-neural-magenta">
                                        {entry.signalsSent.toLocaleString()}
                                    </div>
                                    <div className="text-[9px] text-white/20">signals</div>
                                </div>
                                <div className="text-right shrink-0 hidden sm:block">
                                    <div className="text-sm font-bold font-mono text-neural-cyan">
                                        {entry.accuracy}%
                                    </div>
                                    <div className="text-[9px] text-white/20">accuracy</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
