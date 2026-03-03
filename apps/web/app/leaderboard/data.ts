export interface LeaderboardEntry {
    rank: number;
    address: string;         // full 0x... (mostrar truncado)
    ens?: string;            // nombre ENS si existe
    signalsSent: number;     // nonces quemados on-chain
    accuracy: number;        // % guardrails pasados (0-100)
    uptime: number;          // % uptime últimos 30 días (0-100)
    poolsManaged: number;    // Cuántos pools gestiona activamente
    totalRevenue: number;    // USDC ganados por el operador (aprox)
    badge: string;           // Emoji + título
    badgeColor: string;      // clase CSS del color del badge
    joinedDaysAgo: number;   // Días desde que se registró el nodo
    model: string;           // Claude, GPT-4o, Grok3, Gemini, Ollama
    isCurrentUser?: boolean; // Resaltar si es la wallet conectada
}

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
    {
        rank: 1,
        address: '0xA3b4F21c9e8d7c2a5b6f0e1d4c3a2b1f0e9d8c7b',
        ens: 'hookmaster.eth',
        signalsSent: 18420,
        accuracy: 99.1,
        uptime: 99.9,
        poolsManaged: 5,
        totalRevenue: 4210,
        badge: '🥇 Grand Master',
        badgeColor: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
        joinedDaysAgo: 42,
        model: 'Claude 4.6',
    },
    {
        rank: 2,
        address: '0xE7c2F09aB3d8e4f1c6a5b7d2e0c9f8a3b1d4e5f6',
        signalsSent: 12847,
        accuracy: 98.4,
        uptime: 99.1,
        poolsManaged: 4,
        totalRevenue: 2980,
        badge: '🥈 Senior Operator',
        badgeColor: 'text-slate-300 border-slate-300/30 bg-slate-300/10',
        joinedDaysAgo: 38,
        model: 'GPT-4o',
    },
    {
        rank: 3,
        address: '0x8f1D4Cc3A9b2E7f0D5c1e4b8a3f2d0e9c7b5a4d3',
        signalsSent: 9203,
        accuracy: 97.8,
        uptime: 98.7,
        poolsManaged: 3,
        totalRevenue: 1870,
        badge: '🥉 Proven Node',
        badgeColor: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
        joinedDaysAgo: 29,
        model: 'Grok 3',
    },
    {
        rank: 4,
        address: '0x92AaB17e3c6F1d8e2b9a0c4f5e3d7c2b1a9e8f0d',
        signalsSent: 5612,
        accuracy: 96.2,
        uptime: 98.1,
        poolsManaged: 2,
        totalRevenue: 1120,
        badge: '⚡ Active Operator',
        badgeColor: 'text-neural-magenta border-neural-magenta/30 bg-neural-magenta/10',
        joinedDaysAgo: 21,
        model: 'Gemini 2.0',
    },
    {
        rank: 5,
        address: '0x3Dc1A8f2B4e9c7d0f5a3b2c1e8d4f0a9b7c6e5d4',
        signalsSent: 3891,
        accuracy: 95.0,
        uptime: 97.4,
        poolsManaged: 2,
        totalRevenue: 780,
        badge: '🔵 Veteran Node',
        badgeColor: 'text-neural-cyan border-neural-cyan/30 bg-neural-cyan/10',
        joinedDaysAgo: 16,
        model: 'Claude 4.6',
    },
    {
        rank: 6,
        address: '0x1Ab2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0',
        signalsSent: 2104,
        accuracy: 93.7,
        uptime: 96.3,
        poolsManaged: 1,
        totalRevenue: 421,
        badge: '🟢 Junior Operator',
        badgeColor: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
        joinedDaysAgo: 8,
        model: 'GPT-4o',
    },
    {
        rank: 7,
        address: '0xF9e8D7c6B5a4F3e2D1c0B9a8F7e6D5c4B3a2F1e0',
        signalsSent: 987,
        accuracy: 91.2,
        uptime: 95.0,
        poolsManaged: 1,
        totalRevenue: 198,
        badge: '🔰 Rookie Node',
        badgeColor: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
        joinedDaysAgo: 4,
        model: 'Ollama (Local)',
    },
    {
        rank: 8,
        address: '0xC3b2A1F0e9D8c7B6a5F4e3D2c1B0a9F8e7D6c5B4',
        signalsSent: 421,
        accuracy: 88.5,
        uptime: 93.2,
        poolsManaged: 1,
        totalRevenue: 84,
        badge: '🌱 New Node',
        badgeColor: 'text-gray-400 border-gray-400/30 bg-gray-400/10',
        joinedDaysAgo: 1,
        model: 'Grok 3',
    },
];
