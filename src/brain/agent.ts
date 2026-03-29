import { BotManager } from "../bot/manager.js";
import { LLMClient } from "./llm.js";
import { MineAIConfig } from "../storage/config.js";
import pkg from "mineflayer-pathfinder";

const { goals } = pkg;

export class MineAIAgent {
  private manager: BotManager;
  private llm: LLMClient;

  private availableTools = [
    {
      type: "function" as const,
      function: {
        name: "chat",
        description: "Send a message to the public Minecraft chat.",
        parameters: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
          required: ["message"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "goTo",
        description: "Pathfind to specific X, Y, Z coordinates.",
        parameters: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "number" },
            z: { type: "number" },
          },
          required: ["x", "y", "z"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "attackEntity",
        description: "Attack a nearby visible entity by name.",
        parameters: {
          type: "object",
          properties: {
            entityName: { type: "string" },
          },
          required: ["entityName"],
        },
      },
    }
  ];

  constructor(manager: BotManager, config: MineAIConfig) {
    this.manager = manager;
    this.llm = new LLMClient(config);

    // Bind event to process LLM thoughts on incoming chat
    this.manager.bot.on("chat", async (username, message) => {
      if (username === this.manager.bot.username) return;
      if (message.toLowerCase().includes("rose")) {
        await this.processGoal(message);
      }
    });
  }

  private buildContext(): string {
    const bot = this.manager.bot;
    if (!bot.entity) return "Loading state...";

    const pos = bot.entity.position;
    const health = bot.health;
    const food = bot.food;
    
    // Find nearby blocks
    const nearbyBlocks = bot.findBlocks({ matching: () => true, maxDistance: 5, count: 5 });

    return `
      You are mineAI, an intelligent Minecraft agent.
      Your current status:
      - Health: ${health}/20
      - Hunger: ${food}/20
      - Location: X:${Math.floor(pos.x)} Y:${Math.floor(pos.y)} Z:${Math.floor(pos.z)}
      
      You can use tools to perform your actions. If you don't need a tool, just respond with conversational text.
    `;
  }

  public async processGoal(goalText: string) {
    console.log(`[mineAI Agent] Processing Goal: ${goalText}`);
    const context = this.buildContext() + `\nUser Command: ${goalText}`;
    
    try {
      const response = await this.llm.generateAction(context, this.availableTools);
      
      if (response && response.tool_calls && response.tool_calls.length > 0) {
        for (const toolCall of response.tool_calls) {
          await this.executeTool(toolCall.function.name, JSON.parse(toolCall.function.arguments));
        }
      } else if (response && response.content) {
        this.manager.bot.chat(response.content);
      }
    } catch(err: any) {
      console.error(`[mineAI Agent Error]`, err.message);
    }
  }

  private async executeTool(name: string, args: any) {
    console.log(`[mineAI Agent] Executing Tool: ${name}`, args);
    const bot = this.manager.bot;

    try {
      if (name === "chat") {
        bot.chat(args.message);
      } else if (name === "goTo") {
        const goal = new goals.GoalBlock(args.x, args.y, args.z);
        await bot.pathfinder.goto(goal);
        bot.chat(`I have arrived at ${args.x}, ${args.y}, ${args.z}`);
      } else if (name === "attackEntity") {
        const target = bot.nearestEntity((entity) => entity.name?.toLowerCase() === args.entityName.toLowerCase());
        if (target) {
          bot.pvp.attack(target);
          bot.chat(`Attacking ${args.entityName}!`);
        } else {
          bot.chat(`I couldn't find any ${args.entityName} nearby.`);
        }
      }
    } catch (err: any) {
      console.error(`[mineAI Tool Error] ${err}`);
      // In a full implementation, feed this error back to the LLM for recovery.
    }
  }
}
