# Commands

Run commands from the mineAI checkout.

## CLI command surface

```bash
node --import tsx/esm src/cli/index.ts --help
```

Current commands:

| Command | Purpose |
|---|---|
| `onboard` | Interactive setup for provider key, model, trigger word, server address, username, and auth |
| `start` | Start mineAI in the foreground |
| `start --daemon` | Start mineAI in the background |
| `start-internal` | Internal daemon-loop command, not for normal users |
| `status` | Check whether the daemon PID is alive |
| `logs` | Tail `.mineai/mineai.log` |
| `stop` | Stop the background daemon |
| `help [command]` | Show help |

## Common flow

```bash
node --import tsx/esm src/cli/index.ts onboard
node --import tsx/esm src/cli/index.ts start --daemon
node --import tsx/esm src/cli/index.ts status
node --import tsx/esm src/cli/index.ts logs
node --import tsx/esm src/cli/index.ts stop
```

## If installed as a package/bin

The package exposes a `mineai` binary after build/install. In that case, the equivalent commands are:

```bash
mineai onboard
mineai start --daemon
mineai status
mineai logs
mineai stop
```
