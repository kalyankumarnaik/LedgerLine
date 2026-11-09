# ==============================================================================
# LedgerLine - Start Backend (Spring Boot 3.3.5)
# ==============================================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       LedgerLine Backend Service Launcher        " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Ensure PATH has System32 and PowerShell paths
$env:PATH = "$env:PATH;C:\Windows\System32;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Program Files\PostgreSQL\18\bin"

# 2. Fix JAVA_HOME to installed JDK 25
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25.0.2"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
Write-Host "[OK] Using Java: $env:JAVA_HOME" -ForegroundColor Green

# 3. Detect root and backend directories whether called from root or backend/
$currentDir = (Get-Location).Path
$backendDir = if (Test-Path (Join-Path $currentDir "src\main\java")) {
    $currentDir
} elseif (Test-Path (Join-Path $currentDir "backend")) {
    Join-Path $currentDir "backend"
} else {
    Join-Path $PSScriptRoot "backend"
}
Set-Location $backendDir
Write-Host "[OK] Working in: $backendDir" -ForegroundColor Green

# 4. Check PostgreSQL password
if (-not $env:SPRING_DATASOURCE_PASSWORD) {
    $env:SPRING_DATASOURCE_PASSWORD = "kalyan@2005"
}
Write-Host "[OK] PostgreSQL password configured." -ForegroundColor Green

# 5. Check if Maven is available or download portable Maven 3.9.9
$mvnCmd = Get-Command mvn -ErrorAction SilentlyContinue
$wrapperMaven = Join-Path $env:USERPROFILE ".m2\wrapper\dists\apache-maven-3.9.9\apache-maven-3.9.9\bin\mvn.cmd"

if (-not $mvnCmd -and (Test-Path $wrapperMaven)) {
    $env:PATH = "$(Split-Path $wrapperMaven -Parent);$env:PATH"
    $mvnCmd = Get-Command mvn -ErrorAction SilentlyContinue
}

if (-not $mvnCmd) {
    Write-Host "[...] Maven not detected on PATH. Downloading Apache Maven 3.9.9 wrapper..." -ForegroundColor Cyan
    $wrapperDist = Join-Path $env:USERPROFILE ".m2\wrapper\dists\apache-maven-3.9.9"
    if (-not (Test-Path $wrapperDist)) {
        New-Item -ItemType Directory -Force -Path $wrapperDist | Out-Null
    }
    $zipFile = Join-Path $wrapperDist "apache-maven-3.9.9-bin.zip"
    $url = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"
    
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    try {
        (New-Object System.Net.WebClient).DownloadFile($url, $zipFile)
    } catch {
        (New-Object System.Net.WebClient).DownloadFile("https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip", $zipFile)
    }
    
    Write-Host "[...] Extracting Maven..." -ForegroundColor Cyan
    Expand-Archive -Path $zipFile -DestinationPath $wrapperDist -Force
    Remove-Item -Force $zipFile
    
    $env:PATH = "$(Split-Path $wrapperMaven -Parent);$env:PATH"
    Write-Host "[OK] Apache Maven 3.9.9 configured!" -ForegroundColor Green
}

# 6. Launch Spring Boot application
Write-Host "[>>>] Launching LedgerLine Backend on http://localhost:8080..." -ForegroundColor Cyan
mvn spring-boot:run

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Backend terminated. Checking logs..." -ForegroundColor Red
    $logFile = Join-Path $backendDir "logs\ledgerline.log"
    if (Test-Path $logFile) {
        Write-Host "--- Last 40 lines of logs\ledgerline.log ---" -ForegroundColor Yellow
        Get-Content $logFile -Tail 40
    }
}
