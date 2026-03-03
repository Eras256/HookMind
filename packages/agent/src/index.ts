/**
 * HookMind Agent Daemon — Entry Point
 * Mirrors Nirium's agent/src/index.ts architecture.
 * Boots the main engine loop and WebSocket broadcast server.
 */
import "dotenv/config";
import { AgentEngine } from "./engine.js";
import { createLogger } from "./logger.js";
import { MCPBridge } from "./mcp/bridge.js";
import { WSServer } from "./ws/server.js";
const log = createLogger("HookMind:Boot");
async function main() {
    log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    log.info(" 🧠 HookMind Protocol — AI Agent v1.0.0");
    log.info(" Target: Unichain | Hook: HookMindCore.sol");
    log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    // Start WebSocket server for real-time frontend streaming (port 3001)
    const wsServer = new WSServer(3001);
    wsServer.start();
    log.info("🔌 WebSocket server live on ws://localhost:3001");
    // Start MCP bridge for external LLM tool access
    const mcpBridge = new MCPBridge(wsServer);
    await mcpBridge.init();
    // Start the main AI agent loop
    const engine = new AgentEngine(wsServer);
    await engine.run(); // never returns — infinite loop
}
main().catch((err) => {
    console.error("FATAL AGENT ERROR:", err);
    process.exit(1);
});
