import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import express from "express";
import cors from "cors";
import path from "path";
import { loadConfig, saveConfig } from "../storage/config.js";

let wss: WebSocketServer | null = null;
let server: http.Server | null = null;

export function initWebSocketServer(port: number) {
  const app = express();
  
  app.use(cors());
  app.use(express.json());

  app.get("/api/config", (req, res) => {
    res.json(loadConfig());
  });

  app.post("/api/config", (req, res) => {
    try {
      saveConfig(req.body);
      res.json({ success: true });
      console.log("[mineAI Server] Config updated via Dashboard. Restarting...");
      setTimeout(() => process.exit(0), 1000);
    } catch(e) {
      res.status(400).json({ error: "Invalid JSON" });
    }
  });

  app.get("/api/status", (req, res) => {
    res.json({ running: true });
  });

  // Serve the React dashboard natively!
  const distPath = path.join(process.cwd(), "dashboard", "dist");
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  server = http.createServer(app);
  wss = new WebSocketServer({ server });
  
  wss.on("connection", (ws) => {
    console.log("[mineAI WS] Dashboard connected!");
    ws.on("message", (msg) => {
      console.log("[mineAI WS] Received from Dashboard:", msg.toString());
    });
  });

  server.listen(port, () => {
    console.log(`[mineAI Server] Dashboard API and WS listening on port ${port}`);
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
