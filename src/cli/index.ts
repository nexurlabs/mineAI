#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("roseguard")
  .description("Intelligent LLM-powered Minecraft bot")
  .version("1.0.0");

program
  .command("onboard")
  .description("Setup the bot by adding API keys and Minecraft server address")
  .action(async () => {
    const { onboard } = await import("./onboard.js");
    await onboard();
  });

program
  .command("start")
  .description("Connect the bot to the server and spin up the local web dashboard")
  .action(async () => {
    const { loadConfig } = await import("../storage/config.js");
    const { initWebSocketServer } = await import("../web/ws.js");
    const { BotManager } = await import("../bot/manager.js");
    const { RoseGuardAgent } = await import("../brain/agent.js");

    const config = loadConfig();
    console.log("Starting RoseGuard... 🌹");
    
    // 1. Initialize Dashboard WebSocket Sync
    initWebSocketServer(8080);
    
    // 2. Spawn the Body
    const manager = new BotManager(config);

    // 3. Connect the Brain
    new RoseGuardAgent(manager, config);
  });

program.parse(process.argv);
