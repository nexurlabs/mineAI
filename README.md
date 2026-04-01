# mineAI

> LLM-powered Minecraft bot that can join your server, react to chat, and use tool calls for in-game actions.

mineAI is NexUrlLabs' Minecraft bot runtime.

It runs two paths:
- **Vanilla pipeline** for standard Minecraft servers
- **Forge pipeline** for Forge modded servers via the bundled companion bridge

It listens for trigger phrases, routes them through an LLM, and handles actions like chat, movement, and combat.

---

## What works today

- TypeScript build and CLI
- Interactive onboarding
- Live Minecraft join on vanilla servers
- Dual pipeline selection (vanilla vs Forge)
- Forge companion Java project builds successfully
- Groq-backed in-game trigger + tool execution
- Gemini support
- Anthropic support
- Env-var API key fallback for all supported providers
- Daemon/background mode
- `status`, `logs`, `stop`, and `update` commands

---

## Fastest way to use mineAI

```bash
curl -fsSL https://raw.githubusercontent.com/nexurlabs/mineAI/main/install.sh | bash
```

The installer clones or updates the repo, installs dependencies, builds the project, launches onboarding, and offers to start mineAI in daemon mode.

After that, the usual commands are:

```bash
node --import tsx/esm src/cli/index.ts start --daemon
node --import tsx/esm src/cli/index.ts status
```

---

## Install

### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/nexurlabs/mineAI/main/install.sh | bash
```

### Windows (PowerShell)
```powershell
powershell -c "irm https://raw.githubusercontent.com/nexurlabs/mineAI/main/install.ps1 | iex"
```

The installer will:
- clone or update the repo automatically
- install dependencies
- build the project
- launch onboarding automatically
- offer to start mineAI immediately in daemon mode

### What the installer does
1. checks for Git and Node.js
2. clones or updates mineAI into a default folder
3. installs npm dependencies
4. builds the TypeScript project
5. launches onboarding automatically
6. starts the bot in daemon mode if you say yes

---

## Manual start

After install:

```bash
node --import tsx/esm src/cli/index.ts start --daemon
```

Useful companion commands:

```bash
node --import tsx/esm src/cli/index.ts status
node --import tsx/esm src/cli/index.ts logs
node --import tsx/esm src/cli/index.ts stop
node --import tsx/esm src/cli/index.ts update
```

---

## Onboarding asks for

- AI provider
- API key
- model
- Minecraft host
- Minecraft port
- bot username
- auth mode (`offline` or `microsoft`)

If you use env vars instead of a saved key, you can leave the API key blank during onboarding.

---

## Daily use

### Start the bot
```bash
node --import tsx/esm src/cli/index.ts start --daemon
```

### Check health
```bash
node --import tsx/esm src/cli/index.ts status
```

### View logs
```bash
node --import tsx/esm src/cli/index.ts logs
```

### Stop the daemon
```bash
node --import tsx/esm src/cli/index.ts stop
```

### Update the checkout
```bash
node --import tsx/esm src/cli/index.ts update
```

---

## Development

```bash
npm install
npm run build
node --import tsx/esm src/cli/index.ts onboard
node --import tsx/esm src/cli/index.ts start --daemon
```

---

## Testing status

Last verified locally:
- `npm run build` ✅
- `node --import tsx/esm src/cli/index.ts --help` ✅
- `node --import tsx/esm src/cli/index.ts start --daemon` ✅ (writes `.mineai/mineai.pid` and `.mineai/mineai.log`)
- `node --import tsx/esm src/cli/index.ts status` ✅ (reports running when the PID file exists; clears stale PID files)
- `node --import tsx/esm src/cli/index.ts logs` ✅ (tails the daemon log file)
- `node --import tsx/esm src/cli/index.ts stop` ✅ (stops the daemon and clears the PID file)
- Forge companion Java build ✅

Known limitation:
- if the Minecraft server is offline, mineAI will wait and retry instead of joining immediately
- the Forge pipeline still behaves like a lightweight bridge/proof-of-concept rather than a full Forge client implementation

---

## Troubleshooting

### Windows
- Run the PowerShell command in **PowerShell**, not Command Prompt.
- If `winget` is missing, install **App Installer** from the Microsoft Store first.
- If Node.js was just installed, close and reopen PowerShell before retrying.
- If script execution is blocked, run:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
  ```

### Linux / macOS
- If `node` or `npm` is missing, install a current LTS version and rerun the installer.
- If onboarding exits because stdin closes, rerun the installed command interactively.
- If the bot starts but doesn’t join the server, run `mineai status` first.

---

## Architecture

mineAI is intentionally small:

- CLI for setup and lifecycle
- Mineflayer bot runtime for vanilla servers
- Forge companion bridge for modded servers
- LLM adapter layer
- Lightweight WebSocket bridge for dashboard/state sync

See `forge-companion/README.md` for the Forge bridge details.

---

## Runtime flow

### Foreground start
1. `mineai start` loads config
2. the dashboard API + WebSocket server starts on port `8080`
3. `BotManager` pings the Minecraft server to detect vanilla vs Forge tags
4. the matching bot pipeline is created
5. `MineAIAgent` attaches trigger parsing and tool execution on top of that bot

### Daemon start
1. `mineai start --daemon` creates `.mineai/mineai.log` and `.mineai/mineai.pid`
2. a tiny `runner.cjs` wrapper keeps the process alive in the background
3. the wrapper relaunches `start-internal` if the bot exits unexpectedly
4. `mineai stop` reads the PID file and stops the background process

### Forge bridge path
1. Forge detection happens during the initial server ping
2. `ForgeBot` starts a small local WebSocket bridge on port `25577`
3. the Java/Forge side talks to that bridge using simple commands like `chat`, `goto`, and `attack`
4. the bridge sends state back as events like `spawn`, `chat`, `health`, and `position`
5. the dashboard and agent layer mirror that state for the UI and tool loop

---

## License

MIT — built by NexUrlLabs.
