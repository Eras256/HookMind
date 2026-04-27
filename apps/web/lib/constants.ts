// Active deployment — verified on Unichain Sepolia (pool initialized, agent registered)
export const HOOK_MIND_CORE_ADDRESS = "0x56e1aC266Fa45824d02AFAf7569cdd6Fd1ee15c0" as const;
export const AGENT_REGISTRY_ADDRESS = "0xE23380b98595d8adffcF59672f70b1209d521693" as const;
export const YIELD_VAULT_ADDRESS    = "0x3138BC6729187d4E558747019eD1448a5a82e939" as const;
export const IL_INSURANCE_ADDRESS   = "0x656008F87C3CE678C944FbaD938C3A5A5a8f722B" as const;
export const POOL_MANAGER_ADDRESS   = "0x00B036B58a818B1BC34d502D3fE730Db729e62AC" as const;
export const USDC_ADDRESS           = "0x31d0220469e10c4E71834a79b1f276d740d3768F" as const;
export const TARGET_POOL_ID         = "0xb7cace89ba6c8b33f5529e576a7f0820d42b587e1a2e518a01e176ffe12fb9fe" as const;

import HookMindCore from "./abis/HookMindCore.json";
import AgentRegistry from "./abis/AgentRegistry.json";
import YieldVault from "./abis/YieldVault.json";
import ILInsurance from "./abis/ILInsurance.json";

export const HOOK_MIND_CORE_ABI = HookMindCore.abi;
export const AGENT_REGISTRY_ABI = AgentRegistry.abi;
export const YIELD_VAULT_ABI = YieldVault.abi;
export const IL_INSURANCE_ABI = ILInsurance.abi;

export const UNICHAIN_SEPOLIA_CHAIN_ID = 1301;
