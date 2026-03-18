/**
 * LLMRouter — Multi-Provider Neural Intelligence Matrix
 * Supports: Anthropic (Claude 4.6), OpenAI, Google Gemini, Grok, Ollama (local)
 * Mirrors Nirium's multi-LLM provider architecture exactly.
 */
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createLogger } from "../../logger";
const log = createLogger("LLMRouter");
export interface LLMDecision {
    feeBps: number;
    activateIL: boolean;
    reasoning: string;
}
interface QueryParams {
    systemPrompt: string;
    userMessage: string;
}
export class LLMRouter {
    private readonly _anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
    private readonly _openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    get activeProvider(): string {
        return process.env.ACTIVE_LLM_PROVIDER ?? "anthropic";
    }
    async query(params: QueryParams): Promise<LLMDecision> {
        const provider = this.activeProvider;
        log.info(`Querying LLM provider: ${provider}`);
        switch (provider) {
            case "anthropic": return this._queryAnthropic(params);
            case "openai": return this._queryOpenAI(params);
            case "gemini": return this._queryGemini(params);
            case "grok": return this._queryGrok(params);
            case "ollama": return this._queryOllama(params);
            case "mock": return this._queryMock(params);
            default: return this._queryAnthropic(params);
        }
    }
    // ── Anthropic Claude 4.6 ─────────────────────────────────────────────────
    private async _queryAnthropic(params: QueryParams): Promise<LLMDecision> {
        const msg = await this._anthropic.messages.create({
            model: "claude-opus-4-6", // Claude 4.6 — March 2026 edition
            max_tokens: 512,
            system: params.systemPrompt,
            messages: [{ role: "user", content: params.userMessage }],
        });
        const text = msg.content[0].type === "text" ? msg.content[0].text : "";
        return this._parseDecision(text);
    }
    // ── OpenAI ───────────────────────────────────────────────────────────────
    private async _queryOpenAI(params: QueryParams): Promise<LLMDecision> {
        const res = await this._openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: params.systemPrompt },
                { role: "user", content: params.userMessage },
            ],
            response_format: { type: "json_object" },
        });
        const text = res.choices[0]?.message?.content ?? "{}";
        return this._parseDecision(text);
    }
    // ── Google Gemini ────────────────────────────────────────────────────────
    private async _queryGemini(params: QueryParams): Promise<LLMDecision> {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${params.systemPrompt}\n\n${params.userMessage}` }],
                    }],
                    generationConfig: { responseMimeType: "application/json" },
                }),
            }
        );
        const data = await res.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
        return this._parseDecision(text);
    }
    // ── Grok (xAI) ──────────────────────────────────────────────────────────
    private async _queryGrok(params: QueryParams): Promise<LLMDecision> {
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "grok-3",
                messages: [
                    { role: "system", content: params.systemPrompt },
                    { role: "user", content: params.userMessage },
                ],
                response_format: { type: "json_object" },
            }),
        });
        const data = await res.json() as any;
        return this._parseDecision(data.choices?.[0]?.message?.content ?? "{}");
    }
    // ── Ollama (local / private) ─────────────────────────────────────────────
    private async _queryOllama(params: QueryParams): Promise<LLMDecision> {
        const res = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL ?? "llama3.3",
                prompt: `${params.systemPrompt}\n\n${params.userMessage}`,
                stream: false,
                format: "json",
            }),
        });
        const data = await res.json() as any;
        return this._parseDecision(data.response ?? "{}");
    }
    // ── Mock (Test / Demo) ──────────────────────────────────────────────────
    private async _queryMock(params: QueryParams): Promise<LLMDecision> {
        log.info("Using Neural Mock for demo mode...");
        return {
            feeBps: 4500,
            activateIL: true,
            reasoning: "MOCK: Detected high variance, raising fees to capture volatility premium."
        };
    }

    // ── Parser ───────────────────────────────────────────────────────────────
    private _parseDecision(raw: string): LLMDecision {
        try {
            const parsed = JSON.parse(raw);
            if (
                typeof parsed.feeBps !== "number" ||
                typeof parsed.activateIL !== "boolean" ||
                typeof parsed.reasoning !== "string"
            ) throw new Error("Invalid schema");
            // Clamp fee to safety bounds
            const feeBps = Math.max(500, Math.min(10000, parsed.feeBps));
            log.info(`LLM parsed: feeBps=${feeBps}, IL=${parsed.activateIL}`);
            return { feeBps, activateIL: parsed.activateIL, reasoning: parsed.reasoning };
        } catch {
            log.warn("LLM parse error — using conservative defaults");
            return { feeBps: 3000, activateIL: false, reasoning: "Parse fallback" };
        }
    }
}
