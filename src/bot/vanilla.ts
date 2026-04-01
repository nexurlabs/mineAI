import mineflayer from "mineflayer";
import pathfinderPkg from "mineflayer-pathfinder";
import { plugin as collectBlock } from "mineflayer-collectblock";
import armorManager from "mineflayer-armor-manager";

const { pathfinder, Movements, goals } = pathfinderPkg as typeof pathfinderPkg & {
  pathfinder: typeof import("mineflayer-pathfinder").pathfinder;
  Movements: typeof import("mineflayer-pathfinder").Movements;
  goals: typeof import("mineflayer-pathfinder").goals;
};
import { IBot, Position } from "./types.js";
import { MineAIConfig } from "../storage/config.js";
import { broadcastState } from "../web/ws.js";

export class VanillaBot implements IBot {
  private bot: mineflayer.Bot;

  constructor(config: MineAIConfig) {
    this.bot = mineflayer.createBot({
      host: config.minecraft.host,
      port: config.minecraft.port,
      username: config.minecraft.username,
      auth: config.minecraft.auth === "microsoft" ? "microsoft" : "offline"
    });

    this.bot.loadPlugin(pathfinder);
    this.bot.loadPlugin(collectBlock);
    this.bot.loadPlugin(armorManager);

    this.bot.once("spawn", () => {
      const defaultMove = new Movements(this.bot);
      this.bot.pathfinder.setMovements(defaultMove);
    });
  }

  get username(): string {
    return this.bot.username;
  }

  get health(): number {
    return this.bot.health;
  }

  get food(): number {
    return this.bot.food;
  }

  get position(): Position | null {
    return this.bot.entity ? this.bot.entity.position : null;
  }

  on(event: "spawn" | "health" | "chat" | "error" | "end" | "kicked", listener: (...args: any[]) => void): void {
    this.bot.on(event as any, listener);
  }

  once(event: "spawn", listener: (...args: any[]) => void): void {
    this.bot.once(event as any, listener);
  }

  chat(message: string): void {
    this.bot.chat(message);
  }

  async goTo(x: number, y: number, z: number): Promise<void> {
    const goal = new goals.GoalBlock(x, y, z);
    await this.bot.pathfinder.goto(goal);
  }

  async attackEntity(entityName: string): Promise<void> {
    const target = this.bot.nearestEntity((entity) => entity.name?.toLowerCase() === entityName.toLowerCase());
    if (target) {
      this.bot.attack(target);
    } else {
      throw new Error(`Couldn't find entity: ${entityName}`);
    }
  }

  findBlocks(maxDistance: number, count: number): any[] {
    return this.bot.findBlocks({ matching: () => true, maxDistance, count });
  }

  disconnect(): void {
    this.bot.end();
  }
}
