# Forge Companion

The Forge companion is the modded-server bridge path for mineAI.

Source:

```text
forge-companion/
```

## What it does

- Keeps Java/Forge code separate from the main Node.js runtime
- Connects to a local WebSocket bridge exposed by mineAI
- Exchanges lightweight commands and events
- Lets the main mineAI runtime keep handling LLM routing, orchestration, and dashboard sync

## Bridge protocol

Current proof-of-concept flow:

1. mineAI detects Forge tags during server ping.
2. The Forge path starts a local WebSocket bridge on port `25577`.
3. The Java/Forge side connects to the bridge.
4. mineAI sends commands such as `chat`, `goto`, and `attack`.
5. The bridge sends events such as `spawn`, `chat`, `health`, and `position`.

## Build

Java 17 is required.

```bash
cd forge-companion
./gradlew build
```

Windows:

```powershell
cd forge-companion
.\gradlew.bat build
```

The jar output appears under:

```text
forge-companion/build/libs/
```

## Current status

The Forge companion is intentionally lightweight. Treat it as a bridge/proof-of-concept path while the vanilla Mineflayer pipeline is the cleaner default path.
