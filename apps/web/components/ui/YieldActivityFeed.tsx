"use client";
import { Clock, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const MOCK_EVENTS = [
    { type: "EPOCH", title: "Epoch 42 Started", detail: "smoothing 1,420 USDC across 7 days", time: "2h ago", hash: "0x123..." },
    { type: "DEPOSIT", title: "Fee Deposit Verified", detail: "242.50 USDC from WETH/USDC Hook", time: "5h ago", hash: "0x456..." },
    { type: "REGISTRY", title: "New Operator Registered", detail: "Node 8,248 activated on Unichain", time: "8h ago", hash: "0x789..." },
    { type: "EPOCH", title: "Epoch 41 Completed", detail: "Total Yield: 8,420 USDC distributed", time: "1d ago", hash: "0xabc..." },
];

export default function YieldActivityFeed() {
    return (
        <div className="glass-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={16} className="text-neural-green" />
                    Treasury Audit Log
                </h3>
                <button className="text-[10px] font-mono text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                    <Download size={12} /> Export CSV
                </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {MOCK_EVENTS.map((event, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                event.type === 'EPOCH' ? 'bg-neural-magenta/20 text-neural-magenta' : 
                                event.type === 'DEPOSIT' ? 'bg-neural-green/20 text-neural-green' : 
                                'bg-neural-cyan/20 text-neural-cyan'
                            }`}>
                                {event.type}
                            </span>
                            <span className="text-[9px] text-gray-600 font-mono">{event.time}</span>
                        </div>
                        <div className="text-xs font-bold text-white mb-1">{event.title}</div>
                        <div className="text-[10px] text-gray-500 font-mono mb-2">{event.detail}</div>
                        <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] text-gray-600 font-mono">{event.hash}</span>
                            <a href="#" className="text-neural-cyan flex items-center gap-0.5 text-[9px] font-bold">
                                BLOCKSCOUT <ExternalLink size={8} />
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
