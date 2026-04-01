import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(process.cwd(), ".mineai");
const LOG_FILE = path.join(DATA_DIR, "mineai.log");
const PID_FILE = path.join(DATA_DIR, "mineai.pid");

export function isPidAlive(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function startDaemon() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(PID_FILE)) {
    const existingPid = parseInt(fs.readFileSync(PID_FILE, "utf-8").trim(), 10);
    if (Number.isFinite(existingPid) && isPidAlive(existingPid)) {
      console.log(`ℹ️  mineAI is already running in the background (PID: ${existingPid}).`);
      return;
    }
    try {
      fs.unlinkSync(PID_FILE);
    } catch {}
  }

  const out = fs.openSync(LOG_FILE, "a");
  const err = fs.openSync(LOG_FILE, "a");

  console.log("Starting mineAI in the background...");

  const child = spawn(process.execPath, ["--import", "tsx/esm", path.join(__dirname, "index.ts"), "start-internal"], {
    detached: true,
    stdio: ["ignore", out, err],
  });

  if (!child.pid) {
    throw new Error("Failed to start mineAI daemon process.");
  }

  fs.writeFileSync(PID_FILE, child.pid.toString());
  child.unref();

  console.log(`✅ mineAI is running in the background! (PID: ${child.pid})`);
  console.log(`📝 Logs: ${LOG_FILE}`);
}

export function stopDaemon() {
  if (!fs.existsSync(PID_FILE)) {
    console.log(`ℹ️  No PID file found. Is mineAI running in the background?`);
    return;
  }

  const pidText = fs.readFileSync(PID_FILE, "utf-8").trim();
  const pid = parseInt(pidText, 10);

  try {
    if (!Number.isFinite(pid)) {
      throw new Error(`Invalid PID: ${pidText}`);
    }

    if (process.platform === "win32") {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: "ignore" });
    } else {
      try {
        process.kill(-pid, "SIGTERM");
      } catch {
        process.kill(pid, "SIGTERM");
      }
    }

    console.log(`🛑 Stopped mineAI daemon (PID: ${pid}).`);
  } catch (e) {
    console.log(`⚠️  Could not kill process ${pidText}. It might already be dead.`);
  } finally {
    try {
      fs.unlinkSync(PID_FILE);
    } catch {}
  }
}
