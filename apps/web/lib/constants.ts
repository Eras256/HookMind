// HookMind — Fresh deployment 2026-04-27
// Real USDC (0x31d0..., 16.6M supply), Unichain Sepolia
// Pool: USDC/WETH initialized at sqrtPrice ≈ 2000 USDC/WETH

export const HOOK_MIND_CORE_ADDRESS = "0x6C1D32018976A6dE59f1970Ac35BCACD17BbD5c8" as const;
export const AGENT_REGISTRY_ADDRESS = "0x8d7a735Ab7682f7bcb4D50EA8114264058833df7" as const;
export const YIELD_VAULT_ADDRESS    = "0x192653B71407735798Dde43a7A669C145da5B8F1" as const;
export const IL_INSURANCE_ADDRESS   = "0xD61c1a1806651661ac0a00824b829c1F50D38F99" as const;
export const POOL_MANAGER_ADDRESS   = "0x00B036B58a818B1BC34d502D3fE730Db729e62AC" as const;
export const USDC_ADDRESS           = "0x31d0220469e10c4E71834a79b1f276d740d3768F" as const;
export const WETH_ADDRESS           = "0x4200000000000000000000000000000000000006" as const;
export const TARGET_POOL_ID         = "0x3faf657fade7f4f22456018f3529e083bd153065269e41cbd75d6dd9cbd48ca5" as const;

import HookMindCore from "./abis/HookMindCore.json";
import AgentRegistry from "./abis/AgentRegistry.json";
import YieldVault from "./abis/YieldVault.json";
import ILInsurance from "./abis/ILInsurance.json";

export const HOOK_MIND_CORE_ABI = HookMindCore.abi;
export const AGENT_REGISTRY_ABI = AgentRegistry.abi;
export const YIELD_VAULT_ABI = YieldVault.abi;
export const IL_INSURANCE_ABI = ILInsurance.abi;

export const UNICHAIN_SEPOLIA_CHAIN_ID = 1301;
