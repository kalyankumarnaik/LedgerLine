# ==============================================================================
# LedgerLine - Start Frontend (Vite + React 18)
# ==============================================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       LedgerLine Frontend Service Launcher       " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Ensure PATH has System32 and Node
$env:PATH = "$env:PATH;C:\Windows\System32;C:\Windows\System32\WindowsPowerShell\v1.0"

$currentDir = (Get-Location).Path
$frontendDir = if (Test-Path (Join-Path $currentDir "src\App.tsx")) {
    $currentDir
} elseif (Test-Path (Join-Path $currentDir "frontend")) {
    Join-Path $currentDir "frontend"
} else {
    Join-Path $PSScriptRoot "frontend"
}
Set-Location $frontendDir
Write-Host "[OK] Working in: $frontendDir" -ForegroundColor Green

# 1. Install dependencies if node_modules does not exist
if (-not (Test-Path "node_modules")) {
    Write-Host "[...] Installing frontend dependencies (npm install)..." -ForegroundColor Yellow
    npm install
}

# 2. Start Vite development server
Write-Host "[...] Launching Vite dev server on http://localhost:5173..." -ForegroundColor Cyan
npm run dev
