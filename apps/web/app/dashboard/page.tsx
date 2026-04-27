"use client";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { Zap, Activity, Shield, Cpu, Plus, Lock, X, Trophy, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useHookMind, usePoolIntelligence, useDynamicFee } from "@/hooks/useHookMind";
import PoolIntelligenceFeed from "@/components/ui/PoolIntelligenceFeed";
import AgentSignalFeed from "@/components/ui/AgentSignalFeed";
import { parseUnits, formatEther } from "viem";
import { AGENT_REGISTRY_ADDRESS, AGENT_REGISTRY_ABI } from "@/lib/constants";
import { useWriteContract, useReadContract } from "wagmi";
import { LEADERBOARD_DATA } from "@/app/leaderboard/data";
// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AgentFleet {
    id: string;
    poolPair: string;
    poolId: string;
    strategy: string;
    status: "RUNNING" | "PAUSED" | "ALERT" | "DRAFT";
    currentFee: number;
    volScore: number;
    uptime: string;
    agentEOA: string;
    lastSignalCid: string;
    createdAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Simplified Modals for Dashboard
// ─────────────────────────────────────────────────────────────────────────────

function DeployPaymentModal({ isOpen, onClose, onDeploy }: { isOpen: boolean; onClose: () => void; onDeploy: () => void }) {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [isPending, setIsPending] = useState(false);

    // Fetch dynamic native ETH activation fee from AgentRegistry
    const { data: activationFeeNative } = useReadContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: AGENT_REGISTRY_ABI,
        functionName: "activationFeeNative",
    });

    if (!isOpen) return null;

    const feeEth = activationFeeNative ? formatEther(activationFeeNative as bigint) : "0.0015";

    const handleConfirm = async () => {
        if (!activationFeeNative) return;
        setIsPending(true);
        toast.loading("Deploying Agent on Unichain...", { id: "deploy-tx" });
        try {
            const tx = await writeContractAsync({
                address: AGENT_REGISTRY_ADDRESS,
                abi: AGENT_REGISTRY_ABI,
                functionName: 'registerAgent',
                // For demo purposes, we create a burner / mock agent address
                // (In a real scenario, this is derived from the operator agent setup)
                args: [`0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`, "openai", parseUnits("100", 6)], 
                value: activationFeeNative as bigint,
            });
            
            toast.custom((t) => (
                <div className="bg-[#0f0f0f] border border-neural-magenta/40 rounded-xl p-4 w-full min-w-[300px] shadow-[0_0_25px_rgba(252,114,255,0.25)] flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1/2 h-px bg-linear-to-r from-transparent via-neural-magenta to-transparent opacity-50" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap size={16} className="text-neural-magenta animate-pulse" />
                            <span className="font-black text-white tracking-tight">Agent Deployed</span>
                        </div>
                        <button onClick={() => toast.dismiss(t)} className="text-gray-500 hover:text-white transition-colors"><X size={14}/></button>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                        Institutional node registration fee processed via Unichain.
                    </p>
                    <a 
                        href={`https://unichain-sepolia.blockscout.com/tx/${tx}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 text-[11px] font-mono font-bold text-neural-magenta border border-neural-magenta/30 hover:bg-neural-magenta/10 hover:text-white px-3 py-2 rounded-lg flex items-center justify-between transition-all group"
                    >
                        <span>View on Blockscout</span>
                        <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            ), { id: "deploy-tx", duration: 15000 });
            onDeploy();
            onClose();
        } catch (e: any) {
            toast.error(e.message || "Transaction failed", { id: "deploy-tx" });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18} /></button>
                <h2 className="text-xl font-black mb-2 text-white">Deploy Hook Agent</h2>
                <p className="text-sm text-gray-400 mb-6 font-mono">Pay the protocol fee in native ETH to activate a new autonomous node on Unichain.</p>

                <div className="bg-black/50 border border-white/5 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-xs font-mono uppercase">Agent Target</span>
                        <span className="text-white font-bold font-mono">WETH/USDC (0x...)</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs font-mono uppercase">Deployment Fee</span>
                        <div className="text-right">
                         <span className="text-neural-green font-bold font-mono block">{Number(feeEth).toFixed(4)} ETH</span>
                         <span className="text-gray-500 text-[10px] font-mono">(~$5.00 USD)</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={isPending || !activationFeeNative}
                    className="w-full py-3 bg-neural-magenta hover:bg-neural-magenta/90 disabled:opacity-50 text-black font-bold rounded-xl flex justify-center items-center gap-2"
                >
                    {isPending ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Zap size={18} />}
                    {isPending ? "Processing..." : "Pay Registration Fee & Deploy Agent"}
                </button>
            </motion.div>
        </div>
    );
}

function AgentDetailsModal({ agent, onClose, onStop }: { agent: AgentFleet | null; onClose: () => void; onStop: () => void }) {
    if (!agent) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-lg p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18} /></button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-neural-magenta/10 border border-neural-magenta/30 flex items-center justify-center text-neural-magenta">
                        <Cpu size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white leading-tight">{agent.poolPair} Agent</h2>
                        <div className="text-xs text-neural-cyan font-mono">{agent.strategy}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-xs text-gray-500 font-mono uppercase mb-1">Current Fee</div>
                        <div className="text-xl font-bold font-mono text-neural-cyan">{agent.currentFee} bps</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-xs text-gray-500 font-mono uppercase mb-1">Vol Score</div>
                        <div className="text-xl font-bold font-mono text-neural-magenta">{agent.volScore}</div>
                    </div>
                </div>

                <div className="space-y-2 mb-6 text-xs font-mono text-gray-400">
                    <div className="flex justify-between p-2 bg-white/5 rounded-lg"><span>Status</span><span className="text-neural-green font-bold">{agent.status}</span></div>
                    <div className="flex justify-between p-2 bg-white/5 rounded-lg"><span>Uptime</span><span className="text-white">{agent.uptime}</span></div>
                    <div className="flex justify-between p-2 bg-white/5 rounded-lg"><span>EOA Wallet</span><span className="text-white">{agent.agentEOA.slice(0, 6)}...{agent.agentEOA.slice(-4)}</span></div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => { onStop(); onClose(); }} className="flex-1 py-2 rounded-xl text-xs font-bold font-mono bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20">
                        Terminate Agent
                    </button>
                    <button onClick={() => { window.location.href = `/docs?tab=overview` }} className="flex-1 py-2 rounded-xl text-xs font-bold font-mono bg-white/10 text-white hover:bg-white/20 border border-white/20">
                        View Audit Logs
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Content
// ─────────────────────────────────────────────────────────────────────────────

function DashboardContent() {
    const { address, isConnected } = useAccount();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [activeAgents, setActiveAgents] = useState<AgentFleet[]>([]);
    const [isLoadingFleet, setIsLoadingFleet] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<AgentFleet | null>(null);

    const [liveStats, setLiveStats] = useState({
        currentFee: 7200,
        volatilityScore: 8100,
        ilProtection: true,
        agentsRunning: 0,
        agentsTotal: 0,
    });


    // Fetch live on-chain Neural State from HookMindCore
    // Newly initialized WETH/USDC pool on Unichain Sepolia
    const TARGET_POOL_ID = "0x708bf64c64d28d2805d4e6e79690dcd2d84c1204e4a7f2dd8d424c38eb7851cb" as `0x${string}`;
    const { data: poolIntelligenceData } = usePoolIntelligence(TARGET_POOL_ID);
    const { data: feeData } = useDynamicFee(TARGET_POOL_ID);

    const intel = poolIntelligenceData as readonly [bigint, bigint, bigint, boolean, string] | undefined;

    useEffect(() => {
        if (intel) {
            setLiveStats(prev => ({
                ...prev,
                volatilityScore: Number(intel[0]) || prev.volatilityScore,
                ilProtection: intel[3] !== undefined ? intel[3] : prev.ilProtection
            }));
        }
    }, [intel]);

    useEffect(() => {
        if (feeData) {
            setLiveStats(prev => ({
                ...prev,
                currentFee: Number(feeData) || prev.currentFee
            }));
        }
    }, [feeData]);

    // 2. Load Fleet from localStorage
    useEffect(() => {
        if (!address || !isConnected) {
            setActiveAgents([]);
            setIsInitialized(false);
            setIsLoadingFleet(false);
            return;
        }
        const loadFleet = () => {
            setIsLoadingFleet(true);
            try {
                const localKey = `hm-fleet-${address}`;
                const local = JSON.parse(localStorage.getItem(localKey) || "[]");
                setActiveAgents(local.filter((a: AgentFleet) => a.status !== "DRAFT"));
            } catch { } finally {
                setIsLoadingFleet(false);
                setIsInitialized(true);
            }
        };
        loadFleet();
    }, [address, isConnected]);

    // 3. Persist Fleet
    useEffect(() => {
        if (!isInitialized || !address) return;
        localStorage.setItem(`hm-fleet-${address}`, JSON.stringify(activeAgents));
        setLiveStats(prev => ({
            ...prev,
            agentsTotal: activeAgents.length,
            agentsRunning: activeAgents.filter(a => a.status === 'RUNNING').length
        }));
    }, [activeAgents, isInitialized, address]);

    // 4. Modal 3: AutoStart
    useEffect(() => {
        if (searchParams.get("autostart") === "true" && isConnected) {
            router.replace("/");
            setShowPaymentModal(true);
        }
    }, [searchParams, isConnected, router]);

    const handleDeployAgent = () => {
        const pairs = ["WETH/USDC", "cbBTC/USDC", "UNI/ETH", "USDC/USDT"];
        const strategies = ["Volatility Shield", "Peg Keeper", "MEV Defender"];
        const newAgent: AgentFleet = {
            id: `agent-${Date.now()}`,
            poolPair: pairs[Math.floor(Math.random() * pairs.length)],
            poolId: "0x...",
            strategy: strategies[Math.floor(Math.random() * strategies.length)],
            status: "RUNNING",
            currentFee: 5000,
            volScore: 5000,
            uptime: "0m",
            agentEOA: address!,
            lastSignalCid: "Qm...",
            createdAt: Date.now(),
        };
        setActiveAgents(prev => [newAgent, ...prev]);
    };

    const handleStopAgent = (id: string) => {
        setActiveAgents(prev => prev.filter(a => a.id !== id));
        toast.success("Agent terminated. Private keys scrubbed.");
    };

    return (
        <div className="pt-24 px-5 max-w-[1400px] mx-auto pb-24">
            <DeployPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onDeploy={handleDeployAgent} />
            <AgentDetailsModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} onStop={() => { if (selectedAgent) handleStopAgent(selectedAgent.id) }} />

            {/* HERO DEL DASHBOARD */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-neural-magenta animate-pulse" />
                    <span className="text-xs font-mono text-neural-magenta uppercase tracking-widest">
                        AGENT MESH ONLINE — UNICHAIN
                    </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter">Dashboard</h1>
                <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                    Autonomous AI agents controlling Uniswap v4 Hooks on Unichain.
                    Every signal ECDSA-signed, every decision IPFS-audited.
                </p>
            </div>

            {/* LIVE STATS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-white">
                {[
                    { label: "CURRENT FEE", value: `${liveStats.currentFee.toLocaleString()} bps`, sub: "Dynamic AI", color: "text-neural-magenta", icon: Zap },
                    { label: "VOLATILITY", value: `${liveStats.volatilityScore}/10k`, sub: "Live Score", color: "text-neural-cyan", icon: Activity },
                    { label: "IL PROTECTION", value: liveStats.ilProtection ? "ACTIVE" : "STANDBY", sub: "All Pools", color: liveStats.ilProtection ? "text-neural-green" : "text-gray-500", icon: Shield },
                    { label: "AGENTS RUNNING", value: `${liveStats.agentsRunning} / ${liveStats.agentsTotal}`, sub: "Fleet Status", color: "text-purple-400", icon: Cpu },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <stat.icon size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                {stat.label}
                            </span>
                        </div>
                        <div className={`text-3xl font-black ${stat.color} mb-1 tracking-tight`}>{stat.value}</div>
                        <div className="text-xs text-gray-500 font-mono">{stat.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* MAIN GRID */}
            <div className="grid lg:grid-cols-[2fr_3fr] gap-6 mb-8 items-start">

                {/* LEFT: ACTIVE FLEET */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-neural-green animate-pulse" style={{ boxShadow: "0 0 6px var(--color-neural-green)" }} />
                            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                                Active Fleet
                            </span>
                        </div>
                        <button
                            onClick={() => !isConnected ? toast.error("Connect wallet first") : setShowPaymentModal(true)}
                            className="text-xs px-3 py-1.5 border border-neural-magenta/30 text-neural-magenta rounded-lg hover:bg-neural-magenta/10 transition-all flex items-center gap-1 font-mono font-bold"
                        >
                            <Plus size={12} /> Deploy Agent
                        </button>
                    </div>

                    <div className="space-y-3">
                        {!isConnected ? (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Lock size={20} className="text-gray-500" />
                                </div>
                                <p className="text-gray-400 text-sm mb-6 font-mono">Connect your wallet to view and manage your agent fleet</p>
                                <ConnectButton />
                            </div>
                        ) : isLoadingFleet ? (
                            [1, 2].map(i => <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse h-28" />)
                        ) : activeAgents.length === 0 ? (
                            <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 text-center hover:bg-white/[0.07] transition-colors cursor-pointer" onClick={() => setShowPaymentModal(true)}>
                                <Cpu size={32} className="text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm font-mono text-center">No agents deployed yet.</p>
                                <p className="text-gray-500 text-xs mt-2 font-mono">Deploy your first hook agent →</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {activeAgents.map((agent, i) => (
                                    <motion.div
                                        key={agent.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setSelectedAgent(agent)}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-neural-magenta/50 hover:bg-white/8 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="font-bold text-white group-hover:text-neural-magenta transition-colors text-lg font-mono tracking-tight">{agent.poolPair}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{agent.strategy}</div>
                                            </div>
                                            <div className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase ${agent.status === "RUNNING" ? "bg-neural-green/10 text-neural-green border border-neural-green/20" : "bg-neural-red/10 text-neural-red border border-neural-red/20"}`}>
                                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${agent.status === "RUNNING" ? "bg-neural-green animate-pulse shadow-[0_0_5px_var(--color-neural-green)]" : "bg-neural-red"}`} />
                                                {agent.status}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-black/40 rounded-lg p-2">
                                                <div className="text-[9px] text-gray-500 uppercase font-mono mb-1">FEE</div>
                                                <div className="text-xs font-bold font-mono text-neural-cyan">{agent.currentFee} bps</div>
                                            </div>
                                            <div className="bg-black/40 rounded-lg p-2">
                                                <div className="text-[9px] text-gray-500 uppercase font-mono mb-1">VOL</div>
                                                <div className="text-xs font-bold font-mono text-neural-magenta">{agent.volScore}</div>
                                            </div>
                                            <div className="bg-black/40 rounded-lg p-2">
                                                <div className="text-[9px] text-gray-500 uppercase font-mono mb-1">UP</div>
                                                <div className="text-xs font-bold font-mono text-gray-400">{agent.uptime}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* RIGHT: LIVE FEED — real on-chain events + state */}
                <div className="sticky top-24 space-y-4">
                    <div className="bg-void border border-white/10 rounded-2xl p-5 lg:shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <PoolIntelligenceFeed maxItems={3} />
                    </div>
                    <div className="bg-void border border-white/10 rounded-2xl p-5">
                        <AgentSignalFeed maxItems={5} />
                    </div>
                </div>

            </div>

            <section className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-amber-400" />
                        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
                            Top Operators — This Week
                        </span>
                    </div>
                    <Link href="/leaderboard" className="text-xs text-neural-magenta hover:underline flex items-center gap-1">
                        View Full Leaderboard <ChevronRight size={12} />
                    </Link>
                </div>

                <div className="space-y-2">
                    {LEADERBOARD_DATA.slice(0, 5).map((entry, i) => (
                        <div key={entry.address} className="flex items-center gap-4 bg-white/3 border border-white/5 rounded-xl px-4 py-3 hover:bg-white/5 transition-all">
                            <div className="w-6 text-center shrink-0">
                                {i < 3 ? <span>{['🥇', '🥈', '🥉'][i]}</span> : <span className="text-xs text-white/30 font-mono">#{i + 1}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-mono text-sm text-white truncate">
                                    {entry.ens || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                                </div>
                                <div className="text-[10px] text-white/30">{entry.badge} • {entry.model}</div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-sm font-bold font-mono text-neural-magenta">
                                    {entry.signalsSent.toLocaleString()}
                                </div>
                                <div className="text-[9px] text-white/20">signals</div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className={`text-sm font-bold ${entry.accuracy >= 98 ? 'text-neural-green' : 'text-neural-cyan'}`}>
                                    {entry.accuracy}%
                                </div>
                                <div className="text-[9px] text-white/20">accuracy</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* DEPLOY HOOK AGENT BUTTON (Floating) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => !isConnected ? toast.error("Connect your wallet to Unichain") : setShowPaymentModal(true)}
                className="fixed bottom-8 right-8 px-6 py-4 bg-neural-magenta hover:bg-neural-magenta/90 text-black font-black rounded-2xl shadow-[0_0_20px_rgba(252,114,255,0.4)] flex items-center gap-2 z-40 group tracking-tight"
            >
                <Zap size={20} className="group-hover:animate-pulse" /> Deploy Hook Agent
            </motion.button>
        </div>
    );
}

// Wrap in Suspense to safely useSearchParams
export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-white/50 font-mono text-sm">Dashboard uplink initializing...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
