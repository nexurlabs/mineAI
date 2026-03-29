$ErrorActionPreference = 'Stop'

$RepoUrl = 'https://github.com/nexurlabs/mineAI.git'
$DefaultDir = Join-Path $HOME '.nexurlabs\mineAI'
$InstallDir = if ($env:MINEAI_DIR) { $env:MINEAI_DIR } else { $DefaultDir }

function Write-Step($Message) {
  Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Ensure-Command($Command, $WingetId) {
  if (Get-Command $Command -ErrorAction SilentlyContinue) { return }
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "Missing $Command and winget is unavailable. Please install $Command manually."
  }
  Write-Step "Installing $Command via winget"
  winget install --accept-source-agreements --accept-package-agreements --id $WingetId
}

function Get-RepoDir {
  if ((Test-Path './package.json') -and (Select-String -Path './package.json' -Pattern '"name": "roseguard"' -Quiet)) {
    return (Get-Location).Path
  }

  Ensure-Command git 'Git.Git'
  $parent = Split-Path $InstallDir -Parent
  if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }

  if (Test-Path (Join-Path $InstallDir '.git')) {
    Write-Step "Updating existing mineAI checkout at $InstallDir"
    git -C $InstallDir pull --ff-only | Out-Host
  } else {
    Write-Step "Cloning mineAI into $InstallDir"
    git clone $RepoUrl $InstallDir | Out-Host
  }
  return $InstallDir
}

Ensure-Command node 'OpenJS.NodeJS.LTS'
Ensure-Command npm 'OpenJS.NodeJS.LTS'

$RepoDir = Get-RepoDir
Set-Location $RepoDir

Write-Step 'Installing mineAI dependencies'
npm install | Out-Host

Write-Step 'Building mineAI'
npm run build | Out-Host

Write-Step 'Launching RoseGuard onboarding'
node --import tsx/esm src/cli/index.ts onboard

Write-Host "`nmineAI is installed. Next steps:" -ForegroundColor Green
Write-Host "  cd $RepoDir"
Write-Host "  node --import tsx/esm src/cli/index.ts start`n"
