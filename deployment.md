# Deployment

mineAI is easiest to run on the same machine or network as the Minecraft server, especially for private/offline-mode testing.

## Local machine

```bash
npm install
npm run build
node --import tsx/esm src/cli/index.ts onboard
node --import tsx/esm src/cli/index.ts start --daemon
```

## VPS or always-on host

Use a VPS only if it can reach the Minecraft server reliably.

```bash
git clone https://github.com/nexurlabs/mineAI.git
cd mineAI
npm install
npm run build
node --import tsx/esm src/cli/index.ts onboard
node --import tsx/esm src/cli/index.ts start --daemon
```

## systemd example

Create `/etc/systemd/system/mineai.service`:

```ini
[Unit]
Description=mineAI Minecraft Agent
After=network.target

[Service]
Type=simple
User=YOUR_USER
WorkingDirectory=/home/YOUR_USER/mineAI
ExecStart=/usr/bin/node --import tsx/esm src/cli/index.ts start
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mineai
journalctl -u mineai -f
```

## Networking

mineAI needs outbound access to:

- Your Minecraft server host/port
- Your LLM provider over HTTPS
- npm/GitHub for installation and updates

Avoid exposing dashboard/runtime ports publicly unless protected by a reverse proxy and authentication.
