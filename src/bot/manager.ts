import mineflayer from "mineflayer";
import mc from "minecraft-protocol";
import { MineAIConfig } from "../storage/config.js";
import { broadcastState } from "../web/ws.js";
import { IBot } from "./types.js";
import { VanillaBot } from "./vanilla.js";
import { ForgeBot } from "./forge.js";

export class BotManager {
  public bot: IBot | null = null;
  private config: MineAIConfig;

  constructor(config: MineAIConfig) {
    this.config = config;
    this.initializePipeline();
  }

  private async initializePipeline() {
    console.log(`[mineAI] Pinging ${this.config.minecraft.host}:${this.config.minecraft.port} to determine Bot Pipeline...`);
    
    mc.ping({ host: this.config.minecraft.host, port: this.config.minecraft.port }, (err: any, response: any) => {
      if (err) {
        console.log(`[mineAI Error] Failed to ping server: ${err}. Defaulting to Vanilla Pipeline.`);
        this.selectPipeline("vanilla");
        return;
      }
      
      const rawRes = response as any;
      const isForge = rawRes.forgeData || rawRes.modinfo;
      
      if (isForge) {
        console.log(`[mineAI] FML/Forge tags detected! Switching to True Forge Pipeline.`);
        this.selectPipeline("forge");
      } else {
        console.log(`[mineAI] No mod tags detected! Booting Vanilla pathfinding Pipeline.`);
        this.selectPipeline("vanilla");
      }
    });
  }

  private selectPipeline(type: "vanilla" | "forge") {
    if (type === "vanilla") {
      this.bot = new VanillaBot(this.config);
    } else {
      this.bot = new ForgeBot(this.config);
    }
    this.registerEvents();
  }

  private registerEvents() {
    if (!this.bot) return;

    this.bot.once("spawn", () => {
      console.log(`[mineAI] Spawned in as ${this.bot!.username}`);
      this.bot!.chat("mineAI dual-pipeline initialized! Waiting for commands...");
      this.pushState();
    });

    this.bot.on("health", () => {
      this.pushState();
    });
    
    // Broadcast chat messages to dashboard
    this.bot.on("chat", (username, message) => {
      if (username === this.bot!.username) return;
      console.log(`[CHAT] ${username}: ${message}`);
      broadcastState("chat", { username, message });
    });

    this.bot.on("error", (err) => console.log(`[mineAI Error]: ${err}`));
    this.bot.on("end", () => console.log(`[mineAI] Disconnected from server.`));
  }

  public pushState() {
    if (!this.bot) return;
    const state = {
      health: this.bot.health,
      food: this.bot.food,
      position: this.bot.position,
      username: this.bot.username
    };
    broadcastState("bot_status", state);
  }
}
