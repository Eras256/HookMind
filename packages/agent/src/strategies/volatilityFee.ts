/**
 * VolatilityStrategy — Computes real-time volatility score from on-chain swap data.
 * Score range: 0 (dead calm) → 10000 (extreme volatility).
 * Used as primary input to the LLM for fee decisions.
 */
import type { Log } from "viem";
interface SwapEvent {
    amount0: bigint;
    amount1: bigint;
    sqrtPriceX96: bigint;
    tick: number;
}
export class VolatilityStrategy {
    /**
     * Compute volatility score from a window of recent swap events.
     * Algorithm: normalized tick range over the sample window.
     */
    compute(swapEvents: SwapEvent[]): number {
        if (swapEvents.length < 2) return 5000; // neutral default
        const ticks = swapEvents.map((e) => e.tick);
        const maxTick = Math.max(...ticks);
        const minTick = Math.min(...ticks);
        const tickRange = Math.abs(maxTick - minTick);
        // Normalize: 0 ticks range = 0, 1000 tick range = max score
        const score = Math.min(10000, (tickRange / 1000) * 10000);
        return Math.round(score);
    }
}
