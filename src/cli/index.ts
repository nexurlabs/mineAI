#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const program = new Command();

program
  .name("mineai")
  .description("mineAI — Intelligent LLM-powered Minecraft bot")
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
  .option("-d, --daemon", "Run the bot in the background")
  .action(async (options) => {
    if (options.daemon) {
      const { startDaemon } = await import("./daemon.js");
      startDaemon();
      return;
    }

    const { loadConfig } = await import("../storage/config.js");
    const { initWebSocketServer } = await import("../web/ws.js");
    const { BotManager } = await import("../bot/manager.js");
    const { MineAIAgent } = await import("../brain/agent.js");

    const config = loadConfig();
    console.log("Starting mineAI... 🌹");
    
    // 1. Initialize Dashboard API & Sync
    initWebSocketServer(8080);
    
    // 2. Spawn the Body
    const manager = new BotManager(config);

    // 3. Connect the Brain
    new MineAIAgent(manager, config);
  });

program
  .command("start-internal")
  .description("Internal hidden command for the daemon loop to execute")
  .action(async () => {
    const { loadConfig } = await import("../storage/config.js");
    const { initWebSocketServer } = await import("../web/ws.js");
    const { BotManager } = await import("../bot/manager.js");
    const { MineAIAgent } = await import("../brain/agent.js");

    const config = loadConfig();
    initWebSocketServer(8080);
    const manager = new BotManager(config);
    new MineAIAgent(manager, config);
  });

program
  .command("stop")
  .description("Stop the background daemon")
  .action(async () => {
    const { stopDaemon } = await import("./daemon.js");
    stopDaemon();
  });

program
  .command("status")
  .description("Check if mineAI is running")
  .action(() => {
    const PID_FILE = path.join(process.cwd(), ".mineai", "mineai.pid");
    if (fs.existsSync(PID_FILE)) {
        const pid = fs.readFileSync(PID_FILE, "utf-8").trim();
        console.log(`🟢 mineAI is running in the background (PID: ${pid}).`);
    } else {
        console.log(`🔴 mineAI is not currently running.`);
    }
  });

program
  .command("logs")
  .description("Tail the daemon logs")
  .action(() => {
    const LOG_FILE = path.join(process.cwd(), ".mineai", "mineai.log");
    if (!fs.existsSync(LOG_FILE)) {
      console.log("No logs found. Is the daemon running?");
      return;
    }
    console.log(`Tailing ${LOG_FILE}... (Ctrl+C to exit)`);
    if (process.platform === "win32") {
        execSync(`powershell -c Get-Content -Path '${LOG_FILE}' -Wait -Tail 20`, { stdio: 'inherit' });
    } else {
        execSync(`tail -f -n 20 ${LOG_FILE}`, { stdio: 'inherit' });
    }
  });

program.parse(process.argv);
