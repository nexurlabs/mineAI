import { WebSocketServer, WebSocket } from "ws";

let wss: WebSocketServer | null = null;

export function initWebSocketServer(port: number) {
  wss = new WebSocketServer({ port });
  
  wss.on("connection", (ws) => {
    console.log("[RoseGuard WS] Dashboard connected!");
    ws.on("message", (msg) => {
      console.log("[RoseGuard WS] Received from Dashboard:", msg.toString());
      // Here we will handle remote control commands from dashboard
    });
  });

  console.log(`[RoseGuard WS] WebSocket server listening on port ${port}`);
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
