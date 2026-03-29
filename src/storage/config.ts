import fs from "fs";
import path from "path";
import yaml from "yaml";

export interface MineAIConfig {
  llm: {
    provider: "openai" | "gemini" | "anthropic" | "groq";
    api_key: string;
    model: string;
  };
  minecraft: {
    host: string;
    port: number;
    username: string;
    auth: "offline" | "microsoft";
  };
}

const CONFIG_PATH = path.join(process.cwd(), "config.yaml");

const DEFAULT_CONFIG: MineAIConfig = {
  llm: {
    provider: "openai",
    api_key: "",
    model: "gpt-4o",
  },
  minecraft: {
    host: "localhost",
    port: 25565,
    username: "mineAI",
    auth: "offline",
  },
};

export function loadConfig(): MineAIConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
  const fileParams = fs.readFileSync(CONFIG_PATH, "utf-8");
  return yaml.parse(fileParams) as MineAIConfig;
}

export function saveConfig(config: MineAIConfig) {
  fs.writeFileSync(CONFIG_PATH, yaml.stringify(config));
}
