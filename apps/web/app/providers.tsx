// @ts-nocheck
"use client";
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia, unichain, unichainSepolia } from 'viem/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const { config, queryClient } = React.useMemo(() => {
        if (!mounted) return { config: null, queryClient: null };
        const _config = getDefaultConfig({
            appName: 'HookMind',
            projectId: 'YOUR_PROJECT_ID',
            chains: [unichain, unichainSepolia, mainnet, sepolia],
            ssr: true,
        });
        const _queryClient = new QueryClient();
        return { config: _config, queryClient: _queryClient };
    }, [mounted]);

    if (!mounted || !config || !queryClient) {
        return null;
    }

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
