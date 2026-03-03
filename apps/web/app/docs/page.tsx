"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, ExternalLink } from "lucide-react";
export default function DocsPage() {
    const [cid, setCid] = useState("");
    return (
        <div className="pt-24 px-6 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-black mb-2">
                    Audit <span className="text-[#06B6D4]">Logs</span>
                </h1>
                <p className="text-gray-400">
                    Every AI agent decision is HMAC-SHA256 signed and pinned to IPFS via Pinata.
                    This creates an immutable, decentralized audit trail of every hook parameter
                    change — verifiable by anyone.
                </p>
            </div>
            {/* CID Lookup */}
            <div className="glass-card p-6 mb-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#06B6D4]" />
                    Lookup Audit Log by IPFS CID
                </h2>
                <div className="flex gap-3">
                    <input
                        value={cid}
                        onChange={(e) => setCid(e.target.value)}
                        placeholder="ipfs://QmXxx..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-[#06B6D4] focus:outline-none transition-colors"
                    />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 rounded-lg font-semibold"
                        style={{ background: "linear-gradient(135deg, #06B6D4, #0052FF)", color: "#000" }}
                    >
                        Fetch
                    </motion.button>
                </div>
            </div>
            {/* Protocol Docs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { title: "HookMindCore.sol", desc: "The central Uniswap v4 hook. Accepts AI signals, applies dynamic fees.", link: "#" },
                    { title: "AgentRegistry", desc: "RBAC contract managing trusted AI operator EOA addresses.", link: "#" },
                    { title: "YieldVault", desc: "ERC-4626 vault distributing swap fees over 7-day epochs.", link: "#" },
                    { title: "ILInsurance", desc: "USDC insurance pool compensating LPs for impermanent loss.", link: "#" },
                    { title: "MCP Server", desc: "8 tools exposing HookMind state to external AI systems.", link: "#" },
                    { title: "Agent Daemon", desc: "Node.js autonomous loop — the AI that controls the hook.", link: "#" },
                ].map(({ title, desc, link }) => (
                    <motion.a
                        key={title}
                        href={link}
                        className="glass-card p-5 block group"
                        whileHover={{ y: -4 }}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-sm font-mono text-[#06B6D4]">{title}</h3>
                            <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-[#06B6D4] transition-colors" />
                        </div>
                        <p className="text-gray-400 text-sm">{desc}</p>
                    </motion.a>
                ))}
            </div>
        </div>
    );
}
