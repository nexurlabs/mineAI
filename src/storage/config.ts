import fs from "fs";
import path from "path";
import yaml from "yaml";

export interface MineAIConfig {
  llm: {
    provider: "openai" | "gemini" | "anthropic" | "groq";
    api_key: string;
    model: string;
    systemPrompt: string;
    userPrompt: string;
    triggerWord: string;
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
    provider: "groq",
    api_key: "",
    model: "llama-3.3-70b-versatile",
    systemPrompt: "You are mineAI, an intelligent Minecraft agent. Use your tools to perform actions.",
    userPrompt: "",
    triggerWord: "rose",
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
  const parsed = yaml.parse(fileParams) as Partial<MineAIConfig>;

  // Merge with defaults to ensure new fields exist even on old configs
  return {
    llm: { ...DEFAULT_CONFIG.llm, ...parsed.llm },
    minecraft: { ...DEFAULT_CONFIG.minecraft, ...parsed.minecraft },
  };
}

export function saveConfig(config: MineAIConfig) {
  fs.writeFileSync(CONFIG_PATH, yaml.stringify(config));
}

/**
 * Return config with API key redacted — safe to send over HTTP.
 */
export function loadConfigRedacted(): Omit<MineAIConfig, "llm"> & { llm: Omit<MineAIConfig["llm"], "api_key"> & { api_key: string } } {
  const config = loadConfig();
  return {
    ...config,
    llm: {
      ...config.llm,
      api_key: config.llm.api_key ? "••••••••" + config.llm.api_key.slice(-4) : "",
    },
  };
}
