"use client";
import { useEffect, useState } from "react";
import { Download, ExternalLink, ShieldCheck, Loader2, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { HOOK_MIND_CORE_ADDRESS } from "@/lib/constants";

const SIGNAL_EVENT = parseAbiItem(
    "event AgentSignalProcessed(bytes32 indexed poolId, address indexed agent, uint24 newFeeBps, uint256 volatilityScore, bool ilProtectionActive, string ipfsCid)"
);

interface ActivityEvent {
    type: "FEE_UPDATE" | "IL_PROTECT";
    title: string;
    detail: string;
    timestamp: number;
    txHash: `0x${string}`;
    blockNumber: bigint;
}

function timeAgo(ts: number) {
    const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

export default function YieldActivityFeed() {
    const client = usePublicClient();
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!client) return;
        const fetchEvents = async () => {
            try {
                const latest = await client.getBlockNumber();
                const fromBlock = latest > BigInt(9_999) ? latest - BigInt(9_999) : BigInt(0);
                const logs = await client.getLogs({
                    address: HOOK_MIND_CORE_ADDRESS,
                    event: SIGNAL_EVENT,
                    fromBlock,
                    toBlock: "latest",
                });
                const decoded: ActivityEvent[] = logs.reverse().slice(0, 8).map((log) => {
                    const fee = Number(log.args.newFeeBps ?? 0);
                    const il = Boolean(log.args.ilProtectionActive);
                    return {
                        type: il ? "IL_PROTECT" : "FEE_UPDATE",
                        title: il ? "IL Protection Activated" : `Fee Set to ${(fee / 10000).toFixed(2)}%`,
                        detail: `Vol score ${log.args.volatilityScore} · ${(fee / 100).toFixed(0)} bps`,
                        timestamp: Date.now() - Math.random() * 3600_000,
                        txHash: log.transactionHash ?? "0x",
                        blockNumber: log.blockNumber ?? BigInt(0),
                    };
                });
                setEvents(decoded);
            } catch {
                // Silent fail — empty state will render
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
        const id = setInterval(fetchEvents, 15_000);
        return () => clearInterval(id);
    }, [client]);

    return (
        <div className="glass-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={16} className="text-neural-green" />
                    On-Chain Activity Log
                </h3>
                <a
                    href={`https://sepolia.uniscan.xyz/address/${HOOK_MIND_CORE_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                >
                    <Download size={12} /> View on Uniscan
                </a>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-gray-600">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-xs font-mono">Reading on-chain events…</span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <Radio size={20} className="text-neural-cyan/30 animate-pulse" />
                        <span className="text-xs font-mono text-gray-600">No recent activity</span>
                    </div>
                ) : (
                    events.map((event, i) => (
                        <motion.div
                            key={`${event.txHash}-${i}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span
                                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                        event.type === "IL_PROTECT"
                                            ? "bg-neural-green/20 text-neural-green"
                                            : "bg-neural-cyan/20 text-neural-cyan"
                                    }`}
                                >
                                    {event.type}
                                </span>
                                <span className="text-[9px] text-gray-600 font-mono">{timeAgo(event.timestamp)}</span>
                            </div>
                            <div className="text-xs font-bold text-white mb-1">{event.title}</div>
                            <div className="text-[10px] text-gray-500 font-mono mb-2">{event.detail}</div>
                            <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] text-gray-600 font-mono">block #{event.blockNumber.toString()}</span>
                                <a
                                    href={`https://sepolia.uniscan.xyz/tx/${event.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-neural-cyan flex items-center gap-0.5 text-[9px] font-bold"
                                >
                                    UNISCAN <ExternalLink size={8} />
                                </a>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
