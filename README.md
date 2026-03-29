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

### What the installer does
1. checks for Git and Node.js
2. clones or updates mineAI into a default folder
3. installs npm dependencies
4. builds the TypeScript project
5. launches onboarding automatically

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
- If onboarding exits because stdin closes, just rerun the installed command interactively.

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
