"use client";
import { useState, useCallback } from "react";
import {
    ReactFlow, MiniMap, Controls, Background, useNodesState,
    useEdgesState, addEdge, Connection, Edge, Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Save, Copy, ChevronRight, Brain, Zap, Activity, PlusCircle, MinusCircle, Clock, TrendingUp, Shield, Radio, Search, Cpu, Lock, Sliders, Database, PauseCircle, Pin, MessageSquare, KeyRound } from "lucide-react";

const HOOK_NODE_TEMPLATES = [
    {
        category: "HOOK TRIGGERS", gradient: "from-cyan-500 to-blue-600", accentColor: "#00F2FE",
        items: [
            { type: "trigger", label: "BEFORE_SWAP", icon: Zap, desc: "Fires before every Unichain swap" },
            { type: "trigger", label: "AFTER_SWAP", icon: Activity, desc: "Fires after swap completes" },
            { type: "trigger", label: "LIQUIDITY_ADD", icon: PlusCircle, desc: "On LP position creation" },
            { type: "trigger", label: "LIQUIDITY_REMOVE", icon: MinusCircle, desc: "On LP withdrawal" },
            { type: "trigger", label: "BLOCK_TICK", icon: Clock, desc: "Every ~1s Unichain block" },
        ],
    },
    {
        category: "SENSORS & ORACLES", gradient: "from-purple-500 to-indigo-600", accentColor: "#A78BFA",
        items: [
            { type: "sensor", label: "VOLATILITY_SCORE", icon: TrendingUp, desc: "Computes 0-10000 vol score" },
            { type: "sensor", label: "IL_EXPOSURE", icon: Shield, desc: "Calculates √(P1/P0) IL risk" },
            { type: "sensor", label: "PYTH_PRICE_FEED", icon: Radio, desc: "Sub-second price data" },
            { type: "sensor", label: "MEMPOOL_SCAN", icon: Search, desc: "Pending tx analysis" },
        ],
    },
    {
        category: "AI BRAIN", gradient: "from-[#FC72FF] to-purple-600", accentColor: "#FC72FF",
        items: [
            { type: "ai", label: "CLAUDE_4.6", icon: Cpu, desc: "Best for complex reasoning" },
            { type: "ai", label: "GPT_4O", icon: Cpu, desc: "Fast inference" },
            { type: "ai", label: "LOCAL_DEEPSEEK", icon: Lock, desc: "Private, air-gapped" },
        ],
    },
    {
        category: "HOOK ACTIONS", gradient: "from-emerald-500 to-green-600", accentColor: "#00FFA3",
        items: [
            { type: "action", label: "SET_DYNAMIC_FEE", icon: Sliders, desc: "Calls submitAgentSignal() on-chain" },
            { type: "action", label: "TRIGGER_IL_INSURANCE", icon: Shield, desc: "Pays CCTP premium for LP" },
            { type: "action", label: "INJECT_VAULT_FEES", icon: Database, desc: "Routes fees to YieldVault" },
            { type: "action", label: "PAUSE_POOL", icon: PauseCircle, desc: "Emergency pool suspension" },
        ],
    },
    {
        category: "AUDIT & ALERTS", gradient: "from-orange-500 to-red-500", accentColor: "#FB923C",
        items: [
            { type: "audit", label: "IPFS_PIN", icon: Pin, desc: "Saves decision to Pinata IPFS" },
            { type: "audit", label: "TELEGRAM_NOTIFY", icon: MessageSquare, desc: "Sends Telegram alert" },
            { type: "audit", label: "ECDSA_SIGN", icon: KeyRound, desc: "Signs tx with agent EOA" },
        ],
    },
];

const NODE_STYLE: Record<string, { bg: string; border: string; glow: string }> = {
    trigger: { bg: "rgba(0,242,254,0.08)", border: "rgba(0,242,254,0.5)", glow: "0 0 20px rgba(0,242,254,0.2)" },
    sensor: { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.5)", glow: "0 0 20px rgba(167,139,250,0.2)" },
    ai: { bg: "rgba(252,114,255,0.08)", border: "rgba(252,114,255,0.5)", glow: "0 0 20px rgba(252,114,255,0.2)" },
    action: { bg: "rgba(0,255,163,0.08)", border: "rgba(0,255,163,0.5)", glow: "0 0 20px rgba(0,255,163,0.2)" },
    audit: { bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.5)", glow: "0 0 20px rgba(251,146,60,0.2)" },
};

const mkStyle = (type: string) => {
    const c = NODE_STYLE[type] ?? NODE_STYLE.action;
    return { background: c.bg, color: "#fff", border: `1px solid ${c.border}`, borderRadius: "12px", boxShadow: c.glow, padding: "10px 16px", fontSize: "12px", fontFamily: "JetBrains Mono, monospace", minWidth: 190 };
};

const INITIAL_NODES = [
    { id: "1", type: "default", data: { label: "⚡  BEFORE_SWAP" }, position: { x: 80, y: 80 }, style: mkStyle("trigger") },
    { id: "2", type: "default", data: { label: "📊  VOLATILITY_SCORE" }, position: { x: 80, y: 210 }, style: mkStyle("sensor") },
    { id: "3", type: "default", data: { label: "🧠  CLAUDE_4.6" }, position: { x: 380, y: 145 }, style: mkStyle("ai") },
    { id: "4", type: "default", data: { label: "🎯  SET_DYNAMIC_FEE" }, position: { x: 680, y: 80 }, style: mkStyle("action") },
    { id: "5", type: "default", data: { label: "🛡  TRIGGER_IL_INSURANCE" }, position: { x: 680, y: 210 }, style: mkStyle("action") },
    { id: "6", type: "default", data: { label: "📌  IPFS_PIN" }, position: { x: 680, y: 340 }, style: mkStyle("audit") },
] as const;

const INITIAL_EDGES = [
    { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#00F2FE", strokeWidth: 2 } },
    { id: "e2-3", source: "2", target: "3", animated: true, style: { stroke: "#A78BFA", strokeWidth: 2 } },
    { id: "e3-4", source: "3", target: "4", animated: true, style: { stroke: "#FC72FF", strokeWidth: 2 } },
    { id: "e3-5", source: "3", target: "5", animated: true, style: { stroke: "#FC72FF", strokeWidth: 2 } },
    { id: "e4-6", source: "4", target: "6", animated: true, style: { stroke: "#FB923C", strokeWidth: 2 } },
] as Edge[];

export default function BuilderPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES as any);
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
    const [stratName, setStratName] = useState("My Custom Hook Strategy");

    const onConnect = useCallback(
        (params: Connection | Edge) =>
            setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#FC72FF", strokeWidth: 2 } } as Edge, eds)),
        [setEdges]
    );

    const addNode = (item: { label: string; type: string }) => {
        const id = `n-${Date.now()}`;
        setNodes((prev) => [
            ...prev,
            { id, type: "default", data: { label: item.label }, position: { x: 200 + Math.random() * 300, y: 150 + Math.random() * 200 }, style: mkStyle(item.type) },
        ]);
    };

    const exportJSON = () => {
        const triggers = nodes.filter((n) => (mkStyle((n as any).nodeType ?? "trigger") && (n.data as any).label?.includes("BEFORE") || (n.data as any).label?.includes("TICK") || (n.data as any).label?.includes("AFTER") || (n.data as any).label?.includes("LIQUIDITY"))).map((n) => (n.data as any).label);
        const config = {
            version: "1.0",
            strategy_name: stratName,
            network: "unichain",
            nodes: nodes.map((n) => ({ id: n.id, label: (n.data as any).label })),
            edges: edges.map((e) => ({ from: e.source, to: e.target })),
            guardrails: { min_fee: 500, max_fee: 10000 },
            exported_at: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hookmind-strategy-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Strategy exported! Drop the JSON into your agent config.");
    };

    const deployStrategy = () => {
        toast.loading("Deploying strategy to Agent Daemon on Unichain...", { id: "deploy-builder" });
        setTimeout(() => toast.success("Strategy active! Agent is live on Unichain.", { id: "deploy-builder" }), 2200);
    };

    return (
        <div className="pt-20 px-5 pb-0 max-w-screen-2xl mx-auto flex flex-col" style={{ height: "calc(100vh)" }}>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center py-4 gap-3 shrink-0">
                <div className="flex items-center gap-3">
                    <Brain size={26} className="text-neural-magenta" style={{ filter: "drop-shadow(0 0 8px rgba(252,114,255,0.8))" }} />
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter">
                            Visual Hook{" "}
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#FC72FF,#00F2FE)" }}>
                                Builder
                            </span>
                        </h1>
                        <input
                            value={stratName}
                            onChange={(e) => setStratName(e.target.value)}
                            className="text-xs text-gray-500 bg-transparent border-none outline-none font-mono w-72"
                            placeholder="Strategy name..."
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={exportJSON} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
                        <Copy size={14} /> Export JSON
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={deployStrategy} className="btn-primary flex items-center gap-2 px-5 py-2 text-sm">
                        <Save size={14} /> Deploy Strategy
                    </motion.button>
                </div>
            </div>

            {/* Canvas + Sidebar */}
            <div className="flex flex-1 gap-4 overflow-hidden pb-4">
                {/* Sidebar */}
                <div className="w-56 shrink-0 overflow-y-auto space-y-4 pr-1">
                    {HOOK_NODE_TEMPLATES.map((g) => (
                        <div key={g.category}>
                            <div className="text-[10px] uppercase tracking-widest mb-2 font-mono font-bold" style={{ color: g.accentColor }}>
                                {g.category}
                            </div>
                            <div className="space-y-1">
                                {g.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <motion.button
                                            key={item.label}
                                            whileHover={{ scale: 1.02, x: 3 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => addNode(item)}
                                            className="w-full text-left p-2 rounded-xl text-[11px] font-mono transition-all flex items-center gap-2"
                                            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${g.accentColor}22`, color: "#ccc" }}
                                        >
                                            <Icon size={12} style={{ color: g.accentColor, flexShrink: 0 }} />
                                            <span className="truncate">{item.label}</span>
                                            <ChevronRight size={10} className="ml-auto opacity-30 shrink-0" />
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ReactFlow Canvas */}
                <div className="flex-1 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(252,114,255,0.15)", background: "rgba(8,8,18,0.9)" }}>
                    <ReactFlow
                        nodes={nodes} edges={edges}
                        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                        onConnect={onConnect} fitView
                    >
                        <Background color="rgba(252,114,255,0.2)" gap={24} size={1} />
                        <Controls style={{ background: "rgba(10,10,20,0.9)", border: "1px solid rgba(252,114,255,0.2)", borderRadius: 10 }} />
                        <MiniMap nodeColor="#FC72FF" maskColor="rgba(8,8,18,0.85)" style={{ background: "rgba(8,8,18,0.9)", border: "1px solid rgba(0,242,254,0.15)", borderRadius: 10 }} />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}
