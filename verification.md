# Verification

This is the current verification state of mineAI.

## Commands run

```bash
npm install
npm run build
node --import tsx/esm src/cli/index.ts --help
npm --prefix dashboard install
npm --prefix dashboard run build
```

## Result

- Root TypeScript build passed.
- CLI help rendered and listed commands: `onboard`, `start`, `start-internal`, `stop`, `status`, `logs`, `help`.
- Dashboard production build passed with Vite.

## Audit notes

- Root `npm audit` reported 15 vulnerabilities.
- Dashboard `npm audit` reported 2 vulnerabilities.
- No forced dependency fixes were applied because breaking upgrades can destabilize Mineflayer, Minecraft protocol packages, or Vite/React compatibility.

## Live server test

A full live Minecraft join test requires a reachable Minecraft server and configured credentials. After onboarding, test with:

```bash
node --import tsx/esm src/cli/index.ts start --daemon
node --import tsx/esm src/cli/index.ts status
node --import tsx/esm src/cli/index.ts logs
```

Then in Minecraft chat:

```text
rose hello
```
