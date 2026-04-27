// HookMind — FRESH deployment on Unichain Sepolia (2026-04-26)
// All addresses verified on-chain. Pool initialized + agent registered.

export const HOOK_MIND_CORE_ADDRESS = "0x1E9ce3E00860921c72a6cd6909786A1767a755c8" as const;
export const AGENT_REGISTRY_ADDRESS = "0x90936056be4ea86Cd4c8a1Cf53A28c6712affCCA" as const;
export const YIELD_VAULT_ADDRESS    = "0x1e8837a897E80114281b2fbEf938695a3d6E5c60" as const;
export const IL_INSURANCE_ADDRESS   = "0x67b3ceD9Fb477546BfC736866b8fF3865f101FC1" as const;
export const POOL_MANAGER_ADDRESS   = "0x00B036B58a818B1BC34d502D3fE730Db729e62AC" as const;
export const USDC_ADDRESS           = "0x7780Ba8F829A797D17634E79519e2fdF929fD698" as const;
export const WETH_ADDRESS           = "0x4200000000000000000000000000000000000006" as const;
export const TARGET_POOL_ID         = "0x614e643c18b72cb6deba1b89d01f25715f1b25071651b906755c3ef362c15c30" as const;

import HookMindCore from "./abis/HookMindCore.json";
import AgentRegistry from "./abis/AgentRegistry.json";
import YieldVault from "./abis/YieldVault.json";
import ILInsurance from "./abis/ILInsurance.json";

export const HOOK_MIND_CORE_ABI = HookMindCore.abi;
export const AGENT_REGISTRY_ABI = AgentRegistry.abi;
export const YIELD_VAULT_ABI = YieldVault.abi;
export const IL_INSURANCE_ABI = ILInsurance.abi;

export const UNICHAIN_SEPOLIA_CHAIN_ID = 1301;
