'use client';
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Clock, DollarSign, Zap, Activity, CheckCircle2, Globe, Cpu } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { useHookMind } from "@/hooks/useHookMind";
import { useAccount } from "wagmi";
import { useLanguage } from "@/context/LanguageContext";

// ── Synthetic signal volume data ──────────────────────────────────────────────
const generateSignalData = () => {
    const data = [];
    let volume = 5000;
    for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h += 4) {
            volume += Math.random() * 1200 - 400;
            data.push({
                label: `D${d + 1} ${h}:00`,
                volume: Math.round(volume),
                consensus: Math.round(volume * (0.85 + Math.random() * 0.1)),
            });
        }
    }
    return data;
};

const SIGNAL_DATA = generateSignalData();

// ── Registry Node Status ──────────────────────────────────────────────────
function NodeStatus({ active }: { active: boolean }) {
    const color = active ? "#00FFA3" : "#FC72FF";
    return (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500`} style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}>
                    <Cpu className="w-6 h-6" style={{ color }} />
                </div>
                {active && <span className="absolute -top-1 -right-1 w-3 h-3 bg-neural-green rounded-full animate-pulse shadow-[0_0_100px_#00FFA3]" />}
            </div>
            <div>
                <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-1">Node Status</div>
                <div className={`text-lg font-black tracking-tighter italic uppercase`} style={{ color }}>
                    {active ? "Registry Active" : "Activation Required"}
                </div>
            </div>
        </div>
    );
}

export default function RegistryPage() {
    const { isConnected } = useAccount();
    const { payInsurancePremium } = useHookMind(); // Reuse for 10 MXN fee
    const { t, language } = useLanguage();
    const [activating, setActivating] = useState(false);
    const [active, setActive] = useState(false);

    const handleActivate = async () => {
        if (!isConnected) {
            toast.error(t.vault.toast_connect || "Please connect wallet");
            return;
        }

        setActivating(true);
        try {
            // Mocking the 10 MXN fee payment
            toast.loading(t.agents.connect_title || "Activating Registry Node...", { id: "activate" });
            await new Promise(r => setTimeout(r, 2000));
            toast.success("Node Successfully Registered on Unichain!", { id: "activate" });
            setActive(true);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Activation failed", { id: "activate" });
        } finally {
            setActivating(false);
        }
    };

    const registryStats = useMemo(() => [
        { label: "P2P Swarm Volume (24h)", value: "142,820", icon: Activity, color: "#FC72FF" },
        { label: "Collective Neural Consensus", value: "98.4%", icon: Zap, color: "#00F2FE" },
        { label: t.nav.registry, value: "100 CELO", icon: DollarSign, color: "text-amber-400" },
        { label: "Active Network Nodes", value: "8,247", icon: Globe, color: "#00FFA3" },
    ], []);

    return (
        <div className="pt-20 px-5 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="pt-8 mb-10">
                <div className="inline-flex items-center gap-2 neon-badge mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-neural-magenta animate-pulse" />
                    Agent Registry & P2P Swarm
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-3">
                    Activate Your <br className="sm:hidden" />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-neural-magenta to-neural-cyan">
                        Neural Hub
                    </span>
                </h1>
                <p className="text-gray-500 max-w-2xl font-mono text-sm leading-relaxed">
                    HookMind's Agent Registry is the primary gateway for Unichain node operators. 
                    Join the P2P swarm intelligence layer and start contributing to scalable signal volume.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* ── Signal Volume Panel (3 cols) ─────────────────────── */}
                <div className="lg:col-span-3 glass-card p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-neural-cyan" />
                            Swarm Signal Metrics
                        </h2>
                        <span className="neon-badge text-[10px] text-neural-green">
                            NETWORK STATUS: SYNCED
                        </span>
                    </div>

                    {/* Signal Volume Chart */}
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={SIGNAL_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FC72FF" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#FC72FF" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradConsensus" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00F2FE" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#00F2FE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                                <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="rgba(255,255,255,0.1)" tickLine={false} interval={6} />
                                <YAxis stroke="rgba(255,255,255,0.1)" tickLine={false} tick={{ fontSize: 9 }} />
                                <Tooltip
                                    contentStyle={{ background: "rgba(8,8,18,0.95)", border: "1px solid rgba(252,114,255,0.3)", borderRadius: 10, fontSize: 11, fontFamily: "JetBrains Mono" }}
                                    formatter={(v: any) => [`${v.toLocaleString()} Signals`]}
                                />
                                <Area type="monotone" dataKey="volume" stroke="#FC72FF" fill="url(#gradVolume)" strokeWidth={2} name="Total Signals" />
                                <Area type="monotone" dataKey="consensus" stroke="#00F2FE" fill="url(#gradConsensus)" strokeWidth={2} name="Valid Consensus" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {registryStats.map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="bg-white/3 rounded-xl p-4 flex items-center gap-3 border border-white/5 group hover:border-white/10 transition-colors">
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
                        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(252,114,255,0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = '/leaderboard'}
                        className="w-full py-4 rounded-xl font-black italic uppercase tracking-widest text-sm bg-neural-magenta text-black shadow-[0_0_20px_rgba(252,114,255,0.2)]"
                    >
                        View Collective Intelligence Ranking →
                    </motion.button>
                </div>

                {/* ── Node Activation Panel (2 cols) ───────────────────── */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                    <NodeStatus active={active} />

                    <div className="glass-card p-6 flex flex-col gap-5 flex-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neural-cyan/10 blur-[60px] -z-10 group-hover:bg-neural-cyan/20 transition-all" />
                        
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Shield className="w-5 h-5 text-neural-cyan" />
                            Registry Gateway
                        </h2>

                        <div className="p-4 rounded-xl bg-neural-cyan/5 border border-neural-cyan/20 text-sm font-mono leading-relaxed text-gray-400">
                             To start processing <strong className="text-white">P2P Swarm Signals</strong>, each node must pay a one-time activation fee. 
                             This ensures network stability and a sustainable <strong className="text-white">Revenue First</strong> model.
                        </div>

                        <div className="space-y-4 my-4">
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-gray-500 font-mono uppercase tracking-tighter">Activation Fee</span>
                                <span className="font-black text-white font-mono">10.00 MXN</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-gray-500 font-mono uppercase tracking-tighter">Network Access</span>
                                <span className="font-black text-white font-mono">Unlimited P2P</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <span className="text-gray-500 font-mono uppercase tracking-tighter">Consensus Weight</span>
                                <span className="font-black text-neural-cyan font-mono">1.0X Base</span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: active ? "none" : "0 0 40px rgba(0,242,254,0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleActivate}
                            disabled={activating || active}
                            className="w-full py-4 rounded-xl font-black italic uppercase tracking-widest text-sm mt-auto flex items-center justify-center gap-2 transition-all"
                            style={
                                active
                                    ? { background: "rgba(0,255,163,0.1)", border: "1px solid rgba(0,255,163,0.3)", color: "#00FFA3" }
                                    : { background: "linear-gradient(135deg, #FC72FF, #00F2FE)", color: "#000", opacity: activating ? 0.7 : 1 }
                            }
                        >
                            {active ? (
                                <><CheckCircle2 className="w-4 h-4" /> Node Registry Verified</>
                            ) : activating ? (
                                <><div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> Finalizing...</>
                            ) : (
                                <><Zap className="w-4 h-4" /> Activate Node (10 MXN)</>
                            )}
                        </motion.button>
                        
                        {!active && (
                            <p className="text-[10px] text-center text-gray-600 font-mono uppercase tracking-widest mt-2">
                                Requires Unichain Sepolia Connection
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
