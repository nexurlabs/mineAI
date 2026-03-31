#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/nexurlabs/mineAI.git"
DEFAULT_DIR="${HOME}/.nexurlabs/mineAI"
INSTALL_DIR="${MINEAI_DIR:-$DEFAULT_DIR}"

have() { command -v "$1" >/dev/null 2>&1; }
log() { printf '\n==> %s\n' "$1" >&2; }
warn() { printf '\n[warn] %s\n' "$1" >&2; }

ensure_sudo() {
  if have sudo; then
    sudo "$@"
  else
    "$@"
  fi
}

install_linux_pkgs() {
  if have apt-get; then
    ensure_sudo apt-get update
    ensure_sudo apt-get install -y "$@"
  elif have dnf; then
    ensure_sudo dnf install -y "$@"
  elif have pacman; then
    ensure_sudo pacman -Sy --noconfirm "$@"
  else
    warn "No supported package manager found. Please install manually: $*"
    return 1
  fi
}

ensure_git() {
  if have git; then return 0; fi
  log "Installing git"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    if ! have brew; then
      warn "Homebrew is required to auto-install git on macOS. Install brew first: https://brew.sh"
      exit 1
    fi
    brew install git
  else
    install_linux_pkgs git
  fi
}

ensure_node() {
  if have node && have npm; then return 0; fi
  log "Installing Node.js + npm"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    if ! have brew; then
      warn "Homebrew is required to auto-install Node.js on macOS. Install brew first: https://brew.sh"
      exit 1
    fi
    brew install node
  else
    if have apt-get; then
      ensure_sudo apt-get update
      ensure_sudo apt-get install -y nodejs npm
    else
      install_linux_pkgs nodejs npm
    fi
  fi
}

resolve_repo_dir() {
  if [[ -f "package.json" ]] && grep -q '"name": "mineai"' package.json; then
    pwd
    return
  fi

  ensure_git
  mkdir -p "$(dirname "$INSTALL_DIR")"
  if [[ -d "$INSTALL_DIR/.git" ]]; then
    log "Updating existing mineAI checkout at $INSTALL_DIR"
    git -C "$INSTALL_DIR" pull --ff-only >&2
  else
    log "Cloning mineAI into $INSTALL_DIR"
    git clone "$REPO_URL" "$INSTALL_DIR" >&2
  fi
  printf '%s\n' "$INSTALL_DIR"
}

main() {
  ensure_node

  local repo_dir
  repo_dir="$(resolve_repo_dir)"
  cd "$repo_dir"

  log "Installing mineAI dependencies (this can take a minute)"
  npm install --no-fund --no-audit --loglevel=error

  log "Building mineAI"
  npm run build

  log "Installing dashboard dependencies"
  (cd dashboard && npm install --no-fund --no-audit --loglevel=error)

  log "Building dashboard"
  (cd dashboard && npm run build)

  printf '\n==> Build finished. Next: onboarding will open interactively.\n' >&2
  printf '==> If the terminal looks idle for a moment, wait — the prompt is loading.\n\n' >&2
  log "Launching mineAI onboarding"
  node --import tsx/esm src/cli/index.ts onboard

  printf '\nmineAI onboarding finished.\n'
  read -r -p 'Start mineAI now? [Y/n] ' start_now
  if [[ -z "${start_now}" || "${start_now}" =~ ^[Yy]$ ]]; then
    printf '\n==> Starting mineAI...\n' >&2
    printf '==> WebSocket server: ws://localhost:8080\n' >&2
    printf '==> Watch this terminal for Minecraft connection logs.\n\n' >&2
    log "Starting mineAI"
    exec node --import tsx/esm src/cli/index.ts start
  fi

  printf '\nmineAI is installed. Next steps:\n'
  printf '  cd %s\n' "$repo_dir"
  printf '  node --import tsx/esm src/cli/index.ts start\n\n'
}

main "$@"
