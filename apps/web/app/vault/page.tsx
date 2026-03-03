"use client";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Clock, DollarSign } from "lucide-react";
export default function VaultPage() {
    return (
        <div className="pt-24 px-6 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-black mb-2">
                    Yield <span className="text-[#06B6D4]">Vault</span> & IL Insurance
                </h1>
                <p className="text-gray-400">
                    Swap fees are smoothed over 7-day epochs via ERC-4626.
                    Optional USDC premium enrolls your LP position in the IL insurance pool.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vault Stats */}
                <div className="glass-card p-6">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#06B6D4]" />
                        ERC-4626 Yield Vault
                    </h2>
                    <div className="space-y-4">
                        {[
                            { label: "Current Epoch", value: "Loading...", icon: Clock },
                            { label: "Fees Accrued", value: "Loading...", icon: DollarSign },
                            { label: "Drip Rate / sec", value: "Loading...", icon: TrendingUp },
                            { label: "Total Depositors", value: "Loading...", icon: Shield },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Icon className="w-4 h-4 text-[#06B6D4]" />
                                    {label}
                                </span>
                                <span className="font-mono font-bold text-white">{value}</span>
                            </div>
                        ))}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="mt-6 w-full py-3 rounded-xl border border-[#06B6D4] text-[#06B6D4] font-semibold hover:bg-[rgba(6,182,212,0.1)] transition-all"
                    >
                        Deposit to Vault
                    </motion.button>
                </div>
                {/* IL Insurance */}
                <div className="glass-card p-6">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[#06B6D4]" />
                        IL Insurance Pool
                    </h2>
                    <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Pay a <strong>10 USDC premium</strong> to enroll your LP position.
                            If your impermanent loss exceeds <strong>2%</strong> on exit,
                            the protocol auto-compensates up to <strong>500 USDC</strong> per position.
                            Circle CCTP v2 keeps the pool liquid cross-chain.
                        </p>
                    </div>
                    <div className="space-y-3 mb-6">
                        {[
                            { label: "Pool Balance (USDC)", value: "Loading..." },
                            { label: "Active Enrollments", value: "Loading..." },
                            { label: "IL Threshold", value: "2.00%" },
                            { label: "Max Payout / LP", value: "500 USDC" },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between text-sm">
                                <span className="text-gray-400">{label}</span>
                                <span className="font-mono text-white">{value}</span>
                            </div>
                        ))}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(6,182,212,0.25)" }}
                        className="w-full py-3 rounded-xl font-bold text-black"
                        style={{ background: "linear-gradient(135deg, #06B6D4, #0052FF)" }}
                    >
                        Pay Premium & Enroll (10 USDC)
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
