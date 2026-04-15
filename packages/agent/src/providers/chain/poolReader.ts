import { parseAbi, keccak256, encodeAbiParameters, type PublicClient } from "viem";

/**
 * PoolReader — Reads real market data from Unichain via Uniswap v4 PoolManager.
 *
 * Uniswap v4 stores pool state in the PoolManager using packed storage slots.
 * There is no direct getSlot0() RPC call — state is read through IExtsload,
 * the external storage-reading interface the PoolManager implements.
 *
 * Slot layout for Pool.State (v4-core/src/libraries/Pool.sol):
 *   baseSlot + 0 : Slot0 { sqrtPriceX96 (160b) | tick (24b) | protocolFee (24b) | lpFee (24b) }
 *   baseSlot + 1 : feeGrowthGlobal0X128
 *   baseSlot + 2 : feeGrowthGlobal1X128
 *   baseSlot + 3 : liquidity (uint128, lower 128 bits)
 *
 * baseSlot = keccak256(abi.encode(poolId, POOLS_SLOT))
 * POOLS_SLOT = 6  (position of `mapping(PoolId => Pool.State) pools` in PoolManager)
 */

// IExtsload: batch-reads arbitrary storage slots from the PoolManager
const EXTSLOAD_ABI = parseAbi([
    "function extsload(bytes32[] calldata slots) external view returns (bytes32[] memory)",
]);

// HookMindCore view: returns the AI-set intelligence state for a pool
const HOOK_MIND_ABI = parseAbi([
    "function poolIntelligence(bytes32 id) external view returns (uint24 targetFeeBps, uint256 volatilityScore, uint256 lastAgentUpdate, bool ilProtectionActive, uint256 epochFeesAccrued)",
]);

// POOLS_SLOT is position 6 in PoolManager storage layout (v4-core PoolManager.sol)
const POOLS_SLOT = 6n;
const Q96 = 2n ** 96n;
const MAX_HISTORY = 10;

/** Compute the base storage slot for a pool's State struct in PoolManager. */
function getPoolStateSlot(poolId: `0x${string}`): bigint {
    const encoded = encodeAbiParameters(
        [{ type: "bytes32" }, { type: "uint256" }],
        [poolId, POOLS_SLOT]
    );
    return BigInt(keccak256(encoded));
}

/** Format a bigint as a 0x-prefixed 32-byte hex string (EVM storage slot). */
function toSlotHex(n: bigint): `0x${string}` {
    return `0x${n.toString(16).padStart(64, "0")}` as `0x${string}`;
}

/**
 * Parse the packed Slot0 word from Pool.State:
 * - bits   0–159 : sqrtPriceX96 (uint160)
 * - bits 160–183 : tick (int24)
 * - bits 184–207 : protocolFee (uint24)
 * - bits 208–231 : lpFee (uint24)
 */
function parseSlot0(raw: `0x${string}`) {
    const val = BigInt(raw);
    const sqrtPriceX96 = val & ((1n << 160n) - 1n);
    const rawTick = Number((val >> 160n) & ((1n << 24n) - 1n));
    // int24 sign extension: values > 2^23-1 are negative
    const tick = rawTick > 8_388_607 ? rawTick - 16_777_216 : rawTick;
    const protocolFee = Number((val >> 184n) & ((1n << 24n) - 1n));
    const lpFee = Number((val >> 208n) & ((1n << 24n) - 1n));
    return { sqrtPriceX96, tick, protocolFee, lpFee };
}

/** Parse lower 128 bits of slot+3 as the pool's active liquidity. */
function parseLiquidity(raw: `0x${string}`): bigint {
    return BigInt(raw) & ((1n << 128n) - 1n);
}

/** Convert sqrtPriceX96 → human-readable float price (token1 per token0). */
function sqrtPriceX96ToFloat(sqrtPriceX96: bigint): number {
    if (sqrtPriceX96 === 0n) return 0;
    const sq = Number(sqrtPriceX96) / Number(Q96);
    return sq * sq;
}

export class PoolReader {
    private priceHistory: number[] = [];
    private lastKnownPrice = 0;

    private readonly poolManager = (
        process.env.POOL_MANAGER_ADDRESS ?? "0x00B036B58a818B1BC34d502D3fE730Db729e62AC"
    ) as `0x${string}`;

    constructor(private readonly client: PublicClient) {}

    /**
     * Reads current pool state from Unichain:
     * - sqrtPriceX96 → spot price  (via PoolManager extsload)
     * - liquidity                   (via PoolManager extsload)
     * - targetFeeBps                (via HookMindCore.poolIntelligence)
     * Falls back gracefully if the pool is not yet initialized or calls fail.
     */
    async readPoolState(hook: `0x${string}`, poolId: `0x${string}`) {
        const baseSlot = getPoolStateSlot(poolId);
        const slot0Key = toSlotHex(baseSlot);
        const liquidityKey = toSlotHex(baseSlot + 3n);

        const [extsloadResult, intelResult, blockNumber] = await Promise.all([
            this.client
                .readContract({
                    address: this.poolManager,
                    abi: EXTSLOAD_ABI,
                    functionName: "extsload",
                    args: [[slot0Key, liquidityKey]],
                })
                .catch(() => null),
            this.client
                .readContract({
                    address: hook,
                    abi: HOOK_MIND_ABI,
                    functionName: "poolIntelligence",
                    args: [poolId],
                })
                .catch(() => null),
            this.client.getBlockNumber().catch(() => 0n),
        ]);

        let spotPrice = this.lastKnownPrice;
        let liquidity = 0n;
        let currentFeeBps = 3000;

        if (extsloadResult && Array.isArray(extsloadResult) && extsloadResult.length >= 2) {
            const { sqrtPriceX96 } = parseSlot0(extsloadResult[0] as `0x${string}`);
            if (sqrtPriceX96 > 0n) {
                spotPrice = sqrtPriceX96ToFloat(sqrtPriceX96);
                this.lastKnownPrice = spotPrice;
            }
            liquidity = parseLiquidity(extsloadResult[1] as `0x${string}`);
        }

        if (intelResult) {
            const [targetFeeBps] = intelResult as [number, bigint, bigint, boolean, bigint];
            if (targetFeeBps > 0) currentFeeBps = targetFeeBps;
        }

        // Build rolling price window for TWAP
        if (spotPrice > 0) {
            this.priceHistory.push(spotPrice);
            if (this.priceHistory.length > MAX_HISTORY) this.priceHistory.shift();
        }

        const currency0 = (
            process.env.POOL_CURRENCY0 ?? "0x31d0220469e10c4E71834a79b1f276d740d3768F"
        ) as `0x${string}`;
        const currency1 = (
            process.env.POOL_CURRENCY1 ?? "0x4200000000000000000000000000000000000006"
        ) as `0x${string}`;

        return {
            key: {
                currency0,
                currency1,
                fee: 0x800000 as number,
                tickSpacing: 60,
                hooks: hook,
            },
            spotPrice,
            currentFeeBps,
            recentSwapCount: 0,
            liquidity,
            blockNumber: blockNumber as bigint,
        };
    }

    /**
     * Returns a time-weighted average price computed from the rolling window
     * of spot prices collected each agent cycle (~12s intervals).
     * This approximates a 2-minute TWAP at default settings (10 samples × 12s).
     */
    async getTWAP(_poolId: `0x${string}`): Promise<number> {
        if (this.priceHistory.length === 0) return this.lastKnownPrice;
        const sum = this.priceHistory.reduce((a, b) => a + b, 0);
        return sum / this.priceHistory.length;
    }

    /**
     * Returns the collected price history for variance / volatility calculation.
     */
    async getPriceHistory(_poolId: `0x${string}`, _minutes = 10): Promise<number[]> {
        return [...this.priceHistory];
    }
}
