// mineAI Dashboard API Client
const API_BASE = "http://localhost:8080/api";

export interface MineAIConfig {
  llm: {
    provider: string;
    api_key: string;
    model: string;
    systemPrompt: string;
  };
  minecraft: {
    host: string;
    port: number;
    username: string;
    auth: "offline" | "microsoft";
  };
}

export async function fetchConfig(): Promise<MineAIConfig> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error("Failed to fetch config");
  return res.json();
}

export async function saveConfig(config: MineAIConfig): Promise<void> {
  const res = await fetch(`${API_BASE}/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error("Failed to save config");
}

export async function fetchStatus(): Promise<{ running: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (res.ok) return res.json();
    return { running: false };
  } catch (e) {
    return { running: false };
  }
}
