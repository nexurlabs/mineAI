#!/usr/bin/env node
import { Command } from "commander";
import { onboard } from "./onboard.js";
import { loadConfig } from "../storage/config.js";
import { initWebSocketServer } from "../web/ws.js";
import { BotManager } from "../bot/manager.js";
import { RoseGuardAgent } from "../brain/agent.js";

const program = new Command();

program
  .name("roseguard")
  .description("Intelligent LLM-powered Minecraft bot")
  .version("1.0.0");

program
  .command("onboard")
  .description("Setup the bot by adding API keys and Minecraft server address")
  .action(() => {
    onboard();
  });

program
  .command("start")
  .description("Connect the bot to the server and spin up the local web dashboard")
  .action(() => {
    const config = loadConfig();
    console.log("Starting RoseGuard... 🌹");
    
    // 1. Initialize Dashboard WebSocket Sync
    initWebSocketServer(8080);
    
    // 2. Spawn the Body
    const manager = new BotManager(config);

    // 3. Connect the Brain
    const agent = new RoseGuardAgent(manager, config);
  });

program.parse(process.argv);
