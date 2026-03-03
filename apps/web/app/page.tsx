"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
    Zap, Shield, TrendingUp, Cpu, Workflow, Terminal, Package,
    ArrowRight, CheckCircle2, Play, Globe, Code2, Layers,
    ChevronRight, Activity, Brain, Rocket
} from "lucide-react";
import { useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, translateY: -5 }}
            className="glass-card p-6 border-l-4"
            style={{ borderLeftColor: color }}
        >
            <div className={`w-12 h-12 rounded-xl bg-void border border-white/10 flex items-center justify-center mb-6 text-[${color}]`}>
                <Icon size={24} style={{ color }} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-mono">{desc}</p>
        </motion.div>
    );
}

function StepItem({ title, desc, tag, last = false }: { title: string, desc: string, tag: string, last?: boolean }) {
    return (
        <div className="flex gap-8 relative">
            {!last && <div className="absolute left-6 top-14 bottom-0 w-px bg-white/10" />}
            <div className="w-12 h-12 rounded-full bg-void border-2 border-neural-cyan flex items-center justify-center font-bold text-neural-cyan shrink-0 z-10 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                {tag}
            </div>
            <div className="pb-12">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm font-mono max-w-xl leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sections
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
    const scrollRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: scrollRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

    return (
        <div ref={scrollRef} className="relative overflow-hidden pt-16">

            {/* 1. HERO SECTION */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neural-magenta/10 blur-[120px] rounded-full -z-10" />
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neural-cyan/10 blur-[120px] rounded-full -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl"
                >
                    <div className="inline-flex items-center gap-2 neon-badge mb-6 py-1.5 px-3">
                        <span className="w-2 h-2 rounded-full bg-neural-cyan animate-pulse shadow-[0_0_8px_#00F2FE]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neural-cyan">The First AI Agent Mesh on Unichain</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                        HookMind: <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-neural-magenta to-neural-cyan">
                            The Neural Yield Layer
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 font-mono mb-10 max-w-2xl mx-auto leading-relaxed">
                        Stop losing to impermanent loss and static yields. Deploy autonomous AI agents that control Uniswap v4 Hooks in real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard" className="px-8 py-4 bg-neural-magenta text-black font-black rounded-2xl hover:scale-105 transition-all flex items-center gap-2 group shadow-[0_0_30px_rgba(252,114,255,0.4)]">
                            Launch Protocol <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/docs" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2">
                            Read Docs <Terminal size={20} />
                        </Link>
                    </div>
                </motion.div>


            </section>

            {/* 2. THE PROBLEMS SECTION */}
            <section className="py-32 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-12 md:mb-20">
                    <h2 className="text-3xl md:text-5xl font-black mb-4">LP Management is Broken</h2>
                    <p className="text-gray-500 font-mono text-sm md:text-base px-4">Traditional Uniswap v4 pools face three critical inefficiencies.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {[
                        { tag: "01", title: "Static Fees", desc: "Fees don't react to market volatility, leaving money on the table or scaring away swappers.", icon: Zap, color: "#FC72FF" },
                        { tag: "02", title: "Impermanent Loss", desc: "No native protection against toxic order flow or massive price shifts at the hook layer.", icon: Shield, color: "#00F2FE" },
                        { tag: "03", title: "Chaotic Yield", desc: "Fee distributions spike and crash, making liquidity provisioning a guessing game.", icon: TrendingUp, color: "var(--color-neural-green)" },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl relative overflow-hidden group">
                            <div className="text-5xl md:text-6xl font-black text-white/5 absolute -top-4 -right-2 transition-all group-hover:text-white/10 group-hover:scale-110">{item.tag}</div>
                            <item.icon className="w-8 h-8 md:w-10 md:h-10 mb-6" style={{ color: item.color }} />
                            <h3 className="text-xl md:text-2xl font-bold mb-4">{item.title}</h3>
                            <p className="text-gray-400 font-mono text-xs md:text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. FEATURES (Neural Ecosystem) */}
            <section className="py-32 relative bg-void/50">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 neon-badge mb-6 py-1.5 px-3">
                            <Rocket size={12} className="text-neural-magenta" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neural-magenta">Core Features</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-8 leading-tight">Autonomous Yield <br /> <span className="text-neural-cyan">Optimization</span></h2>

                        <div className="space-y-6">
                            {[
                                { title: "Dynamic AI Fees", desc: "Agents monitor Unichain blocks every 12s, adjusting pool fees (500–10000 bps) based on real-time neural scores.", icon: Activity },
                                { title: "Immutable Audit Mesh", desc: "Every AI decision is pinned to IPFS before execution. Fully auditable reasoning trail stored via Pinata CID.", icon: Layers },
                                { title: "Native IL Insurance", desc: "When IL exposure spikes, agents auto-trigger insurance premium top-ups using Circle CCTP cross-chain feeds.", icon: Shield },
                                { title: "ERC-4626 YieldVaults", desc: "Smoothed distributions over 7-day epochs. No more yield spikes, just consistent neural growth.", icon: Package },
                            ].map((f, i) => (
                                <motion.div key={i} whileHover={{ x: 10 }} className="flex gap-4 group cursor-default">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-neural-cyan/50 transition-colors">
                                        <f.icon size={18} className="text-gray-500 group-hover:text-neural-cyan" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-neural-cyan transition-colors">{f.title}</h4>
                                        <p className="text-sm text-gray-500 font-mono">{f.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="hidden lg:block relative">
                        <div className="aspect-square bg-white/2 border border-white/10 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-[0_0_100px_rgba(252,114,255,0.1)]">
                            {/* Visual Representation of Agent Cluster */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(252,114,255,0.1)_0%,transparent_70%)]" />
                            <div className="relative z-10 grid grid-cols-2 gap-4 scale-90">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-40 h-48 bg-void border border-white/10 rounded-2xl p-4 flex flex-col justify-between animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
                                        <div className="flex justify-between items-start">
                                            <Cpu size={16} className="text-neural-magenta" />
                                            <div className="w-2 h-2 rounded-full bg-neural-green" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-1.5 w-full bg-white/10 rounded" />
                                            <div className="h-1.5 w-2/3 bg-white/10 rounded" />
                                        </div>
                                        <div className="text-[10px] font-mono text-neural-cyan">BLOCK {1420270 + i}</div>
                                    </div>
                                ))}
                            </div>
                            {/* Connecting lines SVG */}
                            <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
                                <path d="M 200 200 L 400 400" stroke="var(--color-neural-magenta)" strokeWidth="1" strokeDasharray="4 4" />
                                <path d="M 400 200 L 200 400" stroke="var(--color-neural-cyan)" strokeWidth="1" strokeDasharray="4 4" />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. HOW IT WORKS */}
            <section className="py-32 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-20">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black mb-8">From Neural Signal <br /> to On-Chain Action</h2>
                        <div className="space-y-2">
                            <StepItem tag="01" title="Real-Time Data Extraction" desc="HookMind agents monitor the Unichain mempool and block logs every 12 seconds to calculate pool volatility." />
                            <StepItem tag="02" title="Multi-Provider AI Reasoning" desc="Agents route data to a cluster of LLMs (Claude, GPT, Grok) to determine the optimal fee and IL protection state." />
                            <StepItem tag="03" title="Immutable IPFS Audit" desc="Before any transaction, the reasoning is serialized into a JSON audit log and pinned to IPFS via Pinata." />
                            <StepItem tag="04" title="ECDSA Block-Level Execution" desc="Agent signs the signal with its EOA private key. HookMindCore.sol validates the signature and updates the Uniswap v4 Hook." last />
                        </div>
                    </div>
                    <div className="glass-card p-10 bg-neural-magenta/5 border border-neural-magenta/20 flex flex-col justify-center">
                        <Brain className="w-16 h-16 text-neural-magenta mb-8" />
                        <h3 className="text-3xl font-black mb-4 italic">"The end of static liquidity."</h3>
                        <p className="text-gray-400 font-mono leading-relaxed mb-8">
                            By decentralizing the decision-making process at the hook layer, HookMind transforms passive liquidity into an active, intelligent asset class. High volatility? Increase fees. Price drift? Activate IL protection. All automatically.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40" />
                            <div>
                                <div className="font-bold text-white">HookMind Protocol</div>
                                <div className="text-xs text-neural-cyan font-mono hover:underline cursor-pointer">View Verified Signals →</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. TECH STACK & TOOLS */}
            <section className="py-32 bg-white/1">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl md:text-5xl font-black text-center mb-20 tracking-tighter">Powered by the Future <br /> of DeFi Infrastructure</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {[
                            { name: "Unichain", role: "Deployment Layer", icon: Globe },
                            { name: "Uniswap v4", role: "Hook Architecture", icon: Workflow },
                            { name: "Circle", role: "CCTP Liquidity", icon: Globe },
                            { name: "EigenLayer", role: "AVS Consensus", icon: Layers },
                            { name: "Pinata", role: "IPFS Persistence", icon: Package },
                        ].map((tech, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="bg-void border border-white/5 p-6 rounded-2xl text-center group"
                            >
                                <tech.icon className="w-8 h-8 mx-auto mb-4 text-gray-500 group-hover:text-white transition-colors" />
                                <div className="font-bold text-sm mb-1">{tech.name}</div>
                                <div className="text-[10px] text-gray-600 font-mono uppercase">{tech.role}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="glass-card p-8 border-t-neural-magenta">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Terminal size={20} className="text-neural-magenta" />
                                Developer SDK
                            </h3>
                            <p className="text-sm text-gray-500 font-mono mb-6">Build your own agent strategies. Direct access to neural scoring API and hook event streams.</p>
                            <code className="text-[10px] p-2 bg-black/40 border border-white/10 rounded block font-mono text-emerald-400">pnpm install @hookmind/sdk</code>
                        </div>
                        <div className="glass-card p-8 border-t-neural-cyan">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Code2 size={20} className="text-neural-cyan" />
                                MCP Tools
                            </h3>
                            <p className="text-sm text-gray-500 font-mono mb-6">Integrate HookMind with LLMs like Claude or Cursor. Chat with your pool nodes directly.</p>
                            <Link href="/docs?tab=mcp" className="text-xs font-bold text-neural-cyan flex items-center gap-1 group">Documentation <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></Link>
                        </div>
                        <div className="glass-card p-8 border-t-neural-magenta">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Activity size={20} className="text-neural-magenta" />
                                Neural UI
                            </h3>
                            <p className="text-sm text-gray-500 font-mono mb-6">GPGPU-powered dashboard monitoring 50,000+ real-time particles of pool data flow.</p>
                            <Link href="/dashboard" className="text-xs font-bold text-neural-magenta flex items-center gap-1 group">Enter Dashboard <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. CALL TO ACTION */}
            <section className="py-40 relative px-6">
                <div className="max-w-4xl mx-auto rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden bg-linear-to-br from-neural-magenta/20 to-neural-cyan/20 border border-white/20">
                    <div className="absolute inset-0 bg-void -z-10" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 -z-10" />

                    <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter underline decoration-neural-magenta/30 underline-offset-8">
                        Join the Yield Revolution
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl font-mono mb-12 max-w-2xl mx-auto leading-relaxed">
                        Don't just provide liquidity. Provide intelligence. Launch your first HookMind agent on Unichain Sepolia today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/dashboard?autostart=true" className="px-12 py-5 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            Deploy AI Agent
                        </Link>
                        <Link href="/leaderboard" className="px-12 py-5 bg-void border border-white/20 text-white font-black rounded-2xl hover:bg-white/5 transition-all text-lg">
                            View Rankings
                        </Link>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-8 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                        <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-neural-green" /> Unichain Ready</div>
                        <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-neural-green" /> Uniswap v4 Hook</div>
                        <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-neural-green" /> Open Source</div>
                    </div>
                </div>
            </section>

        </div>
    );
}
