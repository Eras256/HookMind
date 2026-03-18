/**
 * AgentSigner — Signs hook signals with the agent's private key.
 * The HookMindCore.sol contract verifies these signatures before
 * accepting any parameter change — preventing unauthorized manipulation.
 */
import { encodePacked, keccak256, type Account } from "viem";
import { signMessage } from "viem/accounts";
interface SignalParams {
    poolId: `0x${string}`;
    fee: number;
    ilProtect: boolean;
    chainId: number;
}
export class AgentSigner {
    constructor(private readonly account: Account) { }
    async signSignal(params: SignalParams): Promise<`0x${string}`> {
        const msgHash = keccak256(encodePacked(
            ["bytes32", "uint24", "bool", "uint256"],
            [
                params.poolId,
                params.fee,
                params.ilProtect,
                BigInt(params.chainId),
            ]
        ));
        // Follows the exact same hashing as the Solidity contract:
        // keccak256(abi.encodePacked(...)).toEthSignedMessageHash().recover(sig)
        return signMessage({
            privateKey: process.env.AGENT_PRIVATE_KEY as `0x${string}`,
            message: { raw: msgHash },
        });
    }
}
