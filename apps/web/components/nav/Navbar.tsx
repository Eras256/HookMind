"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Brain, Home, Bot, Shield, BookOpen, BarChart3 } from "lucide-react";
import { clsx } from "clsx";
const NAV_LINKS = [
    { href: "/", label: "Matrix", icon: Home, desc: "Live Agent Feed" },
    { href: "/agents", label: "Agents", icon: Bot, desc: "Configure AI Nodes" },
    { href: "/pools", label: "Pools", icon: BarChart3, desc: "Pool Intelligence" },
    { href: "/vault", label: "Vault", icon: Shield, desc: "Yield & IL Insurance" },
    { href: "/docs", label: "Docs", icon: BookOpen, desc: "IPFS Audit Logs" },
];
export function Navbar() {
    const path = usePathname();
    return (
        <nav
            className="fixed top-0 inset-x-0 z-50 h-16"
            style={{
                background: "rgba(5, 5, 15, 0.7)",
                borderBottom: "1px solid rgba(6, 182, 212, 0.15)",
                backdropFilter: "blur(24px)",
            }}
        >
            <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <Brain className="w-6 h-6 text-[#06B6D4] group-hover:drop-shadow-[0_0_8px_#06B6D4] transition-all" />
                    <span className="font-bold text-lg tracking-tight">
                        Hook<span className="text-[#06B6D4]">Mind</span>
                    </span>
                    <span className="neon-badge hidden sm:inline">v4 HOOK</span>
                </Link>
                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={clsx(
                                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                path === href
                                    ? "bg-[rgba(6,182,212,0.12)] text-[#06B6D4] shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    ))}
                </div>
                {/* Wallet Connect */}
                <ConnectButton showBalance={false} chainStatus="icon" />
            </div>
        </nav>
    );
}
