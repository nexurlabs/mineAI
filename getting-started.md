# Getting Started

mineAI is for running an AI-controlled Minecraft bot in your own server environment.

## Good use cases

- A helper bot for a private Minecraft server
- Experiments with LLM agents in game worlds
- Tool-calling demos with real-time world feedback
- Vanilla Mineflayer automation
- Early Forge/modded-server bridge experiments

## What you need

| Requirement | Why |
|---|---|
| Node.js LTS | Runs the TypeScript/JavaScript runtime |
| npm | Installs dependencies and builds the project |
| Git | Installer/update flow |
| Minecraft server address | Host and port for the bot to join |
| LLM API key | Provider used as the bot's brain |
| Java 17 | Only needed for the Forge companion build |

## How mineAI behaves

1. You run onboarding and save provider/server config.
2. `mineai start` loads the config.
3. A local dashboard/WebSocket server starts on port `8080`.
4. `BotManager` pings the Minecraft server to detect vanilla vs Forge path.
5. The bot joins using the configured username/auth mode.
6. The agent listens for the trigger word and turns LLM output into tool calls.

## Important expectations

- mineAI is a bot account/runtime, not a replacement for the Minecraft client UI.
- Offline-mode servers are easiest for testing.
- Microsoft auth is intended for official/online-mode servers, but may require extra setup depending on the environment.
- If the server is offline, mineAI waits/retries instead of succeeding immediately.

## Next step

Go to [Installation](installation.md).
