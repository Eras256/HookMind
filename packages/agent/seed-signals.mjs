/**
 * seed-signals.mjs — Generates real AgentSignalProcessed events on Unichain Sepolia.
 *
 * Run from project root:
 *   node scripts/seed-signals.mjs
 */

import { createPublicClient, createWalletClient, http, encodePacked, keccak256 } from "viem";
import { privateKeyToAccount, signMessage } from "viem/accounts";
import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(__dirname, ".env") });

// ── FRESH deployment (2026-04-26) ─────────────────────────────────────────────
const HOOK_ADDRESS = "0x1E9ce3E00860921c72a6cd6909786A1767a755c8";
const POOL_ID      = "0x614e643c18b72cb6deba1b89d01f25715f1b25071651b906755c3ef362c15c30";
const RPC_URL      = "https://sepolia.unichain.org";
const CHAIN_ID     = 1301;
const AGENT_KEY    = process.env.AGENT_PRIVATE_KEY;

// Mock USDC (0x77...) > WETH (0x42...) → WETH is currency0
const POOL_KEY = {
  currency0: "0x4200000000000000000000000000000000000006", // WETH
  currency1: "0x7780Ba8F829A797D17634E79519e2fdF929fD698", // Mock USDC
  fee: 0x800000,
  tickSpacing: 60,
  hooks: HOOK_ADDRESS,
};

if (!AGENT_KEY) { console.error("AGENT_PRIVATE_KEY missing in packages/agent/.env"); process.exit(1); }

const ABI = [
  {
    name: "updateNeuralState",
    type: "function",
    inputs: [
      { name: "key", type: "tuple", components: [
        { name: "currency0",   type: "address" },
        { name: "currency1",   type: "address" },
        { name: "fee",         type: "uint24"  },
        { name: "tickSpacing", type: "int24"   },
        { name: "hooks",       type: "address" },
      ]},
      { name: "newFee",          type: "uint24"  },
      { name: "volatilityScore", type: "uint256" },
      { name: "ilProtect",       type: "bool"    },
      { name: "ipfsCid",         type: "string"  },
      { name: "nonce",           type: "uint256" },
      { name: "signature",       type: "bytes"   },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "agentNonces",
    type: "function",
    inputs: [{ name: "operator", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
];

const SCENARIOS = [
  { label: "Stable market",      fee: 3000, vol: 2100, il: false },
  { label: "Mild volatility",    fee: 5000, vol: 4800, il: false },
  { label: "High volatility",    fee: 7500, vol: 7300, il: true  },
  { label: "Spike — MEV alert",  fee: 9500, vol: 9100, il: true  },
  { label: "Cooling down",       fee: 4200, vol: 3500, il: false },
];

async function main() {
  const chain = { id: CHAIN_ID, name: "Unichain Sepolia",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } } };

  const account   = privateKeyToAccount(AGENT_KEY);
  const pubClient = createPublicClient({ chain, transport: http(RPC_URL) });
  const walClient = createWalletClient({ account, chain, transport: http(RPC_URL) });

  console.log("\n🧠 HookMind Signal Seeder");
  console.log(`   Hook:  ${HOOK_ADDRESS}`);
  console.log(`   Pool:  ${POOL_ID}`);
  console.log(`   Agent: ${account.address}\n`);

  let nonce = await pubClient.readContract({
    address: HOOK_ADDRESS, abi: ABI, functionName: "agentNonces", args: [account.address],
  });
  console.log(`   Starting nonce: ${nonce}\n`);

  for (const s of SCENARIOS) {
    console.log(`⚡ ${s.label}`);
    console.log(`   fee=${s.fee} bps  vol=${s.vol}/10000  IL=${s.il}`);

    const cid = `QmHookMindSeed${Date.now()}`;

    // Sign: keccak256(abi.encodePacked(poolId, fee, vol, il, cid, nonce, chainId))
    const msgHash = keccak256(encodePacked(
      ["bytes32", "uint24",  "uint256",      "bool",  "string", "uint256", "uint256"],
      [POOL_ID,   s.fee,     BigInt(s.vol),  s.il,    cid,      nonce,     BigInt(CHAIN_ID)]
    ));
    const sig = await signMessage({ privateKey: AGENT_KEY, message: { raw: msgHash } });

    try {
      const tx = await walClient.writeContract({
        address: HOOK_ADDRESS, abi: ABI, functionName: "updateNeuralState",
        args: [POOL_KEY, s.fee, BigInt(s.vol), s.il, cid, nonce, sig],
      });
      console.log(`   ✅ ${tx}\n`);
      nonce = nonce + 1n;
      await new Promise(r => setTimeout(r, 4000));
    } catch (err) {
      console.error(`   ❌ ${err.shortMessage || err.message}\n`);
    }
  }

  console.log(`Done! Seeded ${SCENARIOS.length} scenarios.`);
  console.log("Reload the dashboard — Agent Signal Feed will show them.\n");
}

main().catch(console.error);
