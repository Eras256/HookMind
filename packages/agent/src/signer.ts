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
    volatilityScore: number;
    ilProtect: boolean;
    ipfsCID: string;
    nonce: bigint;
    chainId: number;
}
export class AgentSigner {
    private readonly privateKey: `0x${string}`;
    constructor(private readonly account: Account, privateKey?: `0x${string}`) {
        this.privateKey = privateKey ?? (process.env.AGENT_PRIVATE_KEY as `0x${string}`);
    }
    async signSignal(params: SignalParams): Promise<`0x${string}`> {
        const msgHash = keccak256(encodePacked(
            ["bytes32", "uint24", "uint256", "bool", "string", "uint256", "uint256"],
            [
                params.poolId,
                params.fee,
                BigInt(params.volatilityScore),
                params.ilProtect,
                params.ipfsCID,
                params.nonce,
                BigInt(params.chainId),
            ]
        ));
        return signMessage({
            privateKey: this.privateKey,
            message: { raw: msgHash },
        });
    }
}
