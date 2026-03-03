/**
 * useAgentStream — React hook for real-time WebSocket stream from Agent Daemon.
 * Plug directly into frontend components to see live AI thinking feed.
 */
import { useState, useEffect, useCallback } from "react";
export interface AgentEvent {
    type: "pool_state" | "llm_decision" | "tx_confirmed" | "ipfs_cid" | "error" | "metrics";
    data?: unknown;
    txHash?: string;
    cid?: string;
    message?: string;
    volatilityScore?: number;
    ilExposure?: string;
}
export function useAgentStream(wsUrl = "ws://localhost:3001") {
    const [events, setEvents] = useState<AgentEvent[]>([]);
    const [latestEvent, setLatestEvent] = useState<AgentEvent | null>(null);
    const [connected, setConnected] = useState(false);
    useEffect(() => {
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onmessage = (msg) => {
            const event = JSON.parse(msg.data) as AgentEvent;
            setLatestEvent(event);
            setEvents((prev: AgentEvent[]) => [event, ...prev].slice(0, 100)); // keep last 100
        };
        return () => ws.close();
    }, [wsUrl]);
    const clearEvents = useCallback(() => setEvents([]), []);
    return { events, latestEvent, connected, clearEvents };
}
