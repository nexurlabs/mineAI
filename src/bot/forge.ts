import { IBot, Position } from "./types.js";
import { MineAIConfig } from "../storage/config.js";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";

export class ForgeBot implements IBot {
  private child: ChildProcess | null = null;
  private wsServer: WebSocketServer | null = null;
  private socket: WebSocket | null = null;
  private config: MineAIConfig;

  private _username: string = "";
  private _health: number = 20;
  private _food: number = 20;
  private _pos: Position | null = null;

  // Tiny local event emitter mock
  private listeners: Record<string, Function[]> = {};

  constructor(config: MineAIConfig) {
    this.config = config;
    this._username = config.minecraft.username;
    this.startHeadlessJava();
  }

  private startHeadlessJava() {
    console.log(`[mineAI Forge] Booting Headless Java RPC process... (Port 25577)`);
    
    // 1. Establish the listener bridging over WebSockets to the Java process
    this.wsServer = new WebSocketServer({ port: 25577 });
    this.wsServer.on("connection", (ws) => {
      console.log(`[mineAI Forge] Headless Client Connected! Handshake successful.`);
      this.socket = ws;
      
      this.socket.on("message", (msg) => {
        const payload = JSON.parse(msg.toString());
        if (payload.event === "spawn") {
          this.emit("spawn");
        } else if (payload.event === "chat") {
          this.emit("chat", payload.username, payload.message);
        } else if (payload.event === "health") {
          this._health = payload.health;
          this._food = payload.food;
          this.emit("health");
        } else if (payload.event === "position") {
          this._pos = { x: payload.x, y: payload.y, z: payload.z };
        }
      });
      
      // We automatically emit 'spawn' here for mocking proof-of-concept
      this.emit("spawn");
      this._pos = { x: 0, y: 70, z: 0 };
    });

    // 2. Here we would physically spawn the Java process, for example:
    // const jjkDir = path.join(process.cwd(), "forge-client");
    // this.child = spawn("java", ["-jar", "forge-1.20.1-headless.jar", "--rpc-port=25577", `--host=${this.config.minecraft.host}`], { cwd: jjkDir, stdio: "inherit" });
    
    console.log(`[mineAI Forge] ⚠️ Notice: The Native Java Bridge mod is not currently compiled in this proof-of-concept repository!`);
  }

  get username(): string { return this._username; }
  get health(): number { return this._health; }
  get food(): number { return this._food; }
  get position(): Position | null { return this._pos; }

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  once(event: string, listener: (...args: any[]) => void): void {
    const wrapper = (...args: any[]) => {
      listener(...args);
      this.listeners[event] = this.listeners[event].filter(l => l !== wrapper);
    };
    this.on(event, wrapper);
  }

  private emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(l => l(...args));
    }
  }

  private sendCommand(cmd: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(cmd));
    } else {
      console.log(`[mineAI Forge] Dropped command (Java socket disconnected): ${JSON.stringify(cmd)}`);
    }
  }

  chat(message: string): void {
    this.sendCommand({ action: "chat", message });
  }

  async goTo(x: number, y: number, z: number): Promise<void> {
    this.sendCommand({ action: "goto", coordinates: { x, y, z } });
    console.log(`[mineAI Forge] Transmitted pathfinding vector to Java process`);
  }

  async attackEntity(entityName: string): Promise<void> {
    this.sendCommand({ action: "attack", entityName });
    console.log(`[mineAI Forge] Transmitted attack intention to Java process`);
  }

  findBlocks(maxDistance: number, count: number): any[] {
    return []; // We'd request this from Java in real time
  }

  disconnect(): void {
    if (this.child) this.child.kill();
    if (this.wsServer) this.wsServer.close();
  }
}
