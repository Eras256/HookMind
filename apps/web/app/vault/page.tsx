'use client';
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import SwapQuotePanel from "@/components/ui/SwapQuotePanel";
import InstitutionalCompliance from "@/components/ui/InstitutionalCompliance";
import PoolIntelligenceFeed from "@/components/ui/PoolIntelligenceFeed";
import { usePoolIntelligenceFeed } from "@/hooks/usePoolIntelligenceFeed";
import {
    Shield, TrendingUp, DollarSign, Zap,
    CheckCircle2, Globe, Cpu, BarChart3,
    Lock, ArrowUpRight, Info, ExternalLink
} from "lucide-react";
import {
    Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseEther, parseUnits, formatUnits } from "viem";
import { useLanguage } from "@/context/LanguageContext";
import {
    AGENT_REGISTRY_ADDRESS, AGENT_REGISTRY_ABI,
    IL_INSURANCE_ADDRESS, IL_INSURANCE_ABI,
    YIELD_VAULT_ADDRESS, YIELD_VAULT_ABI,
    USDC_ADDRESS, WETH_ADDRESS, TARGET_POOL_ID,
} from "@/lib/constants";

const USDC_APPROVE_ABI = [
    {
        inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;

const EXPLORER = "https://sepolia.uniscan.xyz/tx/";

// ── Node Status ────────────────────────────────────────────────────────────────
function NodeStatus({ active, t }: { active: boolean; t: Record<string, any> }) {
    const color = active ? "#00FFA3" : "#FC72FF";
    return (
        <div className="flex items-center gap-4 bg-void border border-white/10 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
            <div className="relative">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500"
                    style={{ borderColor: `${color}40`, backgroundColor: `${color}05` }}
                >
                    <Cpu className="w-8 h-8" style={{ color }} />
                </div>
                {active && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-neural-green rounded-full animate-pulse shadow-[0_0_15px_#00FFA3]" />
                )}
            </div>
            <div>
                <div className="text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase mb-1">
                    {t.vault.node_status}
                </div>
                <div
                    className="text-xl font-black tracking-tighter italic uppercase"
                    style={{ color }}
                >
                    {active ? t.vault.active : "VERIFICATION PENDING"}
                </div>
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function TreasuryPage() {
    const { address, isConnected } = useAccount();
    const { t } = useLanguage();
    const [activating, setActivating] = useState(false);
    const [activateTxHash, setActivateTxHash] = useState<`0x${string}` | null>(null);
    const [payingPremium, setPayingPremium] = useState(false);
    const [premiumTxHash, setPremiumTxHash] = useState<`0x${string}` | null>(null);
    const { history: poolHistory, latest } = usePoolIntelligenceFeed();
    const { writeContractAsync } = useWriteContract();

    // ── On-chain reads ─────────────────────────────────────────────────────────
    const { data: activationFeeNative } = useReadContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: AGENT_REGISTRY_ABI,
        functionName: "activationFeeNative",
    });

    const { data: agentData, refetch: refetchAgent } = useReadContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: AGENT_REGISTRY_ABI,
        functionName: "agents",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    const { data: epochStart } = useReadContract({
        address: YIELD_VAULT_ADDRESS,
        abi: YIELD_VAULT_ABI,
        functionName: "epochStart",
        query: { refetchInterval: 30000 },
    });

    const { data: epochDuration } = useReadContract({
        address: YIELD_VAULT_ADDRESS,
        abi: YIELD_VAULT_ABI,
        functionName: "EPOCH_DURATION",
    });

    const { data: epochFeesAccrued } = useReadContract({
        address: YIELD_VAULT_ADDRESS,
        abi: YIELD_VAULT_ABI,
        functionName: "epochFeesAccrued",
        query: { refetchInterval: 30000 },
    });

    const { data: totalVaultAssets } = useReadContract({
        address: YIELD_VAULT_ADDRESS,
        abi: YIELD_VAULT_ABI,
        functionName: "totalAssets",
        query: { refetchInterval: 30000 },
    });

    const { data: currentEpoch } = useReadContract({
        address: IL_INSURANCE_ADDRESS,
        abi: IL_INSURANCE_ABI,
        functionName: "getCurrentEpoch",
        query: { refetchInterval: 30000 },
    });

    const { data: positionData, refetch: refetchPosition } = useReadContract({
        address: IL_INSURANCE_ADDRESS,
        abi: IL_INSURANCE_ABI,
        functionName: "positions",
        args: address ? [address, TARGET_POOL_ID as `0x${string}`] : undefined,
        query: { enabled: !!address },
    });

    const { data: insurancePoolBalance } = useReadContract({
        address: IL_INSURANCE_ADDRESS,
        abi: IL_INSURANCE_ABI,
        functionName: "poolBalance",
        query: { refetchInterval: 30000 },
    });

    // ── Derived state ──────────────────────────────────────────────────────────
    // agents() returns (creator, operator, llmProvider, signalPrice, registeredAt, signalCount, active)
    const agentActive = useMemo(() => {
        if (activateTxHash) return true;
        if (!agentData || !Array.isArray(agentData)) return false;
        return Boolean(agentData[6]);
    }, [agentData, activateTxHash]);

    // positions() returns (entryAmount0, enrolledAt, insured)
    const positionInsured = useMemo(() => {
        if (premiumTxHash) return true;
        if (!positionData || !Array.isArray(positionData)) return false;
        return Boolean(positionData[2]);
    }, [positionData, premiumTxHash]);

    const { epochId, timeRemaining, smoothingBuffer } = useMemo(() => {
        const start = epochStart !== undefined ? Number(epochStart) : null;
        const dur = epochDuration !== undefined ? Number(epochDuration) : 604800;
        const now = Math.floor(Date.now() / 1000);
        const remaining = start !== null ? Math.max(0, start + dur - now) : null;
        const hrs = remaining !== null ? Math.floor(remaining / 3600) : null;
        const mins = remaining !== null ? Math.floor((remaining % 3600) / 60) : null;
        const timeStr = hrs !== null ? `${hrs}h ${mins}m` : "—";
        const buffer = epochFeesAccrued
            ? `${Number(formatUnits(epochFeesAccrued as bigint, 6)).toFixed(2)} USDC`
            : "—";
        const epoch = currentEpoch !== undefined ? String(Number(currentEpoch)) : "—";
        return { epochId: epoch, timeRemaining: timeStr, smoothingBuffer: buffer };
    }, [epochStart, epochDuration, epochFeesAccrued, currentEpoch]);

    const chartData = [...poolHistory].reverse().map((s, i) => ({
        label: `T${i}`,
        fee: s.currentDynamicFee,
        vol: Math.round(s.volatilityScore / 10),
    }));

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleActivate = async () => {
        if (!isConnected || !address) {
            toast.error("Please connect your wallet first");
            return;
        }
        setActivating(true);
        try {
            const fee = (activationFeeNative as bigint) ?? parseEther("0.00244");
            toast.loading("Confirm the registration transaction in your wallet…", { id: "activate" });
            const hash = await writeContractAsync({
                address: AGENT_REGISTRY_ADDRESS,
                abi: AGENT_REGISTRY_ABI,
                functionName: "registerAgent",
                args: [address, "claude", BigInt(0)],
                value: fee,
            });
            setActivateTxHash(hash);
            toast.success(
                <span>
                    Node registered!{" "}
                    <a
                        href={`${EXPLORER}${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline inline-flex items-center gap-1"
                    >
                        View tx <ExternalLink size={12} />
                    </a>
                </span>,
                { id: "activate", duration: 8000 }
            );
            refetchAgent();
        } catch (error: any) {
            toast.error(error.shortMessage || error.message || "Registration failed", { id: "activate" });
        } finally {
            setActivating(false);
        }
    };

    const handlePayPremium = async () => {
        if (!isConnected || !address) {
            toast.error("Please connect your wallet first");
            return;
        }
        setPayingPremium(true);
        try {
            const premium = parseUnits("10", 6);
            toast.loading("Step 1/2 — Approving 10 USDC…", { id: "premium" });
            await writeContractAsync({
                address: USDC_ADDRESS,
                abi: USDC_APPROVE_ABI,
                functionName: "approve",
                args: [IL_INSURANCE_ADDRESS, premium],
            });
            toast.loading("Step 2/2 — Paying insurance premium…", { id: "premium" });
            const hash = await writeContractAsync({
                address: IL_INSURANCE_ADDRESS,
                abi: IL_INSURANCE_ABI,
                functionName: "payPremium",
                args: [TARGET_POOL_ID as `0x${string}`],
            });
            setPremiumTxHash(hash);
            toast.success(
                <span>
                    Insurance active! 10 USDC premium paid.{" "}
                    <a
                        href={`${EXPLORER}${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline inline-flex items-center gap-1"
                    >
                        View tx <ExternalLink size={12} />
                    </a>
                </span>,
                { id: "premium", duration: 8000 }
            );
            refetchPosition();
        } catch (error: any) {
            toast.error(error.shortMessage || error.message || "Premium payment failed", { id: "premium" });
        } finally {
            setPayingPremium(false);
        }
    };

    const treasuryStats = useMemo(() => [
        {
            label: t.vault.signal_volume,
            value: latest ? `${latest.currentDynamicFee} bps` : "—",
            icon: BarChart3,
            color: "#FC72FF",
        },
        {
            label: t.vault.consensus,
            value: latest
                ? latest.volatilityScore > 7000 ? "HIGH"
                : latest.volatilityScore > 4000 ? "MED" : "LOW"
                : "—",
            icon: Zap,
            color: "#00F2FE",
        },
        {
            label: t.vault.activation_fee,
            value: activationFeeNative
                ? `${Number(formatUnits(activationFeeNative as bigint, 18)).toFixed(5)} ETH`
                : t.vault.fee_amount,
            icon: DollarSign,
            color: "#A78BFA",
        },
        {
            label: "Vault Assets",
            value: totalVaultAssets
                ? `${Number(formatUnits(totalVaultAssets as bigint, 6)).toFixed(2)} USDC`
                : "—",
            icon: Globe,
            color: "#00FFA3",
        },
    ], [t, latest, activationFeeNative, totalVaultAssets]);

    return (
        <div className="pt-24 px-6 max-w-7xl mx-auto pb-24">
            {/* ── HEADER ──────────────────────────────────────────────────────── */}
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
                        {t.vault.title.split(" ")[0]} <br className="sm:hidden" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-neural-magenta to-neural-cyan">
                            {t.vault.title.split(" ").slice(1).join(" ")}
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

            {/* ── BETA ONBOARDING ──────────────────────────────────────────── */}
            <div className="mb-8 rounded-2xl border border-neural-cyan/30 bg-neural-cyan/5 p-6">
                <div className="flex items-center gap-2 mb-5">
                    <span className="w-2 h-2 rounded-full bg-neural-cyan animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neural-cyan">
                        Beta Cerrada · Unichain Sepolia Testnet
                    </span>
                    {insurancePoolBalance !== undefined && (
                        <span className="ml-auto text-[10px] font-mono text-neural-green border border-neural-green/30 rounded-full px-3 py-0.5">
                            Pool: {Number(formatUnits(insurancePoolBalance as bigint, 6)).toFixed(2)} USDC
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a
                        href="https://faucet.unichain.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neural-cyan/40 hover:bg-neural-cyan/5 transition-all group"
                    >
                        <div className="w-7 h-7 rounded-full bg-neural-cyan/20 border border-neural-cyan/40 flex items-center justify-center shrink-0 text-xs font-black text-neural-cyan">1</div>
                        <div>
                            <div className="text-xs font-black text-white mb-1">Consigue ETH testnet</div>
                            <div className="text-[10px] text-gray-500 font-mono leading-relaxed">Ve al faucet de Unichain Sepolia y pide ETH gratis para operar en testnet.</div>
                            <div className="text-[10px] text-neural-cyan font-mono mt-2 group-hover:underline">faucet.unichain.org →</div>
                        </div>
                    </a>
                    <button
                        onClick={() => document.getElementById("swap-panel")?.scrollIntoView({ behavior: "smooth" })}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neural-magenta/40 hover:bg-neural-magenta/5 transition-all text-left"
                    >
                        <div className="w-7 h-7 rounded-full bg-neural-magenta/20 border border-neural-magenta/40 flex items-center justify-center shrink-0 text-xs font-black text-neural-magenta">2</div>
                        <div>
                            <div className="text-xs font-black text-white mb-1">Swapea ETH → USDC</div>
                            <div className="text-[10px] text-gray-500 font-mono leading-relaxed">Necesitas 10 USDC para activar el seguro. Usa el panel de abajo para cambiar tu ETH.</div>
                            <div className="text-[10px] text-neural-magenta font-mono mt-2">Ver panel de swap ↓</div>
                        </div>
                    </button>
                    <button
                        onClick={() => document.getElementById("insurance-panel")?.scrollIntoView({ behavior: "smooth" })}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neural-green/40 hover:bg-neural-green/5 transition-all text-left"
                    >
                        <div className="w-7 h-7 rounded-full bg-neural-green/20 border border-neural-green/40 flex items-center justify-center shrink-0 text-xs font-black text-neural-green">3</div>
                        <div>
                            <div className="text-xs font-black text-white mb-1">Activa tu seguro · 10 USDC</div>
                            <div className="text-[10px] text-gray-500 font-mono leading-relaxed">Paga la prima y tu posición queda asegurada. Si el mercado te pega, el protocolo te cubre hasta 500 USDC.</div>
                            <div className="text-[10px] text-neural-green font-mono mt-2">Activar seguro ↓</div>
                        </div>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Chart + stats */}
                    <div className="glass-card p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-neural-magenta/5 blur-[80px] -z-10" />
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-neural-cyan" />
                                Treasury Yield Smoothing
                            </h2>
                            <div className="flex items-center gap-4 font-mono text-[10px]">
                                <div className="flex items-center gap-2 text-neural-magenta">
                                    <span className="w-2 h-2 rounded-full bg-neural-magenta" /> FEE (bps)
                                </div>
                                <div className="flex items-center gap-2 text-neural-cyan">
                                    <span className="w-2 h-2 rounded-full bg-neural-cyan" /> VOLATILITY
                                </div>
                            </div>
                        </div>
                        <div className="h-64 mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gradFee" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#FC72FF" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#FC72FF" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradVol" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#00F2FE" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#00F2FE" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="label" hide />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.1)"
                                        tick={{ fontSize: 10, fill: "#666" }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#080808",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: 12,
                                            fontSize: 11,
                                        }}
                                        itemStyle={{ fontWeight: "bold" }}
                                    />
                                    <Area type="monotone" dataKey="fee" stroke="#FC72FF" fill="url(#gradFee)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="vol" stroke="#00F2FE" fill="url(#gradVol)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {treasuryStats.map(({ label, value, icon: Icon, color }) => (
                                <div key={label} className="bg-white/2 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                                        <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest truncate">
                                            {label}
                                        </div>
                                    </div>
                                    <div className="text-lg font-black text-white font-mono">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pool Intelligence + Epoch */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-5">
                            <PoolIntelligenceFeed maxItems={5} />
                        </div>
                        <div className="glass-card p-8 flex flex-col justify-center bg-neural-magenta/5 border-l-4 border-neural-magenta">
                            <h3 className="text-xl font-black text-white mb-4 italic tracking-tight uppercase">
                                Smoothing Mechanism
                            </h3>
                            <p className="text-xs text-gray-400 font-mono leading-relaxed mb-6">
                                HookMind uses epoch-based drip release. Fees collected by the Hook are buffered
                                in the Treasury and released linearly over 7 days, protecting long-term LPs from
                                yield volatility.
                            </p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
                                    <span className="text-gray-500">Current Epoch</span>
                                    <span className="text-white font-bold">#{epochId}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
                                    <span className="text-gray-500">Time to Next Release</span>
                                    <span className="text-neural-cyan font-bold">{timeRemaining}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                    <span className="text-gray-500">Fees This Epoch</span>
                                    <span className="text-neural-green font-bold">{smoothingBuffer}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <InstitutionalCompliance />
                </div>

                {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
                <div className="lg:col-span-4 space-y-6">

                    <NodeStatus active={agentActive} t={t} />

                    {/* Agent Registration */}
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
                                <span className="text-gray-500 font-mono uppercase tracking-tighter">
                                    {t.vault.activation_fee}
                                </span>
                                <span className="font-black text-white font-mono">
                                    {activationFeeNative
                                        ? `${Number(formatUnits(activationFeeNative as bigint, 18)).toFixed(5)} ETH`
                                        : t.vault.fee_amount}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                <span className="text-gray-500 font-mono uppercase tracking-tighter">SaaS License</span>
                                <span className="font-black text-neural-green font-mono">LIFETIME</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-mono uppercase tracking-tighter">Treasury Weight</span>
                                <span className="font-black text-neural-cyan font-mono">1.25x (Early Bird)</span>
                            </div>
                            {activateTxHash && (
                                <a
                                    href={`${EXPLORER}${activateTxHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[10px] font-mono text-neural-green/70 hover:text-neural-green transition-colors pt-1"
                                >
                                    <ExternalLink size={10} /> View registration tx
                                </a>
                            )}
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleActivate}
                            disabled={activating || agentActive}
                            className="w-full py-5 rounded-2xl font-black italic uppercase tracking-[0.2em] text-sm mt-auto shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all"
                            style={
                                agentActive
                                    ? { background: "rgba(0,255,163,0.1)", border: "2px solid rgba(0,255,163,0.3)", color: "#00FFA3" }
                                    : { background: "linear-gradient(135deg, #FC72FF, #00F2FE)", color: "#000" }
                            }
                        >
                            {agentActive ? (
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} /> REGISTERED
                                </span>
                            ) : activating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                                    PROCESSING
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Zap size={16} /> {t.vault.activate_btn}
                                </span>
                            )}
                        </motion.button>
                    </div>

                    {/* IL Insurance */}
                    <div id="insurance-panel" className="glass-card p-8 border-t-2 border-neural-green">
                        <h2 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-neural-green" />
                            IL Insurance
                        </h2>
                        <p className="text-[10px] text-gray-500 font-mono mb-6 uppercase tracking-widest">
                            Pay 10 USDC premium · Auto-enrolled on liquidity add
                        </p>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-[10px] font-mono border-b border-white/5 pb-2">
                                <span className="text-gray-500">Premium</span>
                                <span className="text-white font-bold">10 USDC</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono border-b border-white/5 pb-2">
                                <span className="text-gray-500">Max Payout</span>
                                <span className="text-neural-green font-bold">500 USDC</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono border-b border-white/5 pb-2">
                                <span className="text-gray-500">IL Threshold</span>
                                <span className="text-neural-cyan font-bold">2%</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-gray-500">Status</span>
                                <span className={`font-bold ${positionInsured ? "text-neural-green" : "text-gray-500"}`}>
                                    {positionInsured ? "INSURED" : "NOT ENROLLED"}
                                </span>
                            </div>
                            {premiumTxHash && (
                                <a
                                    href={`${EXPLORER}${premiumTxHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[10px] font-mono text-neural-green/70 hover:text-neural-green transition-colors"
                                >
                                    <ExternalLink size={10} /> View premium tx
                                </a>
                            )}
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePayPremium}
                            disabled={payingPremium || positionInsured}
                            className="w-full py-4 rounded-2xl font-black italic uppercase tracking-[0.15em] text-sm shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all"
                            style={
                                positionInsured
                                    ? { background: "rgba(0,255,163,0.1)", border: "2px solid rgba(0,255,163,0.3)", color: "#00FFA3" }
                                    : { background: "linear-gradient(135deg, #00FFA3, #00F2FE)", color: "#000" }
                            }
                        >
                            {positionInsured ? (
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} /> INSURED
                                </span>
                            ) : payingPremium ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                                    PROCESSING
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Shield size={16} /> ACTIVATE INSURANCE
                                </span>
                            )}
                        </motion.button>
                    </div>

                    {/* Swap for USDC */}
                    <div id="swap-panel" className="glass-card p-8 border-b-4 border-neural-magenta">
                        <h2 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-neural-magenta" />
                            Premium Acquisition
                        </h2>
                        <p className="text-[10px] text-gray-500 font-mono mb-6 uppercase tracking-widest">
                            Swap ETH for USDC to fund insurance premiums
                        </p>
                        <SwapQuotePanel
                            tokenIn={{ address: WETH_ADDRESS, symbol: "WETH", decimals: 18 }}
                            tokenOut={{ address: USDC_ADDRESS, symbol: "USDC", decimals: 6 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
