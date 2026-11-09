# ==============================================================================
# LedgerLine - PostgreSQL Database Setup Script
# ==============================================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       LedgerLine - PostgreSQL Database Setup      " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$pgBin = "C:\Program Files\PostgreSQL\18\bin"
if (-not (Test-Path $pgBin)) {
    # Search for any installed postgresql bin
    $found = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
    if ($found) {
        $pgBin = Join-Path $found.FullName "bin"
    }
}

if (-not (Test-Path $pgBin)) {
    Write-Host "[ERROR] PostgreSQL bin directory not found. Please ensure PostgreSQL is installed." -ForegroundColor Red
    exit 1
}

$createdb = Join-Path $pgBin "createdb.exe"
$psql = Join-Path $pgBin "psql.exe"

Write-Host "[INFO] Found PostgreSQL tools at: $pgBin" -ForegroundColor Green

# 1. Start PostgreSQL Service if stopped
$svcName = "postgresql-x64-18"
$svc = Get-Service -Name "*postgres*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($svc) {
    if ($svc.Status -ne "Running") {
        Write-Host "[...] Starting PostgreSQL Windows service: $($svc.Name)..." -ForegroundColor Yellow
        try {
            Start-Service $svc.Name
            Write-Host "[OK] PostgreSQL service started." -ForegroundColor Green
        } catch {
            Write-Host "[WARNING] Could not start service automatically. Please start it via Services (services.msc)." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[OK] PostgreSQL service ($($svc.Name)) is RUNNING." -ForegroundColor Green
    }
}

# 2. Check if database 'ledgerline' exists, create if not
Write-Host "[...] Checking if database 'ledgerline' exists..." -ForegroundColor Yellow
$pgUser = if ($env:SPRING_DATASOURCE_USERNAME) { $env:SPRING_DATASOURCE_USERNAME } else { "postgres" }

# Try creating database
& $createdb -U $pgUser ledgerline 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Database 'ledgerline' created successfully!" -ForegroundColor Green
} else {
    Write-Host "[INFO] Database 'ledgerline' already exists or password was requested." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Database setup complete! Spring Boot and Flyway will auto-migrate tables and seed data upon launch." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
