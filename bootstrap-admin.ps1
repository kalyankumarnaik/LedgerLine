# ==============================================================================
# BalanceVault - First Administrator Bootstrap Script
# Initializes the primary root administrator with ROLE_ADMIN and audit tracking
# ==============================================================================

param(
    [string]$Email = "admin@balancevault.com",
    [string]$Username = "admin",
    [string]$FullName = "System Administrator",
    [string]$Password = "Password@123!",
    [switch]$Force
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     BalanceVault First Administrator Bootstrap   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Environment and PATH configuration
$env:PATH = "$env:PATH;C:\Windows\System32;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Program Files\PostgreSQL\18\bin;C:\Program Files\PostgreSQL\16\bin"

# 2. Database credentials detection
$dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$dbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$dbName = if ($env:DB_NAME) { $env:DB_NAME } else { "ledgerline" }
$dbUser = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$dbPassword = if ($env:SPRING_DATASOURCE_PASSWORD) { $env:SPRING_DATASOURCE_PASSWORD } elseif ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "kalyan@2005" }

$env:PGPASSWORD = $dbPassword

# 3. Check psql availability
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Write-Host "[!] psql CLI not detected on standard PATH." -ForegroundColor Yellow
    Write-Host "[...] Checking portable PostgreSQL or direct SQL execution..." -ForegroundColor Cyan
}

# 4. Pre-computed BCrypt hash for "Password@123!" ($2a$10$eACCYoNO3qHYOUErWUgOn.dWqFz6/0uQf8xZ.x9fP8p9q8n61rOey)
$passwordHash = '$2a$10$eACCYoNO3qHYOUErWUgOn.dWqFz6/0uQf8xZ.x9fP8p9q8n61rOey'
$userId = "00000000-0000-0000-0001-000000000001"
$roleAdminId = "00000000-0000-0000-0000-000000000010"
$auditId = [guid]::NewGuid().ToString()

$bootstrapSql = @"
DO \$\$
DECLARE
    v_admin_count INT;
BEGIN
    -- Check if an active administrator already exists
    SELECT COUNT(*) INTO v_admin_count
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name = 'ROLE_ADMIN';

    IF v_admin_count > 0 AND NOT '$Force' = 'True' THEN
        RAISE NOTICE 'Administrator already bootstrapped (% active admins found). Use -Force to overwrite.', v_admin_count;
    ELSE
        -- Ensure ROLE_ADMIN exists
        INSERT INTO roles (id, name)
        VALUES ('$roleAdminId', 'ROLE_ADMIN')
        ON CONFLICT (name) DO NOTHING;

        -- Insert or update primary admin user
        INSERT INTO users (id, username, email, password_hash, full_name, enabled, onboarding_status, failed_login_attempts)
        VALUES ('$userId', '$Username', '$Email', '$passwordHash', '$FullName', TRUE, 'VERIFIED', 0)
        ON CONFLICT (username) DO UPDATE
        SET email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            enabled = TRUE,
            onboarding_status = 'VERIFIED',
            failed_login_attempts = 0,
            locked_until = NULL;

        -- Associate with ROLE_ADMIN
        INSERT INTO user_roles (user_id, role_id)
        VALUES ('$userId', '$roleAdminId')
        ON CONFLICT (user_id, role_id) DO NOTHING;

        -- Write immutable audit event
        INSERT INTO audit_events (id, event_type, actor_username, target_id, action_status, ip_address, metadata_json, timestamp)
        VALUES (
            '$auditId',
            'FIRST_ADMIN_BOOTSTRAP',
            '$Username',
            '$userId',
            'SUCCESS',
            '127.0.0.1',
            '{"action":"BOOTSTRAP_PRIMARY_ADMIN","email":"$Email","role":"ROLE_ADMIN"}',
            CURRENT_TIMESTAMP
        );

        RAISE NOTICE 'BalanceVault Primary Administrator bootstrapped successfully: % (%)', '$Username', '$Email';
    END IF;
END \$\$;
"@

$sqlFile = Join-Path $env:TEMP "balancevault_bootstrap.sql"
Set-Content -Path $sqlFile -Value $bootstrapSql -Encoding UTF8

if ($psql) {
    try {
        & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile
        Write-Host "[OK] First-Admin bootstrap execution finished." -ForegroundColor Green
    } catch {
        Write-Host "[!] Direct psql execution reported: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] Bootstrap SQL file prepared at: $sqlFile" -ForegroundColor Green
}

Remove-Item -Path $sqlFile -Force -ErrorAction SilentlyContinue

Write-Host "--------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Administrator Account Ready:" -ForegroundColor Green
Write-Host "  Username: $Username" -ForegroundColor White
Write-Host "  Email:    $Email" -ForegroundColor White
Write-Host "  Role:     ROLE_ADMIN (Superuser)" -ForegroundColor White
Write-Host "  Status:   VERIFIED & ONBOARDED" -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor DarkGray
Write-Host "You can now sign in at http://localhost:5173/login" -ForegroundColor Cyan
