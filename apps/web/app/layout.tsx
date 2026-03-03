// @ts-nocheck
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/nav/Footer";
import { NeuralCanvas } from "@/components/3d/NeuralCanvas";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const metadata: Metadata = {
    title: "HookMind Protocol — AI Agent Mesh for Uniswap v4",
    description: "The first autonomous AI agent protocol that controls a Uniswap v4 Hook in real-time. Live on Unichain.",
    keywords: ["Uniswap v4", "Hook", "AI Agent", "DeFi", "Unichain", "IL Protection"],
    openGraph: {
        title: "HookMind Protocol",
        description: "AI Agents controlling Uniswap v4 Hooks in real-time.",
        siteName: "HookMind",
        type: "website",
    },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="bg-black text-white antialiased overflow-x-hidden flex flex-col min-h-screen">
                <Providers>
                    {/* GPGPU Neural Canvas — fullscreen fixed background */}
                    <NeuralCanvas />
                    {/* Glassmorphic Navbar */}
                    <Navbar />
                    {/* Page Content */}
                    <main className="relative z-10 flex-grow">
                        {children}
                    </main>
                    {/* Global Footer */}
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
