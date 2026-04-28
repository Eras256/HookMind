'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Shield, ShieldOff, RefreshCw, ExternalLink, Loader2, Radio } from 'lucide-react';
import { useAgentSignals, type AgentSignal } from '@/hooks/useAgentSignals';

// ── Helpers ───────────────────────────────────────────────────────────────────

function feeLabel(bps: number) {
  return `${(bps / 10000).toFixed(2)}%`;
}

function volColor(score: number) {
  if (score >= 7000) return 'var(--color-neural-red)';
  if (score >= 4000) return 'var(--color-neural-gold)';
  return 'var(--color-neural-green)';
}

function volLabel(score: number) {
  if (score >= 7000) return 'HIGH';
  if (score >= 4000) return 'MED';
  return 'LOW';
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function shortPool(poolId: string) {
  return `${poolId.slice(0, 8)}…${poolId.slice(-6)}`;
}

// ── Signal Card ───────────────────────────────────────────────────────────────

function SignalCard({ signal, index }: { signal: AgentSignal; index: number }) {
  const vc = volColor(signal.volatilityScore);
  const vl = volLabel(signal.volatilityScore);
  const volPct = signal.volatilityScore / 100;

  const rawCid = signal.ipfsCid.replace(/^ipfs:\/\//, '');
  const isValidCid = rawCid.length > 10 && !rawCid.includes('pending') && !rawCid.includes('testnet');
  const ipfsUrl = isValidCid
    ? `https://gateway.pinata.cloud/ipfs/${rawCid}`
    : null;

  const explorerUrl = `https://sepolia.uniscan.xyz/tx/${signal.txHash}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      onClick={() => window.open(explorerUrl, '_blank', 'noopener,noreferrer')}
      className="bg-white/3 border border-white/10 rounded-xl p-4 space-y-3 hover:border-neural-cyan/40 hover:bg-neural-cyan/5 transition-all cursor-pointer group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-neural-cyan/10 border border-neural-cyan/20 flex items-center justify-center shrink-0">
            <Brain size={13} className="text-neural-cyan" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Agent</div>
            <div className="text-xs font-mono text-white">{shortAddr(signal.agent)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {signal.ilProtectionActive ? (
            <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-neural-green border border-neural-green/30 rounded-full px-2 py-0.5">
              <Shield size={9} /> IL ON
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[9px] font-mono text-gray-500 border border-white/10 rounded-full px-2 py-0.5">
              <ShieldOff size={9} /> IL OFF
            </span>
          )}
        </div>
      </div>

      {/* Fee + Volatility */}
      <div className="grid grid-cols-2 gap-3">
        {/* New Fee */}
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Dynamic Fee</div>
          <div className="text-lg font-black text-neural-cyan font-mono leading-none">
            {feeLabel(signal.newFeeBps)}
          </div>
          <div className="text-[9px] text-gray-500 font-mono">{signal.newFeeBps} bps</div>
        </div>

        {/* Volatility */}
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Volatility</div>
          <div className="text-lg font-black font-mono leading-none" style={{ color: vc }}>
            {vl}
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${volPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: vc }}
            />
          </div>
        </div>
      </div>

      {/* Pool + IPFS */}
      <div className="flex items-center justify-between text-[9px] font-mono">
        <span className="text-gray-600">pool {shortPool(signal.poolId)}</span>
        {ipfsUrl && (
          <a
            href={ipfsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-neural-magenta/70 hover:text-neural-magenta transition-colors"
          >
            <ExternalLink size={9} /> AI Audit Log
          </a>
        )}
      </div>

      {/* Block + explorer hint */}
      <div className="flex items-center justify-between text-[9px] font-mono">
        <span className="text-gray-700">block #{signal.blockNumber.toString()}</span>
        <span className="flex items-center gap-1 text-gray-700 group-hover:text-neural-cyan transition-colors">
          <ExternalLink size={9} /> Ver en Uniscan
        </span>
      </div>
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-neural-cyan/5 border border-neural-cyan/10 flex items-center justify-center">
        <Radio size={20} className="text-neural-cyan/40 animate-pulse" />
      </div>
      <p className="text-xs text-gray-600 font-mono">No agent signals in the last 24h.</p>
      <p className="text-[10px] text-gray-700 font-mono max-w-xs">
        Run the agent daemon to publish a signed{' '}
        <code className="text-neural-cyan/60">updateNeuralState</code> tx.
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AgentSignalFeed({ maxItems = 8 }: { maxItems?: number }) {
  const { signals, loading, error, refresh } = useAgentSignals();

  const visible = signals.slice(0, maxItems);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neural-cyan animate-pulse shadow-[0_0_8px_#00F2FE]" />
          <span className="text-xs font-black uppercase tracking-widest text-neural-cyan">
            Agent Signal Feed
          </span>
          {!loading && signals.length > 0 && (
            <span className="text-[10px] font-mono text-gray-600">
              ({signals.length} signal{signals.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="text-gray-600 hover:text-white transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Body */}
      {loading && signals.length === 0 ? (
        <div className="flex items-center justify-center py-10 gap-2 text-gray-600">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs font-mono">Scanning Unichain Sepolia…</span>
        </div>
      ) : error ? (
        <div className="text-xs font-mono text-neural-red/70 bg-neural-red/5 border border-neural-red/20 rounded-xl px-4 py-3">
          {error}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState />
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {visible.map((signal, i) => (
              <SignalCard
                key={`${signal.txHash}-${i}`}
                signal={signal}
                index={i}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
