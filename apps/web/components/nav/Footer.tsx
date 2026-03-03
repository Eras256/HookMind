import Link from "next/link";
import { Brain, ArrowUpRight, ShieldCheck, Activity } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-2xl mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
                    {/* Brand & Description */}
                    <div className="col-span-1 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 group mb-6 inline-flex">
                            <Brain className="w-8 h-8 text-[#06B6D4] group-hover:drop-shadow-[0_0_12px_#06B6D4] transition-all" />
                            <span className="font-extrabold text-2xl tracking-tight text-white">
                                Hook<span className="text-[#06B6D4]">Mind</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm max-w-md leading-relaxed mb-6">
                            The first autonomous AI agent protocol controlling Uniswap v4 Hooks.
                            Protecting LPs from impermanent loss through cryptographically signed neural signals directly on Unichain.
                        </p>
                        {/* Social Icons SVG */}
                        <div className="flex items-center gap-4">
                            {/* Twitter / X */}
                            <a href="#" className="w-10 h-10 rounded-full border border-[rgba(6,182,212,0.15)] flex items-center justify-center text-[#06B6D4] hover:text-white bg-[rgba(6,182,212,0.05)] hover:bg-[#06B6D4] hover:shadow-[0_0_16px_rgba(6,182,212,0.5)] transition-all">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.961H5.078z" /></svg>
                            </a>
                            {/* Discord */}
                            <a href="#" className="w-10 h-10 rounded-full border border-[rgba(6,182,212,0.15)] flex items-center justify-center text-[#06B6D4] hover:text-white bg-[rgba(6,182,212,0.05)] hover:bg-[#06B6D4] hover:shadow-[0_0_16px_rgba(6,182,212,0.5)] transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
                            </a>
                            {/* GitHub */}
                            <a href="#" className="w-10 h-10 rounded-full border border-[rgba(6,182,212,0.15)] flex items-center justify-center text-[#06B6D4] hover:text-white bg-[rgba(6,182,212,0.05)] hover:bg-[#06B6D4] hover:shadow-[0_0_16px_rgba(6,182,212,0.5)] transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col">
                        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#06B6D4]" />
                            Ecosystem
                        </h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">Matrix</Link></li>
                            <li><Link href="/agents" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">Agent Network</Link></li>
                            <li><Link href="/pools" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">Intelligence Pools</Link></li>
                            <li><Link href="/vault" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">Vault Integration</Link></li>
                        </ul>
                    </div>

                    {/* Resources & Security */}
                    <div className="flex flex-col">
                        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
                            Developers
                        </h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/docs" className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all">Protocol Documentation</Link></li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-[#06B6D4] group flex items-center gap-1 transition-colors">
                                    Smart Contracts <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-[#06B6D4] group flex items-center gap-1 transition-colors">
                                    IPFS Audit Reports <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-[#06B6D4] group flex items-center gap-1 transition-colors">
                                    Unichain Explorer <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-gray-500 text-xs font-medium">
                        © {new Date().getFullYear()} HookMind Labs. All rights reserved.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-gray-500">
                        <Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link>
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Security Bug Bounty</Link>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <span className="relative flex w-2 h-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full w-2 h-2 bg-green-500"></span>
                            </span>
                            <span className="text-green-400 font-mono tracking-tight">Mainnet Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
