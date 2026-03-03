import express from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import cors from "cors";
import { createLogger } from "./logger";
import { AgentEngine } from "./engine";
import axios from "axios";

// Instantiating logger
const log = createLogger("HookMind:Server");

const app = express();
app.use(express.json());
app.use(cors());

// Rate Limiting (Protección contra DDoS/bot spam)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api/", limiter);

const JWT_SECRET = process.env.API_JWT_SECRET || "hookmind_institutional_secret_key_2026";

// Auth Middleware para los Institucionales
const authenticateJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
            if (err) return res.status(403).json({ error: "Invalid signature/token" });
            (req as any).user = user;
            next();
        });
    } else {
        res.status(401).json({ error: "Missing authorization header" });
    }
};

// ==============================================================================
// 1. JWT Key Generation
// ==============================================================================
app.post("/api/auth/keys", (req, res) => {
    const { protocolName, walletAddress } = req.body;
    if (!protocolName || !walletAddress) {
        return res.status(400).json({ error: "Missing protocolName or walletAddress" });
    }

    // Generate a permanent API key token representing this institutional protocol
    const token = jwt.sign({ protocolName, walletAddress, role: "institutional" }, JWT_SECRET, { expiresIn: '1y' });
    log.info(`New Institutional API Key minted for ${protocolName} (${walletAddress})`);

    res.json({ token, message: "Keep this token safe. It grants execute access to the hookmind node." });
});

// ==============================================================================
// 2. Ejecución Manual (Inyectar señales)
// ==============================================================================
// Allow external systems (like The Graph/Indexers or other Protocols) to force a signal
app.post("/api/execute", authenticateJWT, async (req, res) => {
    try {
        const { feeBps, ilProtect, forceVolatility } = req.body;

        if (feeBps < 500 || feeBps > 10000) {
            return res.status(400).json({ error: "Fee out of bounds. Must be 500-10000." });
        }

        log.info(`Manual execution triggered by ${(req as any).user.protocolName}: Fee ${feeBps}bps, IL ${ilProtect}, Volatility ${forceVolatility}`);

        // Aquí conectaríamos con el engine para simular/procesar
        // let engine = (req as any).app.get('engine') as AgentEngine; 
        // let txHash = await engine.forceSignal(feeBps, forceVolatility, ilProtect);

        res.json({
            success: true,
            message: "Signal queued to Unichain v4 Hook",
            simulatedTx: "0xMockTxHashExecution"
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ==============================================================================
// 3. Sistema Institucional de Webhooks para Eventos Críticos (IL Spikes)
// ==============================================================================
const registeredWebhooks: string[] = [];

app.post("/api/webhooks/register", authenticateJWT, (req, res) => {
    const { targetUrl } = req.body;
    if (!targetUrl) return res.status(400).json({ error: "targetUrl required" });

    registeredWebhooks.push(targetUrl);
    log.info(`Registered new webhook listener: ${targetUrl}`);
    res.json({ success: true, listeners: registeredWebhooks.length });
});

export const triggerWebhooks = async (eventPayload: any) => {
    for (const url of registeredWebhooks) {
        try {
            await axios.post(url, eventPayload, {
                headers: { "Content-Type": "application/json", "X-HookMind-Signature": "signed_payload" }
            });
            log.info(`Webhook fired to ${url}`);
        } catch (e: any) {
            log.warn(`Webhook to ${url} failed: ${e.message}`);
        }
    }
};

// Init Server
export function startServer(port: number = parseInt(process.env.PORT || "4000")) {
    app.listen(port, () => {
        log.info(`[PID: ${process.pid}] Institutional API & Webhook Server running on port ${port}`);
    });
}
