import mineflayer from "mineflayer";
import { pathfinder, Movements } from "mineflayer-pathfinder";
import { plugin as pvp } from "mineflayer-pvp";
import { plugin as collectBlock } from "mineflayer-collectblock";
import armorManager from "mineflayer-armor-manager";
import { RoseGuardConfig } from "../storage/config.js";
import { broadcastState } from "../web/ws.js";

export class BotManager {
  public bot: mineflayer.Bot;
  
  constructor(config: RoseGuardConfig) {
    console.log(`[RoseGuard] Connecting to ${config.minecraft.host}:${config.minecraft.port}...`);
    this.bot = mineflayer.createBot({
      host: config.minecraft.host,
      port: config.minecraft.port,
      username: config.minecraft.username,
      auth: config.minecraft.auth === "microsoft" ? "microsoft" : "offline"
    });

    // Load Plugins
    this.bot.loadPlugin(pathfinder);
    this.bot.loadPlugin(pvp);
    this.bot.loadPlugin(collectBlock);
    this.bot.loadPlugin(armorManager);

    this.registerEvents();
  }

  private registerEvents() {
    this.bot.once("spawn", () => {
      console.log(`[RoseGuard] Spawned in as ${this.bot.username}`);
      this.bot.chat("RoseGuard initialized. Waiting for commands...");
      
      const defaultMove = new Movements(this.bot);
      this.bot.pathfinder.setMovements(defaultMove);
      
      this.pushState();
    });

    this.bot.on("health", () => {
      this.pushState();
    });
    
    // Broadcast chat messages to dashboard
    this.bot.on("chat", (username, message) => {
      if (username === this.bot.username) return;
      console.log(`[CHAT] ${username}: ${message}`);
      broadcastState("chat", { username, message });
    });

    this.bot.on("error", (err) => console.log(`[RoseGuard Error]: ${err}`));
    this.bot.on("end", () => console.log(`[RoseGuard] Disconnected from server.`));
  }

  public pushState() {
    if (!this.bot.entity) return;
    const state = {
      health: this.bot.health,
      food: this.bot.food,
      position: this.bot.entity.position,
      username: this.bot.username
    };
    broadcastState("bot_status", state);
  }
}
