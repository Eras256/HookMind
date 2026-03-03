/**
 * PinataAudit — HMAC-SHA256 + Pinata IPFS Upload
 * Every agent cycle's reasoning and execution data is pinned immutably.
 * Mirrors Nirium's IPFS audit trail pattern from packages/agent.
 */
import { createHmac } from "crypto";
import { createLogger } from "../logger";
const log = createLogger("PinataAudit");
export class PinataAudit {
    private readonly jwt = process.env.PINATA_JWT!;
    private readonly gateway = process.env.PINATA_GATEWAY!;
    private readonly hmacKey = process.env.AGENT_PRIVATE_KEY!.slice(2, 34); // 32 bytes
    async upload(payload: object): Promise<string> {
        const json = JSON.stringify(payload);
        const hmac = createHmac("sha256", this.hmacKey).update(json).digest("hex");
        const body = JSON.stringify({
            pinataContent: { ...payload, _hmac: hmac, _version: "1.0.0" },
            pinataMetadata: {
                name: `hookmind-agent-log-${Date.now()}`,
                keyvalues: { protocol: "HookMind", chain: "unichain" },
            },
        });
        const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.jwt}`,
                "Content-Type": "application/json",
            },
            body,
        });
        if (!res.ok) throw new Error(`Pinata upload failed: ${res.statusText}`);
        const data = await res.json() as { IpfsHash: string };
        log.info(`Pinned audit log: ipfs://${data.IpfsHash}`);
        return `ipfs://${data.IpfsHash}`;
    }
}
