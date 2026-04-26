"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutGrid, Cpu, GitBranch, Layers, TrendingUp, Puzzle, Brain,
    Lock, Book, Settings, Zap, Trophy, Home, Menu, X, ChevronDown, Globe, ArrowLeftRight
} from "lucide-react";
import { clsx } from "clsx";
import { useState, useEffect, useRef } from "react";
import NodeSettingsModal from "@/components/ui/NodeSettingsModal";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
    const path = usePathname();
    const { language, setLanguage, t } = useLanguage();
    
    const [ws, setWs] = useState(0);
    const [block, setBlock] = useState(1419243);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    const NAV_LINKS = [
        { href: "/", label: t.nav.home, icon: Home },
        { href: "/dashboard", label: t.nav.dashboard, icon: LayoutGrid },
        { href: "/agents", label: t.nav.agents, icon: Cpu },
        { href: "/leaderboard", label: t.nav.rankings, icon: Trophy },
        { href: "/builder", label: t.nav.builder, icon: GitBranch },
        { href: "/pools", label: t.nav.pools, icon: Layers },
        { href: "/swap", label: "Swap", icon: ArrowLeftRight },
        { href: "/strategies", label: t.nav.strats, icon: TrendingUp },
        { href: "/plugins", label: t.nav.plugins, icon: Puzzle },
        { href: "/skills", label: t.nav.skills, icon: Brain },
        { href: "/vault", label: t.nav.registry || "Registry", icon: Lock },
        { href: "/docs", label: t.nav.docs, icon: Book },
    ];

    // Priority links for smaller desktops
    const desktopPriorityCount = 6;
    const visibleLinks = NAV_LINKS.slice(0, desktopPriorityCount);
    const hiddenLinks = NAV_LINKS.slice(desktopPriorityCount);

    useEffect(() => {
        const interval = setInterval(() => {
            setWs(Math.floor(Math.random() * 20 + 14));
            setBlock((b) => b + Math.floor(Math.random() * 2));
        }, 3000);

        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setIsMoreOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <NodeSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-100 bg-void/98 backdrop-blur-2xl lg:hidden"
                    >
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* Header */}
                            <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-void/50">
                                <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsMenuOpen(false)}>
                                    <div className="w-10 h-10 rounded-xl bg-neural-magenta/10 flex items-center justify-center border border-neural-magenta/20 shadow-[0_0_15px_rgba(252,114,255,0.15)]">
                                        <Brain className="w-6 h-6 text-neural-magenta" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-xl tracking-tighter italic leading-none text-white">HOOKMIND</span>
                                        <span className="text-[9px] font-mono text-neural-magenta/60 tracking-[0.2em] font-bold uppercase">Neural Mesh v4</span>
                                    </div>
                                </Link>
                                <button 
                                    onClick={() => setIsMenuOpen(false)} 
                                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 active:scale-95 transition-all text-white/50 hover:text-white"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Links Grid */}
                            <div className="flex-1 overflow-y-auto py-8 px-5">
                                <div className="grid grid-cols-2 xs:grid-cols-2 gap-3 pb-12">
                                    {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                                        const active = path === href;
                                        return (
                                            <Link
                                                key={href}
                                                href={href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={clsx(
                                                    "flex flex-col items-start gap-3 p-4 rounded-2xl transition-all duration-300 group",
                                                    active 
                                                        ? "bg-neural-cyan/10 border border-neural-cyan/30 text-neural-cyan shadow-[0_0_20px_rgba(0,242,254,0.1)]" 
                                                        : "bg-white/3 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                    active ? "bg-neural-cyan/20 text-neural-cyan" : "bg-white/5 text-gray-500 group-hover:text-white group-hover:bg-white/10"
                                                )}>
                                                    <Icon size={20} />
                                                </div>
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="font-bold text-[10px] tracking-widest uppercase truncate max-w-full">{label}</span>
                                                    {active && <div className="w-1 h-1 rounded-full bg-neural-cyan animate-pulse shrink-0" />}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer Status */}
                            <div className="p-6 border-t border-white/5 bg-void/80 backdrop-blur-md">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                                        <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">{t.nav.connectivity}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-neural-green animate-pulse shadow-[0_0_8px_#00FFA3]" />
                                            <span className="text-[10px] font-black tracking-widest text-neural-green">{t.nav.online}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                                        <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Unichain {t.nav.state}</span>
                                        <div className="flex items-center gap-1.5">
                                            <Zap size={12} className="text-neural-magenta" />
                                            <span className="text-sm font-black text-white">{block.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-void/80 border-b border-white/4 backdrop-blur-xl saturate-150">
                <div className="max-w-[1800px] mx-auto h-full flex items-center justify-between px-4 lg:px-6 gap-2">

                    {/* Left: Mobile Trigger + Logo */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2.5 lg:hidden rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
                        >
                            <Menu size={20} className="text-white/70" />
                        </button>

                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-lg bg-neural-magenta/10 flex items-center justify-center border border-neural-magenta/20 transition-all group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(252,114,255,0.2)]">
                                <Brain className="w-5 h-5 text-neural-magenta" />
                            </div>
                            <span className="font-black text-lg tracking-tighter italic hidden sm:block text-white">
                                HOOK<span className="text-neural-magenta">MIND</span>
                            </span>
                        </Link>
                    </div>

                    {/* Center: Main Nav Links - Optimized responsiveness */}
                    <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center max-w-4xl">
                        {/* Always visible links on LG */}
                        {visibleLinks.map(({ href, label, icon: Icon }) => {
                            const active = path === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={clsx(
                                        "relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[10px] xl:text-[11px] font-bold tracking-widest uppercase transition-all duration-300 group",
                                        active ? "text-neural-cyan" : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                                    )}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="nav-pill-desktop"
                                            className="absolute inset-0 rounded-xl bg-neural-cyan/10 border border-neural-cyan/20 shadow-[0_0_15px_rgba(0,242,254,0.05)]"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={clsx("w-3.5 h-3.5 relative z-10 transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")} />
                                    <span className="relative z-10 hidden xl:block">{label}</span>
                                    {/* On LG only, show labels for first 3, icons for the rest */}
                                    <span className={clsx("relative z-10 xl:hidden", visibleLinks.indexOf({href, label, icon: Icon}) > 2 ? "hidden" : "block")}>{label}</span>
                                </Link>
                            );
                        })}

                        {/* Overflow Dropdown for Desktop */}
                        <div className="relative" ref={moreMenuRef}>
                            <button
                                onClick={() => setIsMoreOpen(!isMoreOpen)}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] xl:text-[11px] font-bold tracking-widest uppercase transition-all duration-300",
                                    isMoreOpen ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                                )}
                            >
                                <span className="hidden xl:inline">More</span>
                                <span className="xl:hidden">···</span>
                                <ChevronDown size={14} className={clsx("transition-transform duration-300", isMoreOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {isMoreOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute top-full mt-2 right-0 w-56 bg-void/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-60"
                                    >
                                        <div className="grid gap-1">
                                            {hiddenLinks.map(({ href, label, icon: Icon }) => {
                                                const active = path === href;
                                                return (
                                                    <Link
                                                        key={href}
                                                        href={href}
                                                        onClick={() => setIsMoreOpen(false)}
                                                        className={clsx(
                                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                                            active 
                                                                ? "bg-neural-cyan/10 text-neural-cyan border border-neural-cyan/20" 
                                                                : "hover:bg-white/5 text-gray-400 hover:text-white border border-transparent"
                                                        )}
                                                    >
                                                        <Icon size={16} className={clsx(active ? "text-neural-cyan" : "text-gray-500 group-hover:text-white")} />
                                                        <span className="text-[10px] font-bold tracking-tighter uppercase">{label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: Status + Settings + Wallet */}
                    <div className="flex items-center gap-2 xl:gap-3 shrink-0">
                        {/* Language Selector */}
                        <div className="hidden xs:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 hover:border-white/20 transition-all">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value as any)}
                                className="bg-transparent text-[10px] text-white/70 font-black tracking-widest uppercase focus:outline-none cursor-pointer p-0.5"
                            >
                                <option value="en" className="bg-void text-white">EN</option>
                                <option value="es" className="bg-void text-white">ES</option>
                                <option value="zh" className="bg-void text-white">ZH</option>
                            </select>
                        </div>

                        {/* Network Status - Compresses heavily */}
                        <div className="hidden md:flex items-center gap-3 font-mono border border-white/6 rounded-xl px-3 py-2 bg-white/2 text-[10px]">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-neural-green animate-pulse shadow-[0_0_8px_#00FFA3]" />
                                <span className="text-neural-green font-bold hidden lg:inline">{t.nav.synced}</span>
                            </div>
                            <div className="w-px h-3 bg-white/10 hidden xl:block" />
                            <span className="text-gray-500 hidden xl:inline">
                                <span className="text-neural-cyan">{ws}</span>
                                <span className="text-[8px] opacity-40 ml-0.5">MS</span>
                            </span>
                        </div>

                        {/* Settings Button */}
                        <button
                            onClick={() => setSettingsOpen(true)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-neural-magenta/40 transition-all duration-300 group active:scale-95"
                        >
                            <Settings size={18} className="text-white/40 group-hover:text-neural-magenta group-hover:rotate-90 transition-all duration-500" />
                        </button>

                        {/* Wallet Section */}
                        <div className="[&>button]:rounded-xl! [&>button]:h-10! [&>button]:px-4! [&>button]:bg-neural-magenta! [&>button]:text-black! [&>button]:font-black! [&>button]:text-[11px]! [&>button]:tracking-widest! [&>button]:uppercase! [&>button]:border-none! transition-transform hover:scale-[1.02] active:scale-[0.98]">
                            <ConnectButton 
                                showBalance={false} 
                                chainStatus="none" 
                                accountStatus={{
                                    smallScreen: 'avatar',
                                    largeScreen: 'full',
                                }} 
                            />
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
