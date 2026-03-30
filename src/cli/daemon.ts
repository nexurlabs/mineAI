import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(process.cwd(), ".mineai");
const LOG_FILE = path.join(DATA_DIR, "mineai.log");
const PID_FILE = path.join(DATA_DIR, "mineai.pid");

export function startDaemon() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const scriptPath = path.join(__dirname, "runner.js");
  if (!fs.existsSync(scriptPath)) {
    fs.writeFileSync(scriptPath, `
const { spawnSync } = require("child_process");
const cliPath = process.argv[2];
while (true) {
  console.log("[mineAI Daemon] Starting bot process...");
  const res = spawnSync("node", ["--import", "tsx/esm", cliPath, "start-internal"], { stdio: "inherit" });
  console.log("[mineAI Daemon] Process exited with code: " + res.status);
  if (res.status === 255) break;
}
    `);
  }

  const out = fs.openSync(LOG_FILE, "a");
  const err = fs.openSync(LOG_FILE, "a");

  console.log("Starting mineAI in the background...");
  
  const child = spawn("node", [scriptPath, path.join(__dirname, "index.ts")], {
    detached: true,
    stdio: ["ignore", out, err],
  });

  fs.writeFileSync(PID_FILE, child.pid!.toString());
  child.unref();

  console.log(`✅ mineAI is running in the background! (PID: ${child.pid})`);
  console.log(`📝 Logs: ${LOG_FILE}`);
}

export function stopDaemon() {
  if (fs.existsSync(PID_FILE)) {
    const pid = fs.readFileSync(PID_FILE, "utf-8").trim();
    try {
      if (process.platform === "win32") {
          const { execSync } = require("child_process");
          execSync(`taskkill /pid ${pid} /T /F`);
      } else {
          process.kill(parseInt(pid, 10), "SIGTERM");
      }
      console.log(`🛑 Stopped mineAI daemon (PID: ${pid}).`);
    } catch(e) {
      console.log(`⚠️  Could not kill process ${pid}. It might already be dead.`);
    }
    fs.unlinkSync(PID_FILE);
  } else {
    console.log(`ℹ️  No PID file found. Is mineAI running in the background?`);
  }
}
