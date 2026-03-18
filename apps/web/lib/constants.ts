export const HOOK_MIND_CORE_ADDRESS = "0x450113E691b4be42EB9ca3a3E0F585a2D79915c0" as const;
export const AGENT_REGISTRY_ADDRESS = "0xeF00B7Cea0B1AB51340619b7afD48c0a5dfCc013" as const;
export const YIELD_VAULT_ADDRESS = "0xB4637368A6cFbfae9A9218F87CA77d813Bed7877" as const;
export const IL_INSURANCE_ADDRESS = "0x6A919739d655b9073135679ca0c8C5aB33448844" as const;
export const POOL_MANAGER_ADDRESS = "0x00B036B58a818B1BC34d502D3fE730Db729e62AC" as const;
export const USDC_ADDRESS = "0x31d0220469e10c4E71834a79b1f276d740d3768F" as const;

import HookMindCore from "./abis/HookMindCore.json";
import AgentRegistry from "./abis/AgentRegistry.json";
import YieldVault from "./abis/YieldVault.json";
import ILInsurance from "./abis/ILInsurance.json";

export const HOOK_MIND_CORE_ABI = HookMindCore.abi;
export const AGENT_REGISTRY_ABI = AgentRegistry.abi;
export const YIELD_VAULT_ABI = YieldVault.abi;
export const IL_INSURANCE_ABI = ILInsurance.abi;

export const UNICHAIN_SEPOLIA_CHAIN_ID = 1301;
