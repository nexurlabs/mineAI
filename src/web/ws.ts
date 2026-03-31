import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { loadConfig, loadConfigRedacted, saveConfig, MineAIConfig } from "../storage/config.js";

let wss: WebSocketServer | null = null;
let server: http.Server | null = null;

// In-memory log buffer for the dashboard
const LOG_BUFFER: string[] = [];
const MAX_LOG_LINES = 500;

// Capture console.log to also push to log buffer
const _origLog = console.log;
const _origError = console.error;
const _origWarn = console.warn;

function pushLog(level: string, ...args: any[]) {
  const timestamp = new Date().toISOString().slice(11, 19);
  const line = `[${timestamp}] ${args.map(a => typeof a === "string" ? a : JSON.stringify(a)).join(" ")}`;
  LOG_BUFFER.push(line);
  if (LOG_BUFFER.length > MAX_LOG_LINES) LOG_BUFFER.shift();
  broadcastState("log", { line });
}

console.log = (...args: any[]) => { _origLog(...args); pushLog("info", ...args); };
console.error = (...args: any[]) => { _origError(...args); pushLog("error", ...args); };
console.warn = (...args: any[]) => { _origWarn(...args); pushLog("warn", ...args); };

// Version
const PACKAGE_JSON_PATH = path.join(process.cwd(), "package.json");
function getVersion(): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf-8"));
    return pkg.version || "unknown";
  } catch { return "unknown"; }
}

export function initWebSocketServer(port: number) {
  const app = express();
  
  app.use(cors());
  app.use(express.json());

  // ─── Config (redacted) ──────────────────────────────────
  app.get("/api/config", (_req, res) => {
    res.json(loadConfigRedacted());
  });

  app.post("/api/config", (req, res) => {
    try {
      const current = loadConfig();
      const body = req.body as Partial<MineAIConfig>;
      
      // Merge updates into current config
      const updated: MineAIConfig = {
        llm: { ...current.llm, ...body.llm },
        minecraft: { ...current.minecraft, ...body.minecraft },
      };

      // If api_key is the masked placeholder, keep the original
      if (updated.llm.api_key.startsWith("••••")) {
        updated.llm.api_key = current.llm.api_key;
      }

      saveConfig(updated);
      res.json({ success: true, message: "Config saved. Restart mineAI to apply changes." });
    } catch(e) {
      res.status(400).json({ error: "Invalid config data" });
    }
  });

  // ─── API Key (separate endpoint) ────────────────────────
  app.post("/api/config/key", (req, res) => {
    try {
      const { api_key } = req.body;
      if (!api_key || typeof api_key !== "string") {
        return res.status(400).json({ error: "api_key is required" });
      }
      const config = loadConfig();
      config.llm.api_key = api_key.trim();
      saveConfig(config);
      res.json({ success: true, message: "API key updated." });
    } catch(e) {
      res.status(400).json({ error: "Failed to update key" });
    }
  });

  // ─── Version ────────────────────────────────────────────
  app.get("/api/version", async (_req, res) => {
    const current = getVersion();
    let latest = current;
    let updateAvailable = false;

    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/nexurlabs/mineAI/main/package.json",
        { signal: AbortSignal.timeout(3000) }
      );
      if (response.ok) {
        const remotePkg = await response.json() as any;
        latest = remotePkg.version || current;
        updateAvailable = latest !== current;
      }
    } catch { /* network fail — ignore */ }

    res.json({ current, latest, updateAvailable });
  });

  // ─── Logs ───────────────────────────────────────────────
  app.get("/api/logs", (_req, res) => {
    res.json({ logs: LOG_BUFFER });
  });

  // ─── Status ─────────────────────────────────────────────
  app.get("/api/status", (_req, res) => {
    res.json({ running: true, version: getVersion() });
  });

  // ─── Serve the React dashboard ──────────────────────────
  const distPath = path.join(process.cwd(), "dashboard", "dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    app.get("/", (_req, res) => {
      res.send(`
        <html><body style="font-family:monospace;background:#111;color:#eee;padding:40px">
          <h1>mineAI Dashboard</h1>
          <p>Dashboard is not built yet. Run:</p>
          <pre>cd dashboard && npm install && npm run build</pre>
          <p>Then restart mineAI.</p>
        </body></html>
      `);
    });
  }

  server = http.createServer(app);
  wss = new WebSocketServer({ server });
  
  wss.on("connection", (ws) => {
    _origLog("[mineAI WS] Dashboard connected!");
    // Send current logs on connect
    ws.send(JSON.stringify({ event: "logs_init", data: { logs: LOG_BUFFER } }));
    ws.on("message", (msg) => {
      _origLog("[mineAI WS] Received from Dashboard:", msg.toString());
    });
  });

  server.listen(port, () => {
    _origLog(`[mineAI Server] Dashboard: http://localhost:${port}`);
  });
}

export function broadcastState(event: string, data: any) {
  if (!wss) return;
  const payload = JSON.stringify({ event, data });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
