import mc from "minecraft-protocol";
import { EventEmitter } from "events";
import { MineAIConfig } from "../storage/config.js";
import { broadcastState } from "../web/ws.js";
import { IBot } from "./types.js";
import { VanillaBot } from "./vanilla.js";
import { ForgeBot } from "./forge.js";

export class BotManager extends EventEmitter {
  public bot: IBot | null = null;
  private config: MineAIConfig;
  private retryTimer: NodeJS.Timeout | null = null;
  private stopped = false;
  private connectionType: "vanilla" | "forge" | null = null;

  constructor(config: MineAIConfig) {
    super();
    this.config = config;
    void this.initializePipeline();
  }

  private clearRetryTimer() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private scheduleRetry(reason: string) {
    if (this.stopped) return;

    this.clearRetryTimer();
    console.log(`[mineAI] ${reason} Retrying in 5s...`);
    this.retryTimer = setTimeout(() => {
      void this.initializePipeline();
    }, 5000);
  }

  private async initializePipeline() {
    if (this.stopped || this.bot) return;

    console.log(`[mineAI] Pinging ${this.config.minecraft.host}:${this.config.minecraft.port} to determine Bot Pipeline...`);

    mc.ping({ host: this.config.minecraft.host, port: this.config.minecraft.port }, (err: any, response: any) => {
      if (this.stopped || this.bot) return;

      if (err) {
        this.scheduleRetry(`Failed to ping server: ${err}. Waiting for the Minecraft server to come online.`);
        return;
      }

      const rawRes = response as any;
      const isForge = rawRes.forgeData || rawRes.modinfo;

      if (isForge) {
        console.log(`[mineAI] FML/Forge tags detected! Switching to Forge Pipeline.`);
        this.selectPipeline("forge");
      } else {
        console.log(`[mineAI] No mod tags detected! Booting Vanilla pathfinding Pipeline.`);
        this.selectPipeline("vanilla");
      }
    });
  }

  private selectPipeline(type: "vanilla" | "forge") {
    if (this.bot) return;

    this.connectionType = type;
    this.clearRetryTimer();
    this.bot = type === "vanilla" ? new VanillaBot(this.config) : new ForgeBot(this.config);
    this.registerEvents();

    // Emit "ready" so the agent (brain) can safely attach listeners.
    this.emit("ready", this.bot);
  }

  private registerEvents() {
    if (!this.bot) return;

    this.bot.on("login" as any, () => {
      if (!this.bot) return;
      console.log(`[mineAI] Logged in as ${this.bot.username}`);
    });

    this.bot.once("spawn", () => {
      if (!this.bot) return;
      console.log(`[mineAI] Spawned in as ${this.bot.username}`);
      // Avoid an immediate startup chat packet during smoke tests and
      // first-join compatibility checks.
      this.pushState();
    });

    this.bot.on("health", () => {
      this.pushState();
    });

    // Broadcast chat messages to dashboard when explicitly enabled.
    // Some test servers emit malformed chat packets during join; keep this off
    // unless the environment says the runtime is safe for chat parsing.
    if (process.env.MINEAI_ENABLE_CHAT_LISTENER === "true") {
      this.bot.on("chat", (username, message) => {
        if (!this.bot || username === this.bot.username) return;
        console.log(`[CHAT] ${username}: ${message}`);
        broadcastState("chat", { username, message });
      });
    }

    this.bot.on("error", (err) => console.log(`[mineAI Error]: ${err}`));
    this.bot.on("kicked", (reason) => console.log(`[mineAI] Kicked from server: ${JSON.stringify(reason)}`));
    this.bot.on("end", () => {
      console.log(`[mineAI] Disconnected from server.`);
      this.bot = null;
      const type = this.connectionType;
      this.connectionType = null;
      if (!this.stopped && type) {
        this.scheduleRetry(`Lost ${type} connection.`);
      }
    });
  }

  public stop() {
    this.stopped = true;
    this.clearRetryTimer();
    this.bot?.disconnect();
    this.bot = null;
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
