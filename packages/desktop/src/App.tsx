import { useState, useEffect } from "react";

import "./App.css";

// Neural UI + Lucide Icons equivalents using SVG to avoid deps inside desktop, or I can just use basic HTML if needed. 
// Assuming tailwindcss will be installed or just using inline styles for now.
// For the prompt, I will provide a beautiful component in tailwind CSS.

function App() {
  const [cpu, setCpu] = useState("24%");
  const [ram, setRam] = useState("4.2GB / 16GB");
  const [logs, setLogs] = useState<string[]>([]);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    // Simulated Node Loop Data
    const interval = setInterval(() => {
      setUptime((prev) => prev + 1);
      setCpu(`${Math.floor(Math.random() * 20 + 20)}%`);
      setRam(`${(Math.random() * 0.5 + 4.0).toFixed(1)}GB / 16GB`);
    }, 1000);

    const logInterval = setInterval(() => {
      const msgs = [
        "📡 Reading pool state from Unichain HMC...",
        "📊 Volatility Score: 4100 / 10000",
        "🧠 LLM Query (Ollama) -> Fee 3000 bps",
        "✍️ ECDSA Signature Generated",
        `🔗 Tx 0x${Math.floor(Math.random() * 1000000000).toString(16)} Confirmed!`
      ];
      setLogs(prev => {
        const next = [msgs[Math.floor(Math.random() * msgs.length)], ...prev];
        return next.slice(0, 8);
      });
    }, 2500);

    return () => { clearInterval(interval); clearInterval(logInterval); };
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "monospace" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "24px", color: "#06B6D4" }}>
          🧠 HookMind <span style={{ color: "#fff" }}>Operator Node</span>
        </h1>
        <div style={{ padding: "4px 12px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.5)", borderRadius: "20px", color: "#22C55E", fontSize: "14px", fontWeight: "bold" }}>
          ● UNICHAIN: ONLINE
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}>
          <div style={{ color: "#888", fontSize: "12px", marginBottom: "8px" }}>LOCAL LLM USAGE (Ollama)</div>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>CPU: {cpu}</div>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>RAM: {ram}</div>
        </div>
        <div style={{ padding: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}>
          <div style={{ color: "#888", fontSize: "12px", marginBottom: "8px" }}>NODE METRICS</div>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>Uptime: {formatTime(uptime)}</div>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#A855F7" }}>ECDSA Signatures: {Math.floor(uptime / 12)}</div>
        </div>
      </div>

      <div style={{ padding: "16px", background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "12px", height: "300px", overflow: "hidden" }}>
        <div style={{ color: "#06B6D4", fontSize: "14px", fontWeight: "bold", marginBottom: "12px", borderBottom: "1px solid rgba(6,182,212,0.2)", paddingBottom: "8px" }}>
          &gt; TERMINAL EXECUTION FEED
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {logs.map((log, i) => (
            <div key={i} style={{ fontSize: "13px", color: i === 0 ? "#fff" : "#888" }}>
              [{new Date().toLocaleTimeString()}] {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
