"use client";
import { Shield, CheckCircle2, GitBranch, Globe } from "lucide-react";

export default function InstitutionalCompliance() {
    return (
        <div className="glass-card p-6 border-l-4 border-neural-cyan mt-12 bg-neural-cyan/5">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-void border border-neural-cyan/30 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-neural-cyan" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-black text-white mb-3 tracking-tighter uppercase italic">Institutional Compliance & Transparency</h3>
                    <p className="text-xs text-gray-400 font-mono leading-relaxed mb-6">
                        HookMind operates as a non-custodial software infrastructure layer. Our Treasury and Insurance modules are designed to meet the rigorous standards of the **Uniswap Foundation Acceleration Program** and the **SCF Build Award** (Stellar Community Fund equivalent for Unichain).
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-white/3 rounded-xl p-3 border border-white/5">
                            <CheckCircle2 className="w-4 h-4 text-neural-green" />
                            <div>
                                <div className="text-[10px] text-gray-500 font-mono uppercase">Decentralization Status</div>
                                <div className="text-xs font-bold text-white font-mono">Full Non-Custodial (MiCA Ready)</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/3 rounded-xl p-3 border border-white/5">
                            <GitBranch className="w-4 h-4 text-neural-magenta" />
                            <div>
                                <div className="text-[10px] text-gray-500 font-mono uppercase">Audit Persistence</div>
                                <div className="text-xs font-bold text-white font-mono">100% IPFS Anchored reasoning</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/3 rounded-xl p-3 border border-white/5">
                            <Globe className="w-4 h-4 text-neural-cyan" />
                            <div>
                                <div className="text-[10px] text-gray-500 font-mono uppercase">Jurisdiction Bridge</div>
                                <div className="text-xs font-bold text-white font-mono">Mexico Fintech Law Compliant</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/3 rounded-xl p-3 border border-white/5">
                            <Shield className="w-4 h-4 text-neural-green" />
                            <div>
                                <div className="text-[10px] text-gray-500 font-mono uppercase">Circuit Breakers</div>
                                <div className="text-xs font-bold text-white font-mono">Institutional Admin Pausability</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-4">
                <a href="https://unichain-sepolia.blockscout.com/address/0xf9e8768686d0138ee041898a906ddd78519955c8" target="_blank" className="text-[9px] font-mono font-bold text-neural-cyan hover:underline">CONTRACT: HookMindCore →</a>
                <a href="https://unichain-sepolia.blockscout.com/address/0xb3411c3e83bf0e79a00821206fb89ff8130c5f4e" target="_blank" className="text-[9px] font-mono font-bold text-neural-cyan hover:underline">REGISTRY: AgentRegistry →</a>
                <a href="#" className="text-[9px] font-mono font-bold text-neural-magenta hover:underline">WHITE PAPER: Cognitive Infrastructure v1.0 →</a>
            </div>
        </div>
    );
}
