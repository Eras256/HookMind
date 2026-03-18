/**
 * VolatilityStrategy — Advanced Data Pipeline for AI Agent Protection.
 * 
 * Features:
 * 1. Variance-based volatility calculation (sigma squared).
 * 2. Flash Loan Heuristic Filter (15% deviation check).
 * 3. TWAP Integration Support.
 */
import { createLogger } from "../logger";

const log = createLogger("HookMind:Volatility");

interface PricePoint {
    price: number;
    timestamp: number;
}

export class VolatilityStrategy {
    private readonly MAX_DEVIATION_THRESHOLD = 0.15; // 15% Flash Loan Guardian

    /**
     * Calculates variance of price over a window.
     * Formula: σ² = Σ(Pi - P_avg)² / (N - 1)
     */
    public calculateVariance(prices: number[]): number {
        if (prices.length < 2) return 0;

        const N = prices.length;
        const average = prices.reduce((a, b) => a + b, 0) / N;
        
        const sumOfSquares = prices.reduce((sum, price) => {
            return sum + Math.pow(price - average, 2);
        }, 0);

        return sumOfSquares / (N - 1);
    }

    /**
     * Heuristic Noise Filter
     * Compares current spot price against the window to detect anomalies (Flash Loans).
     */
    public isDataManipulated(spotPrice: number, history: number[]): boolean {
        if (history.length === 0) return false;
        
        // Use the last known price for simple delta check
        const lastPrice = history[history.length - 1];
        const deviation = Math.abs(spotPrice - lastPrice) / lastPrice;

        if (deviation > this.MAX_DEVIATION_THRESHOLD) {
            log.warn(`⚠️ FLASH LOAN ATTACK DETECTED: Price deviation of ${(deviation * 100).toFixed(2)}% exceeds 15% threshold.`);
            return true;
        }

        return false;
    }

    /**
     * Data Pre-processor for the LLM
     */
    public processWindow(spotPrice: number, history: number[], twap: number): {
        score: number;
        variance: number;
        manipulated: boolean;
        cleanPrice: number;
    } {
        const manipulated = this.isDataManipulated(spotPrice, history);
        
        // If manipulated, we act defensively: use TWAP as clean price and cap volatility
        const cleanPrice = manipulated ? twap : spotPrice;
        const variance = this.calculateVariance([...history, cleanPrice]);
        
        // Normalize variance into a 0-10000 score
        // (Assuming a standard deviation of 5% is 'extreme' for this timeframe)
        const stdDev = Math.sqrt(variance);
        const score = Math.min(10000, Math.round((stdDev / 0.05) * 10000));

        return {
            score,
            variance,
            manipulated,
            cleanPrice
        };
    }
}
