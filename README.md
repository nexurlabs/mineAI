# mineAI — LLM-powered Minecraft bot runtime

mineAI is a self-hosted Minecraft bot runtime that lets an LLM-controlled agent join a server, listen for chat triggers, and use tool calls for in-game actions.

It is built by NexurLabs for experiments in game agents, Minecraft automation, and live AI behavior inside player worlds.

## What mineAI does today

- Joins vanilla Minecraft servers through Mineflayer
- Detects server type and chooses a vanilla or Forge pipeline
- Provides a Forge companion bridge for modded-server experiments
- Listens for a configurable trigger word, default: `rose`
- Routes triggered chat through an LLM provider
- Supports Groq, OpenAI, Gemini, and Anthropic provider choices in onboarding
- Can execute basic in-game tools such as chat, movement, and combat-oriented actions
- Starts a local dashboard/API/WebSocket layer on port `8080`
- Supports daemon lifecycle commands: start, status, logs, stop, update

## Verified status

The current repository was checked locally with Node.js:

```bash
npm install
npm run build
node --import tsx/esm src/cli/index.ts --help
npm --prefix dashboard install
npm --prefix dashboard run build
```

Result: TypeScript build passes, CLI help renders correctly, and the Vite dashboard production build succeeds.

## Quick start

```bash
curl -fsSL https://raw.githubusercontent.com/nexurlabs/mineAI/main/install.sh | bash
```

Then:

```bash
node --import tsx/esm src/cli/index.ts start --daemon
node --import tsx/esm src/cli/index.ts status
```

## Documentation

- [Getting Started](getting-started.md)
- [Installation](installation.md)
- [Configuration](configuration.md)
- [Commands](commands.md)
- [Dashboard](dashboard.md)
- [Forge Companion](forge-companion.md)
- [Architecture](architecture.md)
- [Deployment](deployment.md)
- [Troubleshooting](troubleshooting.md)
- [Verification](verification.md)

## Project structure

```text
mineAI/
├── src/                 # CLI, bot runtime, LLM agent, storage, WebSocket server
├── dashboard/           # Vite dashboard UI
├── forge-companion/     # Java/Forge companion bridge project
├── install.sh           # Linux/macOS installer
├── install.ps1          # Windows PowerShell installer
└── *.md                 # Documentation site pages
```

## Privacy model

mineAI is self-hosted. It connects to the Minecraft server you configure and sends triggered context to the LLM provider you choose. API keys and server config stay in your local configuration unless you deploy it elsewhere.

## License

MIT — built by [NexurLabs](https://nexurlabs.com).
