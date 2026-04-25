# Architecture

mineAI is intentionally small and split into clear runtime layers.

## Runtime layers

```text
CLI / daemon lifecycle
  -> config loader
  -> dashboard + WebSocket server
  -> BotManager
  -> vanilla or Forge bot pipeline
  -> MineAIAgent
  -> LLM provider adapter
  -> tool execution in Minecraft
```

## Main folders

| Folder | Purpose |
|---|---|
| `src/cli/` | Onboarding, start, daemon, status, logs, stop |
| `src/storage/` | Config loading/saving |
| `src/bot/` | Bot manager plus vanilla/Forge bot paths |
| `src/brain/` | LLM agent/tool loop |
| `src/web/` | Local WebSocket/dashboard server |
| `dashboard/` | React/Vite dashboard UI |
| `forge-companion/` | Java/Forge bridge project |

## Vanilla path

The vanilla path uses Mineflayer for normal Minecraft servers.

## Forge path

The Forge path uses a lightweight bridge. The main runtime still owns the agent logic, while the Forge companion exchanges simple commands/events through WebSocket.

## Daemon mode

`start --daemon` creates:

```text
.mineai/mineai.pid
.mineai/mineai.log
```

A small runner wrapper keeps the bot process alive and relaunches `start-internal` if needed.
