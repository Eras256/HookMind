export const HOOK_MIND_CORE_ADDRESS = "0xf9e8768686d0138ee041898a906ddd78519955c8" as const;
export const AGENT_REGISTRY_ADDRESS = "0xb3411c3e83bf0e79a00821206fb89ff8130c5f4e" as const;
export const YIELD_VAULT_ADDRESS = "0xa0242258bc39d2b2daaf4913f30803f77b01a79b" as const;
export const IL_INSURANCE_ADDRESS = "0x42aa32c49e993936d23a3cc746173c6954a07eef" as const;
export const POOL_MANAGER_ADDRESS = "0x00B036B58a818B1BC34d502D3fE730Db729e62AC" as const;
export const USDC_ADDRESS = "0x86dd85969a254258383ef3dff357671cb5161f88" as const;

import HookMindCore from "./abis/HookMindCore.json";
import AgentRegistry from "./abis/AgentRegistry.json";
import YieldVault from "./abis/YieldVault.json";
import ILInsurance from "./abis/ILInsurance.json";

export const HOOK_MIND_CORE_ABI = HookMindCore.abi;
export const AGENT_REGISTRY_ABI = AgentRegistry.abi;
export const YIELD_VAULT_ABI = YieldVault.abi;
export const IL_INSURANCE_ABI = ILInsurance.abi;

export const UNICHAIN_SEPOLIA_CHAIN_ID = 1301;
