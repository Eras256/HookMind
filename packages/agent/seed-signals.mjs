/**
 * seed-signals.mjs — Sends real updateNeuralState() calls to the fresh HookMindCore.
 * Run from packages/agent: node seed-signals.mjs
 */
import { createPublicClient, createWalletClient, http, encodePacked, keccak256 } from "viem";
import { privateKeyToAccount, signMessage } from "viem/accounts";
import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(__dir, ".env") });

const HOOK    = "0x6C1D32018976A6dE59f1970Ac35BCACD17BbD5c8";
const POOL_ID = "0x3faf657fade7f4f22456018f3529e083bd153065269e41cbd75d6dd9cbd48ca5";
const RPC     = "https://sepolia.unichain.org";
const CHAIN_ID = 1301;
const KEY      = process.env.AGENT_PRIVATE_KEY;

// USDC (0x31d0..) < WETH (0x42..) → USDC is currency0
const POOL_KEY = {
  currency0: "0x31d0220469e10c4E71834a79b1f276d740d3768F",
  currency1: "0x4200000000000000000000000000000000000006",
  fee: 0x800000, tickSpacing: 60,
  hooks: HOOK,
};

const ABI = [{
  name: "updateNeuralState", type: "function",
  inputs: [
    { name: "key", type: "tuple", components: [
      { name: "currency0", type: "address" }, { name: "currency1", type: "address" },
      { name: "fee", type: "uint24" }, { name: "tickSpacing", type: "int24" },
      { name: "hooks", type: "address" },
    ]},
    { name: "newFee", type: "uint24" }, { name: "volatilityScore", type: "uint256" },
    { name: "ilProtect", type: "bool" }, { name: "ipfsCid", type: "string" },
    { name: "nonce", type: "uint256" }, { name: "signature", type: "bytes" },
  ],
  outputs: [], stateMutability: "nonpayable",
}, {
  name: "agentNonces", type: "function", stateMutability: "view",
  inputs: [{ name: "operator", type: "address" }],
  outputs: [{ type: "uint256" }],
}];

const SCENARIOS = [
  { label: "Market opening — baseline",  fee: 3000, vol: 2400, il: false },
  { label: "Volume spike detected",      fee: 5500, vol: 5800, il: false },
  { label: "High volatility event",      fee: 7800, vol: 7600, il: true  },
  { label: "MEV activity detected",      fee: 9200, vol: 9000, il: true  },
  { label: "Cooling — returning normal", fee: 4000, vol: 3200, il: false },
];

async function main() {
  if (!KEY) { console.error("AGENT_PRIVATE_KEY missing"); process.exit(1); }
  const chain = { id: CHAIN_ID, name: "Unichain Sepolia", nativeCurrency: { name:"ETH",symbol:"ETH",decimals:18 }, rpcUrls: { default: { http: [RPC] } } };
  const account  = privateKeyToAccount(KEY);
  const pubCli   = createPublicClient({ chain, transport: http(RPC) });
  const walCli   = createWalletClient({ account, chain, transport: http(RPC) });

  console.log("\n🧠 HookMind Signal Seeder");
  console.log("   Hook:  ", HOOK);
  console.log("   Agent: ", account.address);

  let nonce;
  try {
    nonce = await pubCli.readContract({ address: HOOK, abi: ABI, functionName: "agentNonces", args: [account.address] });
  } catch { nonce = 0n; }
  console.log("   Nonce: ", nonce.toString(), "\n");

  for (const s of SCENARIOS) {
    const cid = `QmHookMind${Date.now()}`;
    const msgHash = keccak256(encodePacked(
      ["bytes32", "uint24",  "uint256",      "bool",  "string", "uint256", "uint256"],
      [POOL_ID,   s.fee,     BigInt(s.vol),  s.il,    cid,      nonce,     BigInt(CHAIN_ID)]
    ));
    const sig = await signMessage({ privateKey: KEY, message: { raw: msgHash } });
    console.log(`⚡ ${s.label}`);
    try {
      const tx = await walCli.writeContract({
        address: HOOK, abi: ABI, functionName: "updateNeuralState",
        args: [POOL_KEY, s.fee, BigInt(s.vol), s.il, cid, nonce, sig],
      });
      console.log(`   ✅ ${tx}`);
      nonce = nonce + 1n;
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      console.error(`   ❌ ${e.shortMessage || e.message.slice(0,100)}`);
    }
  }
  console.log("\n✅ Done! Reload dashboard to see live signals.\n");
}
main().catch(console.error);
