'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Zap, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useUniswapQuote } from '@/hooks/useUniswapQuote';

interface Token {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
}

interface Props {
  tokenIn: Token;
  tokenOut: Token;
}

const ROUTING_LABELS: Record<string, { label: string; color: string }> = {
  CLASSIC: { label: 'AMM Classic', color: 'var(--color-neural-cyan)' },
  DUTCH_V2: { label: 'UniswapX', color: 'var(--color-neural-green)' },
  DUTCH_V3: { label: 'UniswapX V3', color: 'var(--color-neural-green)' },
  PRIORITY: { label: 'Priority MEV-free', color: 'var(--color-neural-gold)' },
};

export default function SwapQuotePanel({ tokenIn, tokenOut }: Props) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { getQuote, reset, quote, loading, error, isChainSupported } = useUniswapQuote();
  const [amountIn, setAmountIn] = useState('');

  const handleQuote = async () => {
    if (!address || !amountIn) return;
    const amountRaw = parseUnits(amountIn, tokenIn.decimals).toString();
    await getQuote({ tokenIn: tokenIn.address, tokenOut: tokenOut.address, amount: amountRaw, swapper: address });
  };

  const outputFormatted = quote
    ? Number(formatUnits(BigInt(quote.outputAmount), tokenOut.decimals)).toLocaleString(undefined, {
        maximumFractionDigits: 6,
      })
    : null;

  const routingMeta = quote ? ROUTING_LABELS[quote.routing] : null;

  return (
    <div className="glass-card p-6 space-y-4 border border-white/10 rounded-2xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black tracking-widest uppercase text-gray-400">Swap Quote</span>
        {!isChainSupported && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-neural-gold border border-neural-gold/30 rounded-full px-2 py-0.5">
            <AlertTriangle size={10} /> Testnet
          </span>
        )}
      </div>

      {/* Input */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono uppercase">You pay</span>
          <span className="text-xs text-gray-500 font-mono">{tokenIn.symbol}</span>
        </div>
        <input
          type="number"
          min="0"
          placeholder="0.00"
          value={amountIn}
          onChange={(e) => { setAmountIn(e.target.value); reset(); }}
          className="w-full bg-transparent text-2xl font-black text-white outline-none placeholder:text-white/20"
        />
      </div>

      <div className="flex justify-center">
        <ArrowDown size={16} className="text-gray-600" />
      </div>

      {/* Output */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono uppercase">You receive</span>
          <span className="text-xs text-gray-500 font-mono">{tokenOut.symbol}</span>
        </div>
        <div className="text-2xl font-black text-white">
          {loading ? (
            <span className="text-white/30 flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Fetching...
            </span>
          ) : outputFormatted ? (
            <motion.span
              key={outputFormatted}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-neural-green"
            >
              {outputFormatted}
            </motion.span>
          ) : (
            <span className="text-white/20">—</span>
          )}
        </div>
      </div>

      {/* Quote details */}
      <AnimatePresence>
        {quote && routingMeta && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500">Route</span>
              <span className="flex items-center gap-1 font-bold" style={{ color: routingMeta.color }}>
                {quote.isGasless ? <Zap size={11} /> : <Shield size={11} />}
                {routingMeta.label}
              </span>
            </div>
            {quote.gasFeeUSD && (
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-500">Est. gas</span>
                <span className="text-gray-300">${quote.gasFeeUSD}</span>
              </div>
            )}
            {quote.isGasless && (
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-500">Gas cost</span>
                <span className="text-neural-green">Free (filler pays)</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500">Slippage</span>
              <span className="text-gray-300">0.5%</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-mono text-neural-red bg-neural-red/10 border border-neural-red/20 rounded-lg px-3 py-2"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      {!isChainSupported ? (
        <div className="text-center text-xs text-gray-500 font-mono py-2 border border-white/5 rounded-xl">
          Chain {chainId} is not supported by the Trading API.
        </div>
      ) : (
        <button
          onClick={handleQuote}
          disabled={loading || !amountIn || !address}
          className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #00F2FE22, #FC72FF22)',
            border: '1px solid rgba(0,242,254,0.3)',
            color: '#00F2FE',
          }}
        >
          {loading ? 'Getting quote...' : !address ? 'Connect wallet' : 'Get Quote'}
        </button>
      )}
    </div>
  );
}
