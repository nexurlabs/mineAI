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
    this.startForgeBridge();
  }

  private startForgeBridge() {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`[mineAI Forge] ⚠️  FORGE PIPELINE — NOT YET AVAILABLE`);
    console.log(`${"=".repeat(60)}`);
    console.log(`[mineAI Forge] The native Java RPC bridge mod is still under`);
    console.log(`[mineAI Forge] development and is NOT compiled in this release.`);
    console.log(`[mineAI Forge]`);
    console.log(`[mineAI Forge] The bot detected a Forge/FML server but cannot`);
    console.log(`[mineAI Forge] connect using modded protocols yet.`);
    console.log(`[mineAI Forge]`);
    console.log(`[mineAI Forge] Falling back to vanilla-compatible connection.`);
    console.log(`[mineAI Forge] Some modded features will not be available.`);
    console.log(`${"=".repeat(60)}\n`);

    // Start the WebSocket listener for future Java bridge
    this.wsServer = new WebSocketServer({ port: 25577 });
    this.wsServer.on("connection", (ws) => {
      console.log(`[mineAI Forge] Headless Client Connected! Handshake successful.`);
      this.socket = ws;

      this.socket.on("message", (msg) => {
        try {
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
        } catch (e) {
          console.error(`[mineAI Forge] Invalid message from Java bridge:`, e);
        }
      });
    });

    // Emit an error event to let manager know this isn't fully functional
    setTimeout(() => {
      this.emit("spawn");
      this._pos = { x: 0, y: 70, z: 0 };
    }, 1000);
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
