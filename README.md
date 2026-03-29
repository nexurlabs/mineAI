# mineAI / RoseGuard

> LLM-powered Minecraft bot that can join your server, react to chat, and use tool calls for in-game actions.

RoseGuard is the current mineAI bot runtime from NexUrlLabs. It can connect to a Minecraft server, listen for trigger phrases, route them through an LLM, and execute actions like chat and movement.

---

## Quick Start

### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/nexurlabs/mineAI/main/install.sh | bash
```

### Windows (PowerShell)
```powershell
powershell -c "irm https://raw.githubusercontent.com/nexurlabs/mineAI/main/install.ps1 | iex"
```

These installers will:
- clone or update the repo automatically
- install dependencies
- build the project
- launch onboarding automatically

---

## Manual Start

After install:

```bash
node --import tsx/esm src/cli/index.ts start
```

---

## What onboarding asks for

- AI provider
- API key
- model
- Minecraft host
- Minecraft port
- bot username
- auth mode (`offline` or `microsoft`)

---

## Current Status

Working now:
- TypeScript build
- CLI
- onboarding
- live Minecraft join
- Groq-backed in-game trigger + tool execution

Still rough / future polish:
- Gemini path is still WIP
- Anthropic is not fully implemented
- dashboard frontend is still minimal

---

## Development

```bash
npm install
npm run build
node --import tsx/esm src/cli/index.ts onboard
node --import tsx/esm src/cli/index.ts start
```

---

## License

MIT — built by NexUrlLabs.
