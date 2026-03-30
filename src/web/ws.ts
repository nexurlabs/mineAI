import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";
import { loadConfig, saveConfig } from "../storage/config.js";

let wss: WebSocketServer | null = null;
let server: http.Server | null = null;

export function initWebSocketServer(port: number) {
  server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/api/config") {
      const config = loadConfig();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(config));
    } else if (req.method === "POST" && req.url === "/api/config") {
      let body = "";
      req.on("data", chunk => body += chunk.toString());
      req.on("end", () => {
        try {
          const config = JSON.parse(body);
          saveConfig(config);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
          
          console.log("[mineAI Server] Config updated via Dashboard. Restarting...");
          setTimeout(() => process.exit(0), 1000);
        } catch(e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
    } else if (req.method === "GET" && req.url === "/api/status") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ running: true }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

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
