"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import {
    LayoutGrid, Cpu, GitBranch, Layers, TrendingUp, Puzzle, Brain,
    Lock, Book, Settings, Zap, Trophy, Home, Menu, X, ChevronRight
} from "lucide-react";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import NodeSettingsModal from "@/components/ui/NodeSettingsModal";

const NAV_LINKS = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/agents", label: "Agents", icon: Cpu },
    { href: "/leaderboard", label: "Rankings", icon: Trophy },
    { href: "/builder", label: "Builder", icon: GitBranch },
    { href: "/pools", label: "Pools", icon: Layers },
    { href: "/strategies", label: "Strats", icon: TrendingUp },
    { href: "/plugins", label: "Plugins", icon: Puzzle },
    { href: "/skills", label: "Skills", icon: Brain },
    { href: "/vault", label: "Vault", icon: Lock },
    { href: "/docs", label: "Docs", icon: Book },
];

export function Navbar() {
    const path = usePathname();
    const [ws, setWs] = useState(0);
    const [block, setBlock] = useState(1419243);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        const t = setInterval(() => {
            setWs(Math.floor(Math.random() * 20 + 14));
            setBlock((b) => b + Math.floor(Math.random() * 2));
        }, 3000);
        return () => clearInterval(t);
    }, []);

    return (
        <>
            <NodeSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

            {/* Mobile Menu Overlay */}
            <div className={clsx(
                "fixed inset-0 z-100 bg-void/95 backdrop-blur-xl lg:hidden transition-all duration-500",
                isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                        <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                            <Brain className="w-5 h-5 text-neural-magenta" />
                            <span className="font-black text-lg tracking-tighter italic whitespace-nowrap">HOOKMIND</span>
                        </Link>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <X size={20} className="text-white/60" />
                        </button>
                    </div>

                    {/* Links */}
                    <div className="flex-1 overflow-y-auto py-8 px-6 space-y-2">
                        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                            const active = path === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={clsx(
                                        "flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                                        active ? "bg-neural-cyan/10 border border-neural-cyan/30 text-neural-cyan shadow-[0_0_20px_rgba(0,242,254,0.1)]" : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <Icon size={20} className={active ? "text-neural-cyan" : "text-gray-500"} />
                                        <span className="font-bold text-sm tracking-widest uppercase">{label}</span>
                                    </div>
                                    <ChevronRight size={16} className={active ? "text-neural-cyan" : "text-gray-700"} />
                                </Link>
                            );
                        })}
                    </div>

                    {/* Footer Status */}
                    <div className="p-6 border-t border-white/5 bg-void">
                        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-neural-green animate-pulse" />
                                    <span className="text-[10px] font-black tracking-widest text-neural-green">MESH ONLINE</span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono">LATENCY: {ws}ms</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Unichain block</span>
                                <span className="text-sm font-black text-white">{block.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-void/88 border-b border-neural-magenta/12 backdrop-blur-[28px] saturate-200">
                <div className="max-w-screen-2xl mx-auto h-full flex items-center justify-between px-4 gap-2">

                    {/* Mobile Menu Trigger & Logo Group */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 lg:hidden rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <Menu size={20} className="text-white/70" />
                        </button>

                        <Link href="/" className="flex items-center gap-2 group">
                            <Brain className="w-5 h-5 text-neural-magenta drop-shadow-[0_0_8px_rgba(252,114,255,0.5)]" />
                            <span className="font-black text-base tracking-tighter whitespace-nowrap hidden sm:block italic">
                                Hook<span className="text-neural-magenta">Mind</span>
                            </span>
                            <span className="neon-badge hidden xl:inline text-[9px] -translate-y-px">v4 · UNICHAIN</span>
                        </Link>
                    </div>

                    {/* Nav Links - Desktop */}
                    <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
                        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                            const active = path === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={clsx(
                                        "relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                                        active ? "text-neural-cyan" : "text-gray-500 hover:text-gray-200"
                                    )}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 rounded-lg bg-neural-cyan/8 border border-neural-cyan/20"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <Icon className="w-3.5 h-3.5 relative" />
                                    <span className="relative">{label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right: Status + Settings + Wallet */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Status Strip */}
                        <div className="hidden lg:flex items-center gap-2.5 font-mono border border-white/8 rounded-lg px-3 py-1.5 bg-white/3 text-[10px]">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-neural-green animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-neural-green font-semibold">ONLINE</span>
                            </div>
                            <span className="text-gray-700">|</span>
                            <span className="text-gray-500"><span className="text-neural-cyan">{ws}ms</span></span>
                            <span className="text-gray-700">|</span>
                            <span className="text-gray-500 flex items-center gap-0.5">
                                <Zap size={10} className="text-neural-magenta" />
                                <span className="text-white">{block.toLocaleString()}</span>
                            </span>
                        </div>

                        {/* Settings */}
                        <button
                            onClick={() => setSettingsOpen(true)}
                            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-neural-magenta/50 transition-all duration-200 group"
                        >
                            <Settings size={16} className="text-white/50 group-hover:text-neural-magenta group-hover:rotate-45 transition-all duration-300" />
                        </button>

                        {/* Wallet */}
                        <div className="scale-90 md:scale-100 origin-right transition-transform">
                            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
