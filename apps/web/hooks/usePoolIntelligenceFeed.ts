import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { HOOK_MIND_CORE_ADDRESS, TARGET_POOL_ID } from '@/lib/constants';

export interface IntelligenceSnapshot {
  blockNumber: bigint;
  timestamp: number;
  targetFeeBps: number;
  currentDynamicFee: number;
  volatilityScore: number;
  ilProtectionActive: boolean;
  lastAgentUpdate: number;
  epochFeesAccrued: bigint;
}

const ABI = [
  {
    name: 'poolIntelligence',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'poolId', type: 'bytes32' }],
    outputs: [
      { name: 'targetFeeBps',       type: 'uint24'  },
      { name: 'volatilityScore',    type: 'uint256' },
      { name: 'lastAgentUpdate',    type: 'uint256' },
      { name: 'ilProtectionActive', type: 'bool'    },
      { name: 'epochFeesAccrued',   type: 'uint256' },
    ],
  },
  {
    name: 'currentDynamicFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'poolId', type: 'bytes32' }],
    outputs: [{ type: 'uint24' }],
  },
] as const;

export function usePoolIntelligenceFeed() {
  const client = usePublicClient();
  const [history, setHistory] = useState<IntelligenceSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    if (!client) return;
    try {
      const block = await client.getBlockNumber();
      const [intel, dynFee] = await Promise.all([
        client.readContract({
          address: HOOK_MIND_CORE_ADDRESS,
          abi: ABI,
          functionName: 'poolIntelligence',
          args: [TARGET_POOL_ID as `0x${string}`],
        }),
        client.readContract({
          address: HOOK_MIND_CORE_ADDRESS,
          abi: ABI,
          functionName: 'currentDynamicFee',
          args: [TARGET_POOL_ID as `0x${string}`],
        }),
      ]);

      const snap: IntelligenceSnapshot = {
        blockNumber: block,
        timestamp: Date.now(),
        targetFeeBps:        Number(intel[0]),
        currentDynamicFee:   Number(dynFee),
        volatilityScore:     Number(intel[1]),
        lastAgentUpdate:     Number(intel[2]),
        ilProtectionActive:  Boolean(intel[3]),
        epochFeesAccrued:    intel[4],
      };

      setHistory((prev) => {
        const last = prev[0];
        // Only push if state changed or first poll
        if (!last ||
            last.currentDynamicFee !== snap.currentDynamicFee ||
            last.volatilityScore !== snap.volatilityScore ||
            last.ilProtectionActive !== snap.ilProtectionActive ||
            (snap.blockNumber - last.blockNumber) > BigInt(5)) {
          return [snap, ...prev].slice(0, 12);
        }
        return prev;
      });
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Read failed');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 6000);
    return () => clearInterval(id);
  }, [poll]);

  return { history, loading, error, latest: history[0] };
}
