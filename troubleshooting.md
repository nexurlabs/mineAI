# Troubleshooting

## Build fails

```bash
node --version
npm --version
npm install
npm run build
```

Use a current Node.js LTS or newer.

## Bot does not join server

Check:

1. Minecraft host and port are correct.
2. Server is online.
3. Auth mode matches the server: `offline` for offline/LAN tests, `microsoft` for online-mode.
4. Bot username is allowed on the server.
5. Firewall allows outbound connection to the Minecraft server.

Run:

```bash
node --import tsx/esm src/cli/index.ts status
node --import tsx/esm src/cli/index.ts logs
```

## No response to chat

Check:

- You used the configured trigger word, default `rose`.
- Provider API key is configured or available through environment variables.
- The selected model exists for that provider.
- Logs do not show provider authentication errors.

## Daemon status is wrong

If a stale PID file exists, `status` should clear it when the PID is no longer alive. You can also stop and restart:

```bash
node --import tsx/esm src/cli/index.ts stop
node --import tsx/esm src/cli/index.ts start --daemon
```

## Dashboard is unavailable

The runtime dashboard/WebSocket layer starts when mineAI starts. Check whether port `8080` is already in use:

```bash
lsof -i :8080
```

## Forge companion issues

- Make sure Java 17 is installed.
- Build from inside `forge-companion/`.
- Try `./gradlew clean build`.
- Remember: Forge support is a lightweight bridge path, not the primary stable path.

## npm audit warnings

Current dependency audits may report vulnerabilities. Review carefully before using `npm audit fix --force`, because force upgrades can break Minecraft/Mineflayer or dashboard compatibility.
