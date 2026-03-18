"use client";
import Link from "next/link";
import { Brain, ArrowUpRight, ShieldCheck, Activity } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
    const { t } = useLanguage();
    
    return (
        <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-2xl mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
                    {/* Brand & Description */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
                        <Link href="/" className="flex items-center gap-2 group mb-6">
                            <Brain className="w-8 h-8 text-[#06B6D4] group-hover:drop-shadow-[0_0_12px_#06B6D4] transition-all" />
                            <span className="font-extrabold text-2xl tracking-tight text-white italic">
                                Hook<span className="text-[#06B6D4]">Mind</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm max-w-md leading-relaxed mb-6">
                            {t.footer.description}
                        </p>
                        {/* Social Icons SVG removed for brevity in translation context */}
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-[rgba(6,182,212,0.15)] flex items-center justify-center text-[#06B6D4] hover:text-white bg-[rgba(6,182,212,0.05)] hover:bg-[#06B6D4] hover:shadow-[0_0_16px_rgba(6,182,212,0.5)] transition-all">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.961H5.078z" /></svg>
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#06B6D4]" />
                            {t.footer.ecosystem}
                        </h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t.footer.dashboard}</Link></li>
                            <li><Link href="/agents" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t.footer.agent_network}</Link></li>
                            <li><Link href="/pools" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t.footer.intelligence_pools}</Link></li>
                            <li><Link href="/vault" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t.footer.vault_integration}</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
                            {t.footer.developers}
                        </h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/docs" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">{t.footer.protocol_docs}</Link></li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-[#06B6D4] group flex items-center gap-1 transition-colors">
                                    {t.footer.smart_contracts} <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-[#06B6D4] group flex items-center gap-1 transition-colors">
                                    {t.footer.ipfs_audit} <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-[#06B6D4] group flex items-center gap-1 transition-colors">
                                    {t.footer.unichain_explorer} <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-gray-500 text-xs font-medium">
                        © {new Date().getFullYear()} HookMind Labs. {t.footer.rights}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-gray-500">
                        <Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link>
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <span className="relative flex w-2 h-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full w-2 h-2 bg-green-500"></span>
                            </span>
                            <span className="text-green-400 font-mono tracking-tight">{t.footer.mainnet_active}</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
