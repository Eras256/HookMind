'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { Navbar } from '@/components/nav/Navbar';
import {
    Trophy, Zap, Shield, Activity, Cpu, TrendingUp,
    Crown, Star, Calendar, ExternalLink, ChevronUp, ChevronDown,
    Medal, Target, Clock, DollarSign, Info
} from 'lucide-react';
import { LEADERBOARD_DATA, LeaderboardEntry } from './data';
import { useLanguage } from '@/context/LanguageContext';

export default function LeaderboardPage() {
    const { t } = useLanguage();
    const { address } = useAccount();

    // ═══════════════════════════════════════════
    // ESTADO
    // ═══════════════════════════════════════════
    const [sortBy, setSortBy] = useState<'signalsSent' | 'accuracy' | 'uptime' | 'totalRevenue'>('signalsSent');
    const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
    const [filtermodel, setFilterModel] = useState<string>(t.leaderboard.filter_all);
    const [highlightUser, setHighlightUser] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);

    // ═══════════════════════════════════════════
    // INYECTAR EL WALLET ACTUAL EN EL LEADERBOARD
    // ═══════════════════════════════════════════
    const enrichedData = useMemo(() => {
        let localStats = { signalsSent: 0, accuracy: 0, uptime: 0, poolsManaged: 0, totalRevenue: 0 };
        let nodeSettings = { provider: 'Unknown' };

        if (typeof window !== 'undefined') {
            try {
                localStats = JSON.parse(localStorage.getItem('hm-my-stats') || '{}');
                nodeSettings = JSON.parse(localStorage.getItem('hm-node-settings') || '{}');
            } catch (e) { }
        }

        const withUser = LEADERBOARD_DATA.map(entry => ({
            ...entry,
            isCurrentUser: address
                ? entry.address.toLowerCase() === address.toLowerCase()
                : false,
        }));

        const userAlreadyIn = withUser.some(e => e.isCurrentUser);

        if (!userAlreadyIn && address) {
            withUser.push({
                rank: withUser.length + 1,
                address: address,
                signalsSent: localStats.signalsSent || 0,
                accuracy: localStats.accuracy || 0,
                uptime: localStats.uptime || 0,
                poolsManaged: localStats.poolsManaged || 0,
                totalRevenue: localStats.totalRevenue || 0,
                badge: localStats.signalsSent > 0 ? t.leaderboard.new_node : t.leaderboard.unranked,
                badgeColor: 'text-gray-500 border-gray-500/30 bg-gray-500/10',
                joinedDaysAgo: 0,
                model: nodeSettings.provider || 'Unknown',
                isCurrentUser: true,
            });
        }

        return withUser;
    }, [address, t]);

    // ═══════════════════════════════════════════
    // SORT + FILTER
    // ═══════════════════════════════════════════
    const sortedFiltered = useMemo(() => {
        let data = [...enrichedData];

        if (filtermodel !== t.leaderboard.filter_all) {
            data = data.filter(e => e.model === filtermodel);
        }

        return data.sort((a, b) => {
            const diff = a[sortBy] - b[sortBy];
            return sortDir === 'desc' ? -diff : diff;
        });
    }, [enrichedData, sortBy, sortDir, filtermodel, t]);

    const toggleSort = (key: typeof sortBy) => {
        if (sortBy === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortBy(key); setSortDir('desc'); }
    };

    // ═══════════════════════════════════════════
    // SUMMARY STATS
    // ═══════════════════════════════════════════
    const totalSignals = enrichedData.reduce((s, e) => s + e.signalsSent, 0);
    const avgAccuracy = Math.round(enrichedData.reduce((s, e) => s + e.accuracy, 0) / enrichedData.length * 10) / 10;
    const totalRev = enrichedData.reduce((s, e) => s + e.totalRevenue, 0);
    const activeNodes = enrichedData.filter(e => e.uptime > 90).length;

    return (
        <main className="min-h-screen bg-void text-white">
            <Navbar />

            {/* BG Gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/3 w-[600px] h-[400px] 
                        bg-neural-magenta/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] 
                        bg-neural-cyan/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20">

                {/* ═══ HEADER ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy size={16} className="text-amber-400" />
                        <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                            {t.leaderboard.hero_badge}
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black mb-2">{t.leaderboard.hero_title}</h1>
                    <p className="text-white/40 max-w-xl">
                        {t.leaderboard.hero_desc}
                    </p>
                </motion.div>

                {/* ═══ GLOBAL STATS (4 KPIs) ═══ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: t.leaderboard.stat_total_signals, value: totalSignals.toLocaleString(), icon: Zap, color: 'text-neural-magenta' },
                        { label: t.leaderboard.stat_accuracy, value: `${avgAccuracy}%`, icon: Target, color: 'text-neural-cyan' },
                        { label: t.leaderboard.stat_revenue, value: `$${totalRev.toLocaleString()} USDC`, icon: DollarSign, color: 'text-neural-green' },
                        { label: t.leaderboard.stat_active_nodes, value: activeNodes.toString(), icon: Activity, color: 'text-purple-400' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <stat.icon size={14} className="text-white/30" />
                                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                                    {stat.label}
                                </span>
                            </div>
                            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* ═══ PODIUM TOP 3 ═══ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {/* 2do lugar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-slate-400/20 rounded-2xl p-6 
                       sm:mt-8 relative text-center hover:bg-white/8 transition-all"
                    >
                        <div className="text-4xl mb-2">🥈</div>
                        <div className="text-slate-300 font-bold text-sm">
                            {enrichedData[1]?.ens || `${enrichedData[1]?.address.slice(0, 6)}...${enrichedData[1]?.address.slice(-4)}`}
                        </div>
                        <div className="text-white/30 text-xs mt-1">
                            {enrichedData[1]?.signalsSent.toLocaleString()} {t.leaderboard.signals}
                        </div>
                        <div className="mt-2 text-xs border border-slate-400/20 bg-slate-400/10 
                            text-slate-300 rounded-full px-2 py-0.5 inline-block">
                            {enrichedData[1]?.accuracy}% {t.leaderboard.accuracy}
                        </div>
                    </motion.div>

                    {/* 1er lugar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-linear-to-b from-amber-500/20 to-white/5 
                        border border-amber-400/40 rounded-2xl p-6 
                        relative text-center hover:border-amber-400/60 transition-all"
                    >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Crown size={24} className="text-amber-400" />
                        </div>
                        <div className="text-5xl mb-2 mt-2">🥇</div>
                        <div className="text-amber-300 font-bold">
                            {enrichedData[0]?.ens || `${enrichedData[0]?.address.slice(0, 6)}...${enrichedData[0]?.address.slice(-4)}`}
                        </div>
                        <div className="text-white/50 text-xs mt-1">
                            {enrichedData[0]?.signalsSent.toLocaleString()} {t.leaderboard.signals}
                        </div>
                        <div className="mt-2 text-xs border border-amber-400/30 bg-amber-400/10 
                            text-amber-400 rounded-full px-2 py-0.5 inline-block">
                            {enrichedData[0]?.accuracy}% {t.leaderboard.accuracy}
                        </div>
                        <div className="mt-1 text-xs text-amber-300/60">
                            {enrichedData[0]?.poolsManaged} {t.leaderboard.pools_managed}
                        </div>
                    </motion.div>

                    {/* 3er lugar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/5 border border-orange-400/20 rounded-2xl p-6 
                       sm:mt-8 relative text-center hover:bg-white/8 transition-all"
                    >
                        <div className="text-4xl mb-2">🥉</div>
                        <div className="text-orange-300 font-bold text-sm">
                            {enrichedData[2]?.ens || `${enrichedData[2]?.address.slice(0, 6)}...${enrichedData[2]?.address.slice(-4)}`}
                        </div>
                        <div className="text-white/30 text-xs mt-1">
                            {enrichedData[2]?.signalsSent.toLocaleString()} {t.leaderboard.signals}
                        </div>
                        <div className="mt-2 text-xs border border-orange-400/20 bg-orange-400/10 
                            text-orange-300 rounded-full px-2 py-0.5 inline-block">
                            {enrichedData[2]?.accuracy}% {t.leaderboard.accuracy}
                        </div>
                    </motion.div>
                </div>

                {/* ═══ FILTROS Y SORT ═══ */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex gap-2 flex-wrap">
                        {[t.leaderboard.filter_all, 'Claude 4.6', 'GPT-4o', 'Grok 3', 'Gemini 2.0', 'Ollama (Local)'].map(model => (
                            <button
                                key={model}
                                onClick={() => setFilterModel(model)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filtermodel === model
                                    ? 'border-neural-magenta bg-neural-magenta/15 text-neural-magenta'
                                    : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20'
                                    }`}
                            >
                                {model}
                            </button>
                        ))}
                    </div>
                    {address && (
                        <button
                            onClick={() => setHighlightUser(h => !h)}
                            className={`ml-auto text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1 ${highlightUser
                                ? 'border-neural-cyan bg-neural-cyan/10 text-neural-cyan'
                                : 'border-white/10 text-white/30'
                                }`}
                        >
                            <Star size={12} />
                            {t.leaderboard.my_position}
                        </button>
                    )}
                </div>

                {/* ═══ TABLA PRINCIPAL ═══ */}
                <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden mb-12">

                    <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_repeat(5,auto)] gap-4 px-6 py-4 
                          border-b border-white/8 text-[10px] font-mono text-white/30 
                          uppercase tracking-wider">
                        <div>{t.leaderboard.rank}</div>
                        <div>{t.leaderboard.operator}</div>
                        <div className="hidden sm:block">{t.agents.signals}</div>
                        <div className="sm:hidden">{t.leaderboard.score}</div>
                        <div className="hidden sm:block">{t.agents.accuracy}</div>
                        <div className="hidden sm:block">{t.leaderboard.uptime}</div>
                        <div className="hidden sm:block">{t.leaderboard.revenue}</div>
                        <div className="hidden sm:block">{t.leaderboard.action}</div>
                    </div>

                    <AnimatePresence>
                        {sortedFiltered.map((entry, i) => {
                            const isMe = highlightUser && entry.isCurrentUser;
                            const isExpanded = expanded === entry.rank;
                            return (
                                <motion.div
                                    key={entry.address}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className={`border-b border-white/5 last:border-0 ${isMe ? 'bg-neural-magenta/5' : 'hover:bg-white/3'
                                        } transition-all`}
                                >
                                    <div
                                        className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_repeat(5,auto)] gap-4 px-4 sm:px-6 py-4 
                                items-center cursor-pointer"
                                        onClick={() => setExpanded(isExpanded ? null : entry.rank)}
                                    >
                                        <div className="w-8 text-center">
                                            {entry.rank <= 3 ? (
                                                <span className="text-xl">{['🥇', '🥈', '🥉'][entry.rank - 1]}</span>
                                            ) : (
                                                <span className={`text-sm font-mono font-bold ${entry.rank <= 5 ? 'text-neural-magenta' : 'text-white/30'
                                                    }`}>#{entry.rank}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center 
                                      shrink-0 border text-sm font-bold
                                      ${entry.rank === 1
                                                    ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                                                    : isMe
                                                        ? 'bg-neural-magenta/20 border-neural-magenta/40 text-neural-magenta'
                                                        : 'bg-white/10 border-white/10 text-white/60'
                                                }`}>
                                                {(entry.ens || entry.address).slice(0, 2).toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-mono text-sm truncate ${isMe ? 'text-neural-magenta font-bold' : 'text-white'
                                                        }`}>
                                                        {entry.ens || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                                                    </span>
                                                    {isMe && (
                                                        <span className="text-[9px] bg-neural-magenta/20 border border-neural-magenta/30 
                                             text-neural-magenta rounded-full px-2 py-0.5 shrink-0">
                                                            {t.leaderboard.you}
                                                        </span>
                                                    )}
                                                    {entry.joinedDaysAgo >= 30 && (
                                                        <span className="text-[9px] bg-purple-500/20 border border-purple-500/30 
                                             text-purple-300 rounded-full px-2 py-0.5 shrink-0">
                                                            🏆 {t.leaderboard.veteran}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[10px] border rounded-full px-2 py-0.5 ${entry.badgeColor}`}>
                                                        {entry.badge}
                                                    </span>
                                                    <span className="text-[10px] text-white/30">{entry.model}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right sm:hidden">
                                            <div className="font-bold text-sm text-neural-cyan truncate">
                                                {entry.signalsSent.toLocaleString()}
                                            </div>
                                            <div className="text-[9px] text-white/20">{t.leaderboard.signals}</div>
                                        </div>

                                        <div className="text-right hidden sm:block">
                                            <div className={`font-bold text-sm font-mono ${entry.rank === 1 ? 'text-amber-400' : 'text-white/80'
                                                }`}>{entry.signalsSent.toLocaleString()}</div>
                                            <div className="text-[9px] text-white/20">{t.leaderboard.signals}</div>
                                        </div>

                                        <div className="text-right hidden sm:block">
                                            <div className={`font-bold text-sm ${entry.accuracy >= 98 ? 'text-neural-green' :
                                                entry.accuracy >= 95 ? 'text-neural-cyan' :
                                                    entry.accuracy >= 90 ? 'text-amber-400' : 'text-neural-red'
                                                }`}>{entry.accuracy}%</div>
                                            <div className="text-[9px] text-white/20">{t.leaderboard.guardrails}</div>
                                        </div>

                                        <div className="text-right hidden sm:block">
                                            <div className={`font-bold text-sm ${entry.uptime >= 99 ? 'text-neural-green' :
                                                entry.uptime >= 95 ? 'text-neural-cyan' : 'text-amber-400'
                                                }`}>{entry.uptime}%</div>
                                            <div className="text-[9px] text-white/20">{t.leaderboard.uptime_30d}</div>
                                        </div>

                                        <div className="text-right hidden sm:block">
                                            <div className="font-bold text-sm text-neural-magenta">
                                                ${entry.totalRevenue.toLocaleString()}
                                            </div>
                                            <div className="text-[9px] text-white/20">USDC</div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    window.open(`https://unichain.tools/address/${entry.address}`, '_blank');
                                                }}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 
                                   hover:text-neural-cyan transition-all"
                                            >
                                                <ExternalLink size={14} />
                                            </button>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(entry.address);
                                                    toast.success(t.common.address_copied);
                                                }}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 
                                   hover:text-white transition-all hidden sm:block"
                                            >
                                                <Star size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Row */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden border-t border-white/5"
                                            >
                                                <div className="px-6 py-5 bg-black/20">
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                        <div className="bg-white/5 rounded-xl p-4">
                                                            <div className="text-[10px] text-white/30 uppercase mb-1">{t.leaderboard.pools_managed}</div>
                                                            <div className="text-xl font-bold text-neural-cyan">{entry.poolsManaged}</div>
                                                            <div className="text-[10px] text-white/20">{t.leaderboard.active_hooks}</div>
                                                        </div>
                                                        <div className="bg-white/5 rounded-xl p-4">
                                                            <div className="text-[10px] text-white/30 uppercase mb-1">{t.leaderboard.days_active}</div>
                                                            <div className="text-xl font-bold text-purple-400">{entry.joinedDaysAgo}d</div>
                                                            <div className="text-[10px] text-white/20">
                                                                {entry.joinedDaysAgo >= 30 ? `🏆 ${t.leaderboard.veteran}` :
                                                                    entry.joinedDaysAgo >= 7 ? '⚡ Established' : `🌱 ${t.leaderboard.new_node.split(' ')[1]}`}
                                                            </div>
                                                        </div>
                                                        <div className="bg-white/5 rounded-xl p-4">
                                                            <div className="text-[10px] text-white/30 uppercase mb-1">{t.leaderboard.signals_day}</div>
                                                            <div className="text-xl font-bold text-amber-400">
                                                                {entry.joinedDaysAgo > 0
                                                                    ? Math.round(entry.signalsSent / entry.joinedDaysAgo).toLocaleString()
                                                                    : entry.signalsSent}
                                                            </div>
                                                            <div className="text-[10px] text-white/20">{t.leaderboard.daily_cadence}</div>
                                                        </div>
                                                        <div className="bg-white/5 rounded-xl p-4">
                                                            <div className="text-[10px] text-white/30 uppercase mb-1">{t.leaderboard.revenue_signal}</div>
                                                            <div className="text-xl font-bold text-neural-green">
                                                                ${entry.signalsSent > 0
                                                                    ? (entry.totalRevenue / entry.signalsSent).toFixed(3)
                                                                    : '0.000'} USDC
                                                            </div>
                                                            <div className="text-[10px] text-white/20">{t.leaderboard.efficiency_ratio}</div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-[10px] text-white/30 uppercase">{t.leaderboard.accuracy}</span>
                                                                <span className="text-[10px] text-neural-green font-mono">{entry.accuracy}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${entry.accuracy}%` }}
                                                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                                                    className="h-full bg-linear-to-r from-neural-green to-neural-cyan rounded-full"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-[10px] text-white/30 uppercase">{t.leaderboard.uptime}</span>
                                                                <span className="text-[10px] text-neural-magenta font-mono">{entry.uptime}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${entry.uptime}%` }}
                                                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                                                                    className="h-full bg-linear-to-r from-neural-magenta to-purple-500 rounded-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isMe && (
                                                        <div className="mt-4 p-3 bg-neural-magenta/5 border border-neural-magenta/20 
                                             rounded-xl flex items-start gap-2 text-xs text-neural-magenta/80">
                                                            <Info size={14} className="shrink-0 mt-0.5" />
                                                            {t.leaderboard.stats_update_info}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* ═══ "YOUR POSITION" STICKY BOTTOM BAR ═══ */}
                {address && !enrichedData.slice(0, 5).some(e =>
                    e.address.toLowerCase() === address.toLowerCase()
                ) && (
                        <motion.div
                            initial={{ y: 80, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40
                       bg-void/90 border border-neural-magenta/30 
                       backdrop-blur-xl rounded-2xl px-6 py-3 
                       flex items-center gap-6 shadow-2xl shadow-black/50
                       max-w-lg w-full mx-4"
                        >
                            <div className="text-[10px] text-white/30 uppercase tracking-wider shrink-0">
                                {t.leaderboard.my_position}
                            </div>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-neural-magenta/20 border border-neural-magenta/40 
                              flex items-center justify-center text-xs text-neural-magenta font-bold shrink-0">
                                    #{enrichedData.find(e => e.isCurrentUser)?.rank || '—'}
                                </div>
                                <span className="font-mono text-sm text-white truncate">
                                    {`${address.slice(0, 6)}...${address.slice(-4)}`}
                                </span>
                                <span className="text-xs text-white/30 shrink-0">{t.leaderboard.climb_info}</span>
                            </div>
                            <button
                                onClick={() => toast.info(t.leaderboard.run_daemon_info)}
                                className="text-xs text-neural-magenta hover:underline shrink-0"
                            >
                                {t.leaderboard.how_to_climb}
                            </button>
                        </motion.div>
                    )}
            </div>
        </main>
    );
}
