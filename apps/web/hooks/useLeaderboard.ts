'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
import { HOOK_MIND_CORE_ADDRESS } from '@/lib/constants';

const AGENT_SIGNAL_EVENT = parseAbiItem(
  'event AgentSignalProcessed(bytes32 indexed poolId, address indexed agent, uint24 newFeeBps, uint256 volatilityScore, bool ilProtectionActive, string ipfsCid)'
);

const LOOKBACK_BLOCKS = BigInt(9_999);

export interface LeaderboardEntry {
  rank: number;
  address: string;
  signalsSent: number;
  avgFeeBps: number;
  ilProtectionRate: number;
  lastSeen: bigint;
  isCurrentUser?: boolean;
  // Derived display-compat fields
  accuracy: number;
  uptime: number;
  totalRevenue: number;
  poolsManaged: number;
  joinedDaysAgo: number;
  model: string;
}

function getBadge(signals: number): { badge: string; color: string } {
  if (signals >= 5000) return { badge: '🥇 Grand Master',   color: 'text-amber-400 border-amber-400/30 bg-amber-400/10' };
  if (signals >= 2000) return { badge: '🥈 Senior Operator', color: 'text-slate-300 border-slate-300/30 bg-slate-300/10' };
  if (signals >= 500)  return { badge: '🥉 Proven Node',     color: 'text-orange-400 border-orange-400/30 bg-orange-400/10' };
  if (signals >= 100)  return { badge: '⚡ Active Operator', color: 'text-neural-cyan border-neural-cyan/30 bg-neural-cyan/10' };
  if (signals >= 10)   return { badge: '🔵 Veteran Node',    color: 'text-blue-400 border-blue-400/30 bg-blue-400/10' };
  return                        { badge: '🟢 New Node',       color: 'text-neural-green border-neural-green/30 bg-neural-green/10' };
}

export function useLeaderboard(connectedAddress?: string) {
  const client = usePublicClient();
  const [entries, setEntries] = useState<(LeaderboardEntry & { badge: string; badgeColor: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    setError(null);
    try {
      const latest = await client.getBlockNumber();
      const from = latest > LOOKBACK_BLOCKS ? latest - LOOKBACK_BLOCKS : BigInt(0);

      const logs = await client.getLogs({
        address: HOOK_MIND_CORE_ADDRESS,
        event: AGENT_SIGNAL_EVENT,
        fromBlock: from,
        toBlock: 'latest',
      });

      const map = new Map<string, { signals: number; totalFee: number; ilCount: number; lastBlock: bigint }>();

      for (const log of logs) {
        const agent = (log.args.agent ?? '').toLowerCase();
        if (!agent) continue;
        const prev = map.get(agent) ?? { signals: 0, totalFee: 0, ilCount: 0, lastBlock: BigInt(0) };
        map.set(agent, {
          signals: prev.signals + 1,
          totalFee: prev.totalFee + Number(log.args.newFeeBps ?? 0),
          ilCount: prev.ilCount + (log.args.ilProtectionActive ? 1 : 0),
          lastBlock: log.blockNumber && log.blockNumber > prev.lastBlock ? log.blockNumber : prev.lastBlock,
        });
      }

      const sorted = Array.from(map.entries())
        .sort((a, b) => b[1].signals - a[1].signals)
        .map(([addr, stats], i) => {
          const { badge, color } = getBadge(stats.signals);
          const ilRate = stats.signals > 0 ? Math.round((stats.ilCount / stats.signals) * 100) : 0;
          const avgFee = stats.signals > 0 ? Math.round(stats.totalFee / stats.signals) : 0;
          return {
            rank: i + 1,
            address: addr,
            signalsSent: stats.signals,
            avgFeeBps: avgFee,
            ilProtectionRate: ilRate,
            lastSeen: stats.lastBlock,
            badge,
            badgeColor: color,
            isCurrentUser: connectedAddress ? addr === connectedAddress.toLowerCase() : false,
            // Derived display fields
            accuracy: ilRate,
            uptime: Math.min(99.9, 80 + Math.round(Math.min(stats.signals, 100) / 5)),
            totalRevenue: Math.round(stats.signals * avgFee * 0.0001),
            poolsManaged: 1,
            joinedDaysAgo: 0,
            model: 'Live Agent',
          };
        });

      setEntries(sorted);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, [client, connectedAddress]);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, [fetch]);

  return { entries, loading, error, refresh: fetch };
}
