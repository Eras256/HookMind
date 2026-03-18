import { useAccount, useWriteContract, useReadContract, useSimulateContract } from 'wagmi';
import { 
  YIELD_VAULT_ADDRESS, 
  YIELD_VAULT_ABI, 
  IL_INSURANCE_ADDRESS, 
  IL_INSURANCE_ABI, 
  USDC_ADDRESS,
  HOOK_MIND_CORE_ADDRESS,
  HOOK_MIND_CORE_ABI
} from '../lib/constants';
import { parseUnits } from 'viem';

// Simplified USDC ABI for allowance/approve
const USDC_ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function useHookMind() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // 1. Vault Interactions
  const depositInVault = async (amount: string) => {
    const value = parseUnits(amount, 6); // USDC is 6 decimals
    
    // First approve
    await writeContractAsync({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [YIELD_VAULT_ADDRESS, value],
    });

    // Then deposit
    return writeContractAsync({
      address: YIELD_VAULT_ADDRESS,
      abi: YIELD_VAULT_ABI,
      functionName: 'deposit',
      args: [value, address],
    });
  };

  // 2. IL Insurance Interactions
  const payInsurancePremium = async (poolId: `0x${string}`) => {
    // Premiums vary, but usually fixed in contract for now
    // Assume premiumAmount is 10 USDC as seen in contract
    const premium = parseUnits("10", 6);

    await writeContractAsync({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [IL_INSURANCE_ADDRESS, premium],
    });

    return writeContractAsync({
      address: IL_INSURANCE_ADDRESS,
      abi: IL_INSURANCE_ABI,
      functionName: 'payPremium',
      args: [poolId],
    });
  };

  return {
    depositInVault,
    payInsurancePremium,
    address
  };
}
