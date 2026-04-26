import { useState, useCallback } from 'react';
import { useChainId } from 'wagmi';

// Trading API supported chain IDs (source: developers.uniswap.org/docs/api-reference)
// Unichain Sepolia (1301) is officially listed as a supported chainId.
const TRADING_API_CHAINS = new Set([1, 10, 56, 130, 137, 143, 480, 1301, 1868, 4217, 8453, 42161, 42220, 43114, 59144, 81457, 84532, 7777777, 11155111]);

export type QuoteRouting = 'CLASSIC' | 'DUTCH_V2' | 'DUTCH_V3' | 'PRIORITY' | 'WRAP' | 'UNWRAP';

export interface QuoteParams {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amount: string;
  swapper: `0x${string}`;
  type?: 'EXACT_INPUT' | 'EXACT_OUTPUT';
  slippageTolerance?: number;
}

export interface QuoteState {
  routing: QuoteRouting;
  outputAmount: string;
  gasFeeUSD: string | null;
  isGasless: boolean;
}

export function useUniswapQuote() {
  const chainId = useChainId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuoteState | null>(null);

  const isChainSupported = TRADING_API_CHAINS.has(chainId);

  const getQuote = useCallback(
    async (params: QuoteParams) => {
      if (!isChainSupported) {
        setError(`Chain ${chainId} not supported by the Trading API.`);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/uniswap?endpoint=quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            swapper: params.swapper,
            tokenIn: params.tokenIn,
            tokenOut: params.tokenOut,
            tokenInChainId: String(chainId),
            tokenOutChainId: String(chainId),
            amount: params.amount,
            type: params.type ?? 'EXACT_INPUT',
            slippageTolerance: params.slippageTolerance ?? 0.5,
            routingPreference: 'BEST_PRICE',
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail ?? 'Quote failed');

        const isUniswapX = ['DUTCH_V2', 'DUTCH_V3', 'PRIORITY'].includes(data.routing);

        const outputAmount = isUniswapX
          ? (data.quote?.orderInfo?.outputs?.[0]?.startAmount ?? '0')
          : (data.quote?.output?.amount ?? '0');

        const gasFeeUSD = data.routing === 'CLASSIC' ? (data.quote?.gasFeeUSD ?? null) : null;

        setQuote({
          routing: data.routing as QuoteRouting,
          outputAmount,
          gasFeeUSD,
          isGasless: isUniswapX,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [chainId, isChainSupported],
  );

  const reset = useCallback(() => {
    setQuote(null);
    setError(null);
  }, []);

  return { getQuote, reset, quote, loading, error, isChainSupported };
}
