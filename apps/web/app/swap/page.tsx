'use client';
import { motion } from "framer-motion";
import { ArrowLeftRight, Zap, Shield, Info } from "lucide-react";
import SwapQuotePanel from "@/components/ui/SwapQuotePanel";
import { useLanguage } from "@/context/LanguageContext";

export default function SwapPage() {
    const { t } = useLanguage();

    return (
        <div className="pt-24 px-6 max-w-7xl mx-auto pb-20 flex flex-col items-center">
            {/* Header */}
            <div className="text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 neon-badge mb-4"
                >
                    <Zap size={14} className="text-neural-cyan" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neural-cyan">
                        Powered by Uniswap Trading API
                    </span>
                </motion.div>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4 italic">
                    SWAP <span className="text-transparent bg-clip-text bg-linear-to-r from-neural-magenta to-neural-cyan">ANYTHING</span>
                </h1>
                <p className="text-gray-500 max-w-xl font-mono text-sm leading-relaxed mx-auto">
                    Institutional-grade routing. Zero latency. 
                    Get the best price across Uniswap V2, V3, V4 and UniswapX in one click.
                </p>
            </div>

            {/* Main Swap Container */}
            <div className="w-full max-w-lg">
                <SwapQuotePanel
                    tokenIn={{ address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', decimals: 18 }}
                    tokenOut={{ address: '0x7780Ba8F829A797D17634E79519e2fdF929fD698', symbol: 'USDC', decimals: 6 }}
                />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
                <div className="glass-card p-6 border-t-2 border-neural-cyan">
                    <div className="w-10 h-10 rounded-lg bg-neural-cyan/10 flex items-center justify-center mb-4">
                        <Shield size={20} className="text-neural-cyan" />
                    </div>
                    <h3 className="text-white font-bold mb-2">MEV Protection</h3>
                    <p className="text-xs text-gray-500 font-mono leading-relaxed">
                        Automatic routing via UniswapX when possible to protect you from sandwich attacks and front-running.
                    </p>
                </div>

                <div className="glass-card p-6 border-t-2 border-neural-green">
                    <div className="w-10 h-10 rounded-lg bg-neural-green/10 flex items-center justify-center mb-4">
                        <Zap size={20} className="text-neural-green" />
                    </div>
                    <h3 className="text-white font-bold mb-2">Gasless Swaps</h3>
                    <p className="text-xs text-gray-500 font-mono leading-relaxed">
                        UniswapX routing allows fillers to pay your gas fees, making the experience smoother than ever.
                    </p>
                </div>

                <div className="glass-card p-6 border-t-2 border-neural-magenta">
                    <div className="w-10 h-10 rounded-lg bg-neural-magenta/10 flex items-center justify-center mb-4">
                        <Info size={20} className="text-neural-magenta" />
                    </div>
                    <h3 className="text-white font-bold mb-2">Best Price Routing</h3>
                    <p className="text-xs text-gray-500 font-mono leading-relaxed">
                        The Trading API scans all liquidity pools and private fillers to ensure you receive the maximum output.
                    </p>
                </div>
            </div>
        </div>
    );
}
