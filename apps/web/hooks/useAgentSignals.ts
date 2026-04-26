import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
import { HOOK_MIND_CORE_ADDRESS } from '@/lib/constants';

const AGENT_SIGNAL_EVENT = parseAbiItem(
  'event AgentSignalProcessed(bytes32 indexed poolId, address indexed agent, uint24 newFeeBps, uint256 volatilityScore, bool ilProtectionActive, string ipfsCid)'
);

export interface AgentSignal {
  blockNumber: bigint;
  txHash: `0x${string}`;
  poolId: `0x${string}`;
  agent: `0x${string}`;
  newFeeBps: number;
  volatilityScore: number;
  ilProtectionActive: boolean;
  ipfsCid: string;
  timestamp: number | null;
}

// Unichain Sepolia RPC max range is 10,000 blocks (~2.8h at 1 block/sec)
const LOOKBACK_BLOCKS = BigInt(9_999);

export function useAgentSignals() {
  const client = usePublicClient();
  const [signals, setSignals] = useState<AgentSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    setError(null);

    try {
      const latestBlock = await client.getBlockNumber();
      const fromBlock = latestBlock > LOOKBACK_BLOCKS ? latestBlock - LOOKBACK_BLOCKS : BigInt(0);

      const logs = await client.getLogs({
        address: HOOK_MIND_CORE_ADDRESS,
        event: AGENT_SIGNAL_EVENT,
        fromBlock,
        toBlock: 'latest',
      });

      // Decode and sort descending (most recent first)
      const decoded: AgentSignal[] = logs.reverse().map((log) => ({
        blockNumber: log.blockNumber ?? BigInt(0),
        txHash: log.transactionHash ?? '0x',
        poolId: (log.args.poolId ?? '0x') as `0x${string}`,
        agent: (log.args.agent ?? '0x') as `0x${string}`,
        newFeeBps: Number(log.args.newFeeBps ?? 0),
        volatilityScore: Number(log.args.volatilityScore ?? 0),
        ilProtectionActive: Boolean(log.args.ilProtectionActive),
        ipfsCid: String(log.args.ipfsCid ?? ''),
        timestamp: null,
      }));

      setSignals(decoded);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch signals');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchSignals();
    // Refresh every 12 seconds (matches Unichain Sepolia block cadence)
    const id = setInterval(fetchSignals, 12_000);
    return () => clearInterval(id);
  }, [fetchSignals]);

  return { signals, loading, error, refresh: fetchSignals };
}
