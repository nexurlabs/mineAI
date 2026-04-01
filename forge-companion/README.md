# mineAI Forge Companion

Forge-side bridge for mineAI when it connects to a modded server.
It keeps the Java/Forge side separate from the main mineAI runtime and speaks through a lightweight local WebSocket bridge.

## What it is for

- connect mineAI to Forge modded servers
- expose in-game state back to the main runtime
- keep the Forge path separate from the vanilla bot pipeline
- bridge simple commands between Java and mineAI

## Bridge protocol

The current proof-of-concept bridge is intentionally simple:

- mineAI opens a local WebSocket server on port `25577`
- the Forge/Java side connects to that socket
- mineAI sends commands like `chat`, `goto`, and `attack`
- the bridge sends state events back such as `spawn`, `chat`, `health`, and `position`
- the dashboard layer mirrors that state for the UI and agent runtime

## Current status

This companion is the Forge bridge layer in the dual-pipeline setup.
It stays small on purpose; the main mineAI runtime still handles orchestration, LLM routing, and lifecycle.

How it fits into the runtime:

1. mineAI pings the server at startup to detect Forge tags.
2. If Forge is detected, the main runtime selects the Forge pipeline.
3. The Forge pipeline exposes a local WebSocket bridge on port `25577`.
4. The Java/Forge side connects to that bridge and exchanges lightweight events.
5. mineAI keeps handling chat triggers, tool selection, and dashboard sync.

## Build

From this folder:

```bash
./gradlew build
```

On Windows:

```powershell
.\gradlew.bat build
```

The re-obfuscated jar is written under:

```text
build/libs/
```

## Development notes

- Java 17 is required.
- Use the Forge Gradle wrapper that ships with the project.
- If Gradle gets confused, try `./gradlew clean build`.

## Project files

- `build.gradle` — Forge Gradle setup
- `gradle.properties` — mod and Minecraft version settings
- `README.txt` — upstream Forge MDK notes kept for reference
- `changelog.txt`, `CREDITS.txt`, `LICENSE.txt` — bundled project docs

## Troubleshooting

- If dependencies fail to resolve, rerun with `--refresh-dependencies`.
- If IDE run configs are stale, regenerate them with the Gradle tasks recommended by Forge.
- If the bridge jar is missing, make sure the build finished successfully and check `build/reobfJar/`.
