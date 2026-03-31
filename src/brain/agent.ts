import { BotManager } from "../bot/manager.js";
import { LLMClient } from "./llm.js";
import { MineAIConfig } from "../storage/config.js";
import { IBot } from "../bot/types.js";
import pkg from "mineflayer-pathfinder";

const { goals } = pkg;

/**
 * Built-in system prompt — always prepended before user prompt.
 * This is the permanent "identity" of the bot, similar to Rica's built-in persona.
 * Users can customize behavior via userPrompt in the dashboard, but this core
 * identity is always present.
 */
const BUILT_IN_PROMPT = `You are mineAI, an intelligent Minecraft bot created by NexurLabs.

Your role:
- You live inside a Minecraft server as a player.
- You respond to chat messages that mention "rose" (your trigger word).
- You can perform in-game actions using tool calls: chat, goTo, and attackEntity.
- You are helpful, concise, and aware of your in-game surroundings.

Rules:
- Always use tools when a player asks you to do something in-game (move, attack, chat).
- If a player just wants to talk, respond with conversational text (no tool call).
- Keep chat messages SHORT — Minecraft chat has a 256 character limit.
- Be aware of your health and hunger levels. If critically low, mention it.
- When pathfinding, confirm the destination after arriving.
- Be friendly but not overly chatty.`;

export class MineAIAgent {
  private manager: BotManager;
  private llm: LLMClient;
  private config: MineAIConfig;
  private bot: IBot | null = null;

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
    this.config = config;

    // Event-based: wait for the bot to be ready instead of a fragile setTimeout
    if (manager.bot) {
      this.attachToBot(manager.bot);
    }
    manager.on("ready", (bot: IBot) => {
      this.attachToBot(bot);
    });
  }

  private attachToBot(bot: IBot) {
    this.bot = bot;
    console.log(`[mineAI Agent] Brain attached to bot pipeline.`);

    bot.on("chat", async (username, message) => {
      if (!this.config.llm.enableChat) return; // Feature disabled for safety
      if (username === bot.username) return;
      const trigger = this.config.llm.triggerWord || "rose";
      if (message.toLowerCase().includes(trigger.toLowerCase())) {
        await this.processGoal(message);
      }
    });
  }

  private buildContext(): string {
    const bot = this.bot;
    if (!bot || !bot.position) return "Loading state...";

    const pos = bot.position;
    const health = bot.health;
    const food = bot.food;

    // Combine: built-in prompt + user prompt + live game state
    const userPrompt = this.config.llm.userPrompt || "";

    return `${BUILT_IN_PROMPT}

${userPrompt ? `Additional instructions from the server operator:\n${userPrompt}\n` : ""}
Your current status:
- Health: ${health}/20
- Hunger: ${food}/20
- Location: X:${Math.floor(pos.x)} Y:${Math.floor(pos.y)} Z:${Math.floor(pos.z)}

You can use tools to perform your actions. If you don't need a tool, just respond with conversational text.`;
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
        this.bot?.chat(response.content);
      }
    } catch(err: any) {
      console.error(`[mineAI Agent Error]`, err.message);
    }
  }

  private async executeTool(name: string, args: any) {
    console.log(`[mineAI Agent] Executing Tool: ${name}`, args);
    const bot = this.bot;
    if (!bot) return;

    try {
      if (name === "chat") {
        bot.chat(args.message);
      } else if (name === "goTo") {
        await bot.goTo(args.x, args.y, args.z);
        bot.chat(`I have arrived at ${args.x}, ${args.y}, ${args.z}`);
      } else if (name === "attackEntity") {
        try {
          await bot.attackEntity(args.entityName);
          bot.chat(`Attacking ${args.entityName}!`);
        } catch(e) {
          bot.chat(`I couldn't find any ${args.entityName} nearby.`);
        }
      }
    } catch (err: any) {
      console.error(`[mineAI Tool Error] ${err}`);
    }
  }
}
