'use client';
import { useState, useCallback, useRef, useMemo } from "react";
import {
    ReactFlow, MiniMap, Controls, Background, useNodesState,
    useEdgesState, addEdge, Connection, Edge, Panel, useReactFlow, ReactFlowProvider
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Save, Copy, ChevronRight, Brain, Zap, Activity, PlusCircle, MinusCircle, Clock, TrendingUp, Shield, Radio, Search, Cpu, Lock, Sliders, Database, PauseCircle, Pin, MessageSquare, KeyRound, X } from "lucide-react";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { generatePrivateKey, privateKeyToAddress } from "viem/accounts";
import { useRouter } from "next/navigation";
import { parseUnits } from "viem";
import { AGENT_REGISTRY_ADDRESS, AGENT_REGISTRY_ABI } from "@/lib/constants";
import { useLanguage } from "@/context/LanguageContext";

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
    return (
        <ReactFlowProvider>
            <BuilderContent />
        </ReactFlowProvider>
    );
}

function BuilderContent() {
    const { t } = useLanguage();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES as any);
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
    const [stratName, setStratName] = useState(t.builder.default_strat_name);
    const [isDeploying, setIsDeploying] = useState(false);
    const { address } = useAccount();
    const router = useRouter();

    const hookNodeTemplates = useMemo(() => [
        {
            category: t.builder.categories.triggers, gradient: "from-cyan-500 to-blue-600", accentColor: "#00F2FE",
            items: [
                { type: "trigger", label: "BEFORE_SWAP", icon: Zap, desc: t.builder.descriptions.before_swap },
                { type: "trigger", label: "AFTER_SWAP", icon: Activity, desc: t.builder.descriptions.after_swap },
                { type: "trigger", label: "LIQUIDITY_ADD", icon: PlusCircle, desc: t.builder.descriptions.liquidity_add },
                { type: "trigger", label: "LIQUIDITY_REMOVE", icon: MinusCircle, desc: t.builder.descriptions.liquidity_remove },
                { type: "trigger", label: "BLOCK_TICK", icon: Clock, desc: t.builder.descriptions.block_tick },
            ],
        },
        {
            category: t.builder.categories.sensors, gradient: "from-purple-500 to-indigo-600", accentColor: "#A78BFA",
            items: [
                { type: "sensor", label: "VOLATILITY_SCORE", icon: TrendingUp, desc: t.builder.descriptions.volatility_score },
                { type: "sensor", label: "IL_EXPOSURE", icon: Shield, desc: t.builder.descriptions.il_exposure },
                { type: "sensor", label: "PYTH_PRICE_FEED", icon: Radio, desc: t.builder.descriptions.pyth_price },
                { type: "sensor", label: "MEMPOOL_SCAN", icon: Search, desc: t.builder.descriptions.mempool_scan },
            ],
        },
        {
            category: t.builder.categories.ai, gradient: "from-[#FC72FF] to-purple-600", accentColor: "#FC72FF",
            items: [
                { type: "ai", label: "CLAUDE_4.6", icon: Cpu, desc: t.builder.descriptions.claude },
                { type: "ai", label: "GPT_4O", icon: Cpu, desc: t.builder.descriptions.gpt },
                { type: "ai", label: "LOCAL_DEEPSEEK", icon: Lock, desc: t.builder.descriptions.local_ai },
            ],
        },
        {
            category: t.builder.categories.actions, gradient: "from-emerald-500 to-green-600", accentColor: "#00FFA3",
            items: [
                { type: "action", label: "SET_DYNAMIC_FEE", icon: Sliders, desc: t.builder.descriptions.set_fee },
                { type: "action", label: "TRIGGER_IL_INSURANCE", icon: Shield, desc: t.builder.descriptions.trigger_il },
                { type: "action", label: "INJECT_VAULT_FEES", icon: Database, desc: t.builder.descriptions.inject_vault },
                { type: "action", label: "PAUSE_POOL", icon: PauseCircle, desc: t.builder.descriptions.pause_pool },
            ],
        },
        {
            category: t.builder.categories.audit, gradient: "from-orange-500 to-red-500", accentColor: "#FB923C",
            items: [
                { type: "audit", label: "IPFS_PIN", icon: Pin, desc: t.builder.descriptions.ipfs_pin },
                { type: "audit", label: "TELEGRAM_NOTIFY", icon: MessageSquare, desc: t.builder.descriptions.tg_notify },
                { type: "audit", label: "ECDSA_SIGN", icon: KeyRound, desc: t.builder.descriptions.ecdsa_sign },
            ],
        },
    ], [t]);

    const { data: activationFeeNative } = useReadContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: AGENT_REGISTRY_ABI as any,
        functionName: "activationFeeNative",
    });

    const { writeContractAsync } = useWriteContract();

    const onConnect = useCallback(
        (params: Connection | Edge) =>
            setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#FC72FF", strokeWidth: 2 } } as Edge, eds)),
        [setEdges]
    );

    const addNode = useCallback((item: { label: string; type: string }, position?: { x: number; y: number }) => {
        const id = `n-${Date.now()}`;
        
        setNodes((nds) => {
            const lastNode = nds.length > 0 ? nds[nds.length - 1] : null;
            const x = position ? position.x : (lastNode ? lastNode.position.x : 200 + Math.random() * 100);
            const y = position ? position.y : (lastNode ? lastNode.position.y + 130 : 150 + Math.random() * 100);

            const newNode = {
                id,
                type: "default",
                data: { label: item.label },
                position: { x, y },
                style: mkStyle(item.type)
            };

            if (lastNode) {
                const strokeColor = NODE_STYLE[item.type]?.border || "#FC72FF";
                setEdges((eds) => addEdge({
                    id: `e${lastNode.id}-${id}`,
                    source: lastNode.id,
                    target: id,
                    animated: true,
                    style: { stroke: strokeColor.replace(/rgba\((.*?),\s*[\d.]+\)/, "rgb($1)"), strokeWidth: 2 }
                } as Edge, eds));
            }

            return [...nds, newNode];
        });
    }, [setNodes, setEdges]);

    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const dataStr = event.dataTransfer.getData('application/reactflow');
            if (!dataStr) return;

            const data = JSON.parse(dataStr);
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            addNode(data, position);
        },
        [screenToFlowPosition, addNode]
    );

    const exportJSON = () => {
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
        toast.success(t.builder.export_success);
    };

    const deployStrategy = async () => {
        if (!address) {
            toast.error("Connect your wallet first");
            return;
        }
        const fee = activationFeeNative ? (activationFeeNative as bigint) : parseUnits("0.0015", 18);
        // Generate a fresh operator address for this agent deployment
        const operatorAddress = privateKeyToAddress(generatePrivateKey());
        setIsDeploying(true);
        toast.loading(t.builder.deploying_toast, { id: "deploy-builder" });

        try {
            const tx = await writeContractAsync({
                address: AGENT_REGISTRY_ADDRESS,
                abi: AGENT_REGISTRY_ABI as any,
                functionName: "registerAgent",
                args: [operatorAddress, stratName || t.builder.default_strat_name, BigInt(0)],
                value: fee,
            });

            // Save agent to dashboard fleet in localStorage
            if (address) {
                const localKey = `hm-fleet-${address}`;
                const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
                const newAgent = {
                    id: `agent-${Date.now()}`,
                    poolPair: "USDC/WETH",
                    poolId: "0x3faf657fade7f4f22456018f3529e083bd153065269e41cbd75d6dd9cbd48ca5",
                    strategy: stratName || t.builder.default_strat_name,
                    status: "RUNNING",
                    currentFee: 3000,
                    volScore: 3000,
                    uptime: "0m",
                    agentEOA: operatorAddress,
                    lastSignalCid: "—",
                    createdAt: Date.now(),
                };
                localStorage.setItem(localKey, JSON.stringify([newAgent, ...existing]));
            }

            toast.success(`"${stratName}" deployed! Redirecting to dashboard…`, { id: "deploy-builder" });
            await new Promise(r => setTimeout(r, 1200));
            router.push("/dashboard");

        } catch (e: any) {
            toast.error(e.shortMessage || e.message || t.builder.deployment_failed, { id: "deploy-builder" });
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="pt-20 px-5 pb-0 max-w-screen-2xl mx-auto flex flex-col" style={{ height: "calc(100vh)" }}>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center py-4 gap-3 shrink-0">
                <div className="flex items-center gap-3">
                    <Brain size={26} className="text-neural-magenta" style={{ filter: "drop-shadow(0 0 8px rgba(252,114,255,0.8))" }} />
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter">
                            {t.builder.title}{" "}
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#FC72FF,#00F2FE)" }}>
                                {t.builder.subtitle}
                            </span>
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Agent name:</span>
                            <input
                                value={stratName}
                                onChange={(e) => setStratName(e.target.value)}
                                className="text-xs text-neural-cyan bg-neural-cyan/5 border border-neural-cyan/20 rounded-lg px-2 py-1 outline-none font-mono w-52 focus:border-neural-cyan/60 transition-colors placeholder:text-gray-600"
                                placeholder={t.builder.strat_name_placeholder}
                                maxLength={32}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setNodes(INITIAL_NODES as any); setEdges(INITIAL_EDGES); toast.info(t.builder.canvas_reset); }} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm text-red-500/70 border-red-500/20">
                        <X size={14} /> {t.builder.reset}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={exportJSON} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
                        <Copy size={14} /> {t.builder.export_json}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={deployStrategy} className="btn-primary flex items-center gap-2 px-5 py-2 text-sm">
                        <Save size={14} /> {t.builder.deploy_strategy}
                    </motion.button>
                </div>
            </div>

            {/* Canvas + Sidebar */}
            <div className="flex flex-1 gap-4 overflow-hidden pb-4">
                {/* Sidebar */}
                <div className="w-56 shrink-0 overflow-y-auto space-y-4 pr-1">
                    {hookNodeTemplates.map((g) => (
                        <div key={g.category}>
                            <div className="text-[10px] uppercase tracking-widest mb-2 font-mono font-bold" style={{ color: g.accentColor }}>
                                {g.category}
                            </div>
                            <div className="space-y-1">
                                {g.items.map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <motion.button
                                            key={`${g.category}-${item.label}-${idx}`}
                                            whileHover={{ scale: 1.02, x: 3 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => addNode(item)}
                                            className="w-full text-left p-2 rounded-xl text-[11px] font-mono transition-all flex items-center gap-2 cursor-grab active:cursor-grabbing"
                                            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${g.accentColor}22`, color: "#ccc" }}
                                            onDragStart={(e) => onDragStart(e as any, item.type, item.label)}
                                            draggable
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
                <div ref={reactFlowWrapper} className="flex-1 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(252,114,255,0.15)", background: "rgba(8,8,18,0.9)" }}>
                    <ReactFlow
                        nodes={nodes} edges={edges}
                        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        fitView
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
