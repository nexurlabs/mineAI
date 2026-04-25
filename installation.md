# Installation

## Linux/macOS quick install

```bash
curl -fsSL https://raw.githubusercontent.com/nexurlabs/mineAI/main/install.sh | bash
```

The installer:

1. Checks for Git and Node.js
2. Clones or updates mineAI
3. Installs npm dependencies
4. Builds the TypeScript project
5. Launches onboarding
6. Offers to start mineAI in daemon mode

## Windows PowerShell

```powershell
powershell -c "irm https://raw.githubusercontent.com/nexurlabs/mineAI/main/install.ps1 | iex"
```

If script execution is blocked:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Manual install

```bash
git clone https://github.com/nexurlabs/mineAI.git
cd mineAI
npm install
npm run build
node --import tsx/esm src/cli/index.ts onboard
```

Start in the foreground:

```bash
node --import tsx/esm src/cli/index.ts start
```

Start as a daemon:

```bash
node --import tsx/esm src/cli/index.ts start --daemon
```

## Optional dashboard build

```bash
npm --prefix dashboard install
npm --prefix dashboard run build
```

## Optional Forge companion build

```bash
cd forge-companion
./gradlew build
```

Windows:

```powershell
cd forge-companion
.\gradlew.bat build
```
