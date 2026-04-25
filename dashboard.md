# Dashboard

mineAI starts a local dashboard/API/WebSocket layer on port `8080` when the bot starts.

## Runtime port

```text
http://localhost:8080
```

The WebSocket layer is used for runtime state sync between the bot and dashboard surfaces.

## Dashboard source

```text
dashboard/
```

It is a Vite + React dashboard project.

## Build dashboard

```bash
npm --prefix dashboard install
npm --prefix dashboard run build
```

Verified result: production build succeeds and writes output to `dashboard/dist/`.

## Security note

Keep the dashboard local unless you deliberately put it behind HTTPS and access control. Do not expose raw local agent/dashboard ports publicly on a VPS.
