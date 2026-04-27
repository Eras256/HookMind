'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, ShieldOff, Loader2, Radio, RefreshCw } from 'lucide-react';
import { usePoolIntelligenceFeed, type IntelligenceSnapshot } from '@/hooks/usePoolIntelligenceFeed';

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
  if (score >= 4000) return 'MEDIUM';
  return 'LOW';
}

function timeAgo(ts: number) {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function SnapshotCard({ snap, index, isLatest }: { snap: IntelligenceSnapshot; index: number; isLatest: boolean }) {
  const vc = volColor(snap.volatilityScore);
  const vl = volLabel(snap.volatilityScore);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`bg-white/[0.03] border rounded-xl p-3 ${isLatest ? 'border-neural-cyan/40' : 'border-white/10'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {isLatest && <span className="w-1.5 h-1.5 rounded-full bg-neural-cyan animate-pulse shadow-[0_0_6px_#00F2FE]" />}
          <span className="text-[10px] font-mono text-gray-500">block #{snap.blockNumber.toString()}</span>
        </div>
        <span className="text-[10px] font-mono text-gray-600">{timeAgo(snap.timestamp)}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/5 rounded-lg py-1.5">
          <div className="text-[8px] text-gray-500 font-mono uppercase">Active Fee</div>
          <div className="text-sm font-black text-neural-cyan font-mono">{feeLabel(snap.currentDynamicFee)}</div>
        </div>
        <div className="bg-white/5 rounded-lg py-1.5">
          <div className="text-[8px] text-gray-500 font-mono uppercase">Volatility</div>
          <div className="text-sm font-black font-mono" style={{ color: vc }}>{vl}</div>
        </div>
        <div className="bg-white/5 rounded-lg py-1.5 flex flex-col items-center justify-center gap-0.5">
          <div className="text-[8px] text-gray-500 font-mono uppercase">IL Insurance</div>
          {snap.ilProtectionActive ? (
            <Shield size={11} className="text-neural-green" />
          ) : (
            <ShieldOff size={11} className="text-gray-600" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PoolIntelligenceFeed({ maxItems = 6 }: { maxItems?: number }) {
  const { history, loading, error, latest } = usePoolIntelligenceFeed();
  const visible = history.slice(0, maxItems);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-neural-cyan" />
          <span className="text-xs font-black uppercase tracking-widest text-neural-cyan">
            Live Pool Intelligence
          </span>
        </div>
        {loading && history.length === 0 && <Loader2 size={12} className="animate-spin text-gray-500" />}
        {!loading && <RefreshCw size={11} className="text-gray-700" />}
      </div>

      {/* Latest hero card */}
      {latest && (
        <div className="bg-gradient-to-br from-neural-cyan/10 to-neural-magenta/5 border border-neural-cyan/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neural-cyan animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neural-cyan">Current State (on-chain)</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">Dynamic Fee Now</div>
              <div className="text-3xl font-black text-white font-mono leading-none">{feeLabel(latest.currentDynamicFee)}</div>
              <div className="text-[10px] text-gray-600 font-mono mt-1">{latest.currentDynamicFee} basis points</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">Volatility Score</div>
              <div className="text-3xl font-black font-mono leading-none" style={{ color: volColor(latest.volatilityScore) }}>
                {latest.volatilityScore.toLocaleString()}
              </div>
              <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${latest.volatilityScore / 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: volColor(latest.volatilityScore) }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {error ? (
        <div className="text-xs font-mono text-neural-red/70 bg-neural-red/5 border border-neural-red/20 rounded-xl px-4 py-3">
          {error}
        </div>
      ) : loading && history.length === 0 ? (
        <div className="flex items-center justify-center py-8 gap-2 text-gray-600">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs font-mono">Reading pool state from Unichain…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <Radio size={20} className="text-neural-cyan/30 animate-pulse" />
          <span className="text-xs font-mono text-gray-600">Waiting for state changes…</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-1">State History</div>
          <AnimatePresence>
            {visible.map((snap, i) => (
              <SnapshotCard
                key={`${snap.blockNumber}-${snap.timestamp}`}
                snap={snap}
                index={i}
                isLatest={i === 0}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
