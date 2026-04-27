'use client';
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import SwapQuotePanel from "@/components/ui/SwapQuotePanel";
import InstitutionalCompliance from "@/components/ui/InstitutionalCompliance";
import YieldActivityFeed from "@/components/ui/YieldActivityFeed";
import { 
    Shield, TrendingUp, Clock, DollarSign, Zap, 
    Activity, CheckCircle2, Globe, Cpu, BarChart3, 
    Lock, ArrowUpRight, Info
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid,
} from "recharts";
import { toast } from "sonner";
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

// ── Registry Node Status Component ─────────────────────────────────────────
function NodeStatus({ active, t }: { active: boolean, t: any }) {
    const color = active ? "#00FFA3" : "#FC72FF";
    return (
        <div className="flex items-center gap-4 bg-void border border-white/10 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
            <div className="relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500`} 
                     style={{ borderColor: `${color}40`, backgroundColor: `${color}05` }}>
                    <Cpu className="w-8 h-8" style={{ color }} />
                </div>
                {active && <span className="absolute -top-1 -right-1 w-4 h-4 bg-neural-green rounded-full animate-pulse shadow-[0_0_15px_#00FFA3]" />}
            </div>
            <div>
                <div className="text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase mb-1">{t.vault.node_status}</div>
                <div className={`text-xl font-black tracking-tighter italic uppercase flex items-center gap-2`} style={{ color }}>
                    {active ? t.vault.active : "VERIFICATION PENDING"}
                </div>
            </div>
        </div>
    );
}

export default function TreasuryPage() {
    const { isConnected } = useAccount();
    const { t } = useLanguage();
    const [activating, setActivating] = useState(false);
    const [active, setActive] = useState(false);

    const handleActivate = async () => {
        if (!isConnected) {
            toast.error(t.agents.connect_title || "Please connect wallet");
            return;
        }

        setActivating(true);
        try {
            toast.loading("Initiating Node Registration Transaction...", { id: "activate" });
            await new Promise(r => setTimeout(r, 2000));
            toast.success("Institutional Node Successfully Registered!", { id: "activate" });
            setActive(true);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Registration failed", { id: "activate" });
        } finally {
            setActivating(false);
        }
    };

    const treasuryStats = useMemo(() => [
        { label: t.vault.signal_volume, value: "142,820", icon: BarChart3, color: "#FC72FF" },
        { label: t.vault.consensus, value: "99.85%", icon: Zap, color: "#00F2FE" },
        { label: t.vault.activation_fee, value: t.vault.fee_amount, icon: DollarSign, color: "#A78BFA" },
        { label: t.vault.active_nodes, value: "12,407", icon: Globe, color: "#00FFA3" },
    ], [t]);

    return (
        <div className="pt-24 px-6 max-w-7xl mx-auto pb-24">
            {/* ── HEADER ────────────────────────────────────────────────────────── */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 neon-badge mb-4 px-3 py-1"
                    >
                        <Lock size={12} className="text-neural-magenta" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neural-magenta">
                            {t.nav.registry} & Institutional Guard
                        </span>
                    </motion.div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4 italic leading-tight">
                        {t.vault.title.split(' ')[0]} <br className="sm:hidden" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-neural-magenta to-neural-cyan">
                            {t.vault.title.split(' ').slice(1).join(' ')}
                        </span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl font-mono text-sm leading-relaxed">
                        {t.vault.description}
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                        <ArrowUpRight size={14} /> EXPORT AUDIT
                    </button>
                    <button className="px-5 py-2.5 rounded-xl bg-neural-cyan/10 border border-neural-cyan/30 text-[10px] font-mono font-bold text-neural-cyan hover:bg-neural-cyan/20 transition-all flex items-center gap-2">
                        <Info size={14} /> VIEW COMPLIANCE
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* ── LEFT COLUMN: METRICS (8 cols) ────────────────────────────────── */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Signal Volume & Yield Chart */}
                    <div className="glass-card p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-neural-magenta/5 blur-[80px] -z-10" />
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-neural-cyan" />
                                Treasury Yield Smoothing
                            </h2>
                            <div className="flex items-center gap-4 font-mono text-[10px]">
                                <div className="flex items-center gap-2 text-neural-magenta">
                                    <span className="w-2 h-2 rounded-full bg-neural-magenta" /> TOTAL REVENUE
                                </div>
                                <div className="flex items-center gap-2 text-neural-cyan">
                                    <span className="w-2 h-2 rounded-full bg-neural-cyan" /> SMOOTHED YIELD
                                </div>
                            </div>
                        </div>

                        <div className="h-64 mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={SIGNAL_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gradVolume" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#FC72FF" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#FC72FF" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradConsensus" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#00F2FE" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#00F2FE" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="label" hide />
                                    <YAxis stroke="rgba(255,255,255,0.1)" tick={{fontSize: 10, fill: '#666'}} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: "#080808", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="volume" stroke="#FC72FF" fill="url(#gradVolume)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="consensus" stroke="#00F2FE" fill="url(#gradConsensus)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {treasuryStats.map(({ label, value, icon: Icon, color }) => (
                                <div key={label} className="bg-white/2 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                                        <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest truncate">{label}</div>
                                    </div>
                                    <div className="text-lg font-black text-white font-mono">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Audit Log (Yield Activity) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <YieldActivityFeed />
                        <div className="glass-card p-8 flex flex-col justify-center bg-neural-magenta/5 border-l-4 border-neural-magenta">
                            <h3 className="text-xl font-black text-white mb-4 italic tracking-tight uppercase">Smoothing Mechanism</h3>
                            <p className="text-xs text-gray-400 font-mono leading-relaxed mb-6">
                                HookMind utilizes an Epoch-based drip release. Instead of immediate distribution, fees collected by the Hook are buffered in the Treasury and released linearly over 7 days. This prevents yield volatility and protects long-term LPs.
                            </p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
                                    <span className="text-gray-500">Current Epoch ID</span>
                                    <span className="text-white font-bold">#42</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
                                    <span className="text-gray-500">Time to Next Release</span>
                                    <span className="text-neural-cyan font-bold">14h 22m</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                    <span className="text-gray-500">Smoothing Buffer</span>
                                    <span className="text-neural-green font-bold">84,204 USDC</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compliance Section */}
                    <InstitutionalCompliance />
                </div>

                {/* ── RIGHT COLUMN: NODE & INSURANCE (4 cols) ───────────────────────── */}
                <div className="lg:col-span-4 space-y-6">
                    
                    <NodeStatus active={active} t={t} />

                    {/* Activation Card */}
                    <div className="glass-card p-8 relative overflow-hidden group border-t-2 border-neural-cyan flex flex-col min-h-[400px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neural-cyan/5 blur-[60px] -z-10" />
                        
                        <h2 className="font-black text-lg flex items-center gap-2 mb-6">
                            <Shield className="w-5 h-5 text-neural-cyan" />
                            {t.vault.gateway_title}
                        </h2>

                        <p className="text-xs font-mono leading-relaxed text-gray-500 mb-8 bg-void p-4 rounded-xl border border-white/5">
                             {t.vault.gateway_desc}
                        </p>

                        <div className="space-y-4 mb-10 flex-1">
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                <span className="text-gray-500 font-mono uppercase tracking-tighter">{t.vault.activation_fee}</span>
                                <span className="font-black text-white font-mono">{t.vault.fee_amount}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                <span className="text-gray-500 font-mono uppercase tracking-tighter">SaaS License</span>
                                <span className="font-black text-neural-green font-mono">LIFETIME</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-mono uppercase tracking-tighter">Treasury Weight</span>
                                <span className="font-black text-neural-cyan font-mono">1.25x (Early Bird)</span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleActivate}
                            disabled={activating || active}
                            className="w-full py-5 rounded-2xl font-black italic uppercase tracking-[0.2em] text-sm mt-auto shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all"
                            style={
                                active
                                    ? { background: "rgba(0,255,163,0.1)", border: "2px solid rgba(0,255,163,0.3)", color: "#00FFA3" }
                                    : { background: "linear-gradient(135deg, #FC72FF, #00F2FE)", color: "#000" }
                            }
                        >
                            {active ? (
                                <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> REGISTERED</span>
                            ) : activating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> 
                                    PROCESSING
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2"><Zap size={16} /> {t.vault.activate_btn}</span>
                            )}
                        </motion.button>
                    </div>

                    {/* Insurance Swap Section */}
                    <div className="glass-card p-8 border-b-4 border-neural-magenta">
                        <h2 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-neural-magenta" />
                            Premium Acquisition
                        </h2>
                        <p className="text-[10px] text-gray-500 font-mono mb-6 uppercase tracking-widest">
                            Swap for USDC to fund insurance premiums
                        </p>
                        <SwapQuotePanel
                            tokenIn={{ address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', decimals: 18 }}
                            tokenOut={{ address: '0x7780Ba8F829A797D17634E79519e2fdF929fD698', symbol: 'USDC', decimals: 6 }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
