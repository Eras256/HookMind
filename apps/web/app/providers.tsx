"use client";
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { unichainSepolia, mainnet } from 'viem/chains';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { 
  injectedWallet,
  metaMaskWallet, 
  rainbowWallet, 
  coinbaseWallet 
} from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';
import { LanguageProvider } from '../context/LanguageContext';

// 1. Usar el Project ID de la Demo Oficial de RainbowKit.
// Este ID está diseñado para funcionar en localhost para pruebas.
const projectId = '9d00938f28faed22cc0d2cb2f8319f39'; 

const wallets = [
  injectedWallet, // Priorizamos la billetera inyectada (MetaMask, etc.)
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
];

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: wallets,
    },
  ],
  {
    appName: 'HookMind',
    projectId,
  }
);

const config = createConfig({
  connectors,
  chains: [unichainSepolia, mainnet],
  ssr: true,
  transports: {
    [unichainSepolia.id]: http('https://sepolia.unichain.org'),
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Evitar renderizado de RainbowKit hasta que el cliente esté montado
    // para asegurar que las billeteras inyectadas se detecten correctamente.
    return (
        <LanguageProvider>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider modalSize="compact">
                        {mounted ? children : null}
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </LanguageProvider>
    );
}
