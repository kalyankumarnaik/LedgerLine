#!/usr/bin/env bash
# ==============================================================================
# BalanceVault - First Administrator Bootstrap Script (POSIX / Linux / macOS)
# ==============================================================================

set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-ledgerline}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-${SPRING_DATASOURCE_PASSWORD:-postgrespassword}}"

EMAIL="${1:-admin@balancevault.com}"
USERNAME="${2:-admin}"
FULL_NAME="${3:-System Administrator}"
PASSWORD_HASH='$2a$10$eACCYoNO3qHYOUErWUgOn.dWqFz6/0uQf8xZ.x9fP8p9q8n61rOey'
USER_ID="00000000-0000-0000-0001-000000000001"
ROLE_ADMIN_ID="00000000-0000-0000-0000-000000000010"
AUDIT_ID="$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "00000000-0000-0000-0000-000000000099")"

echo "=================================================="
echo "    BalanceVault First Administrator Bootstrap    "
echo "=================================================="

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
DO \$\$
DECLARE
    v_admin_count INT;
BEGIN
    SELECT COUNT(*) INTO v_admin_count
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name = 'ROLE_ADMIN';

    IF v_admin_count > 0 THEN
        RAISE NOTICE 'Administrator already bootstrapped (% found).', v_admin_count;
    ELSE
        INSERT INTO roles (id, name) VALUES ('$ROLE_ADMIN_ID', 'ROLE_ADMIN') ON CONFLICT (name) DO NOTHING;

        INSERT INTO users (id, username, email, password_hash, full_name, enabled, onboarding_status, failed_login_attempts)
        VALUES ('$USER_ID', '$USERNAME', '$EMAIL', '$PASSWORD_HASH', '$FULL_NAME', TRUE, 'VERIFIED', 0)
        ON CONFLICT (username) DO UPDATE
        SET email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            enabled = TRUE,
            onboarding_status = 'VERIFIED';

        INSERT INTO user_roles (user_id, role_id)
        VALUES ('$USER_ID', '$ROLE_ADMIN_ID')
        ON CONFLICT (user_id, role_id) DO NOTHING;

        INSERT INTO audit_events (id, event_type, actor_username, target_id, action_status, ip_address, metadata_json, timestamp)
        VALUES (
            '$AUDIT_ID',
            'FIRST_ADMIN_BOOTSTRAP',
            '$USERNAME',
            '$USER_ID',
            'SUCCESS',
            '127.0.0.1',
            '{"action":"BOOTSTRAP_PRIMARY_ADMIN","email":"$EMAIL","role":"ROLE_ADMIN"}',
            CURRENT_TIMESTAMP
        );

        RAISE NOTICE 'BalanceVault Primary Administrator bootstrapped successfully: % (%)', '$USERNAME', '$EMAIL';
    END IF;
END \$\$;
EOF

echo "--------------------------------------------------"
echo "Administrator Account Ready: $EMAIL (Username: $USERNAME)"
echo "--------------------------------------------------"
