'use client';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Shield, Zap } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import SwapQuotePanel from '@/components/ui/SwapQuotePanel';
import AgentSignalFeed from '@/components/ui/AgentSignalFeed';
import { useLanguage } from '@/context/LanguageContext';

// Unichain Sepolia token addresses
const WETH: `0x${string}` = '0x4200000000000000000000000000000000000006';
const USDC: `0x${string}` = '0x86dd85969a254258383ef3dff357671cb5161f88';

export default function SwapPage() {
  const { isConnected } = useAccount();
  const { t } = useLanguage();

  return (
    <div className="pt-20 px-5 max-w-7xl mx-auto pb-20">
      <div className="pt-10 mb-10">
        <div className="inline-flex items-center gap-2 neon-badge mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-neural-cyan animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neural-cyan">
            Powered by Uniswap Trading API
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-3">
          Swap &amp;{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-neural-cyan to-neural-magenta">
            Get USDC
          </span>
        </h1>
        <p className="text-gray-500 max-w-xl font-mono text-sm leading-relaxed">
          Swap any token for USDC at the best available price via Uniswap v4 and UniswapX.
          Then deposit USDC to activate IL insurance on your liquidity positions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: swap panel */}
        <div className="space-y-4">
          {!isConnected ? (
            <div className="glass-card p-10 flex flex-col items-center gap-4 text-center rounded-2xl">
              <ArrowLeftRight size={32} className="text-neural-cyan/40" />
              <p className="text-sm text-gray-500 font-mono">
                {t.common.connect_wallet} to get a live swap quote
              </p>
              <ConnectButton />
            </div>
          ) : (
            <SwapQuotePanel
              tokenIn={{ address: WETH, symbol: 'WETH', decimals: 18 }}
              tokenOut={{ address: USDC, symbol: 'USDC', decimals: 6 }}
            />
          )}

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
              <Shield size={16} className="text-neural-green shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white mb-1">Best Execution</div>
                <div className="text-[11px] text-gray-500 font-mono leading-relaxed">
                  Routes through Uniswap v2, v3, v4 and UniswapX for the best price.
                </div>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
              <Zap size={16} className="text-neural-gold shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white mb-1">No Extra Fees</div>
                <div className="text-[11px] text-gray-500 font-mono leading-relaxed">
                  HookMind charges 0 additional fees on swaps. You only pay the Uniswap pool fee.
                </div>
              </div>
            </div>
          </div>

          {/* Next step hint */}
          <div className="bg-neural-magenta/5 border border-neural-magenta/20 rounded-xl p-4 text-xs font-mono text-neural-magenta/80 leading-relaxed">
            After swapping, head to <strong>LP Insurance</strong> to deposit USDC and protect your liquidity positions against impermanent loss.
          </div>
        </div>

        {/* RIGHT: live AI signal feed */}
        <div className="glass-card p-5 rounded-2xl">
          <AgentSignalFeed maxItems={8} />
        </div>
      </div>
    </div>
  );
}
