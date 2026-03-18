/**
 * HookMind Data Worker: Protege al LLM contra Flash Loans y ruido de mercado.
 * Implementa Varianza Estadística y Filtros Heurísticos.
 */
import { VolatilityStrategy } from "../strategies/volatilityFee";
import { createLogger } from "../logger";

const log = createLogger("HookMind:Worker");

export class NeuralDataWorker {
    private strategy = new VolatilityStrategy();

    /**
     * Procesa los datos del pool y genera un prompt limpio.
     * Criterio de Aceptación: Si la desviación > 15%, aborta el proceso.
     */
    public prepareNeuralPayload(
        spotPrice: number, 
        twap: number, 
        history: number[], 
        poolMetadata: any
    ) {
        // 1. Ejecutar Filtro Heurístico (Guardrail)
        const isDataCorrupted = this.strategy.isDataManipulated(spotPrice, history);
        
        if (isDataCorrupted) {
            throw new Error("FLASH_LOAN_DETECTION: Aborting due to price anomaly (>15% deviation)");
        }

        // 2. Calcular Varianza Estadística (σ²)
        const variance = this.strategy.calculateVariance([...history, spotPrice]);
        const volatilityScore = Math.min(10000, Math.round(Math.sqrt(variance) / 0.05 * 10000));

        // 3. Formatear Prompt JSON para el LLM
        const payload = {
            version: "1.1",
            timestamp: Date.now(),
            metrics: {
                price_analytics: {
                    spot_price: spotPrice,
                    twap_10m: twap,
                    variance: variance.toFixed(6),
                    deviation_from_twap: `${((Math.abs(spotPrice - twap) / twap) * 100).toFixed(2)}%`
                },
                volatility: {
                    score: volatilityScore, // 0-10000
                    classification: volatilityScore > 7000 ? "CRITICAL" : (volatilityScore > 3000 ? "ELEVATED" : "STABLE")
                }
            },
            context: {
                liquidity: poolMetadata.liquidity.toString(),
                recent_trades: poolMetadata.recentSwapCount,
                safety_status: "GREEN_VERIFIED" // Solo llega aquí si pasó el filtro del 15%
            }
        };

        return {
            jsonPayload: payload,
            volatilityScore
        };
    }
}
