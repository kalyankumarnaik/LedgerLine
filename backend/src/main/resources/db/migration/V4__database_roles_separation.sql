-- ============================================================================
-- BalanceVault Migration V4: Principle of Least Privilege Database Roles
-- Defines specialized PostgreSQL roles: App, Auditor, Bootstrap Operator, Owner
-- ============================================================================

-- 1. Create specialized database roles if they do not exist
DO $$
BEGIN
    -- Operational Application Role (DML only, no DDL/DROP)
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_app') THEN
        CREATE ROLE bv_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
    END IF;

    -- Read-Only Auditor Role (Zero writes, immutable audit inspection)
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_auditor') THEN
        CREATE ROLE bv_auditor WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
    END IF;

    -- Bootstrap Operator Role (Permitted only to invoke admin bootstrap functions)
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_bootstrap_operator') THEN
        CREATE ROLE bv_bootstrap_operator WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
    END IF;
END $$;

-- 2. Grant permissions to bv_app (Business Transactions)
GRANT CONNECT ON DATABASE ledgerline TO bv_app;
GRANT USAGE ON SCHEMA public TO bv_app;
GRANT SELECT, INSERT, UPDATE ON TABLE users, accounts, account_balances, account_permissions,
    transaction_limits, financial_transactions, journal_entries, ledger_entries,
    idempotency_records, audit_events, risk_flags, account_adjustment_requests TO bv_app;
GRANT SELECT ON TABLE roles, user_roles TO bv_app;
-- Explicitly revoke DELETE on immutable ledger and journal entries
REVOKE DELETE ON TABLE journal_entries, ledger_entries, audit_events FROM bv_app;

-- 3. Grant permissions to bv_auditor (Read-Only Independent Oversight)
GRANT CONNECT ON DATABASE ledgerline TO bv_auditor;
GRANT USAGE ON SCHEMA public TO bv_auditor;
GRANT SELECT ON TABLE users, roles, user_roles, accounts, account_balances,
    financial_transactions, journal_entries, ledger_entries, audit_events,
    risk_flags, account_adjustment_requests TO bv_auditor;
-- Revoke all mutations from auditor
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM bv_auditor;

-- 4. Secure First-Admin Bootstrap Function
CREATE OR REPLACE FUNCTION public.bootstrap_admin_user(
    p_username VARCHAR(64),
    p_email VARCHAR(255),
    p_password_hash VARCHAR(255),
    p_full_name VARCHAR(128)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_role_id UUID := '00000000-0000-0000-0000-000000000010';
    v_user_id UUID := gen_random_uuid();
    v_existing_admin_count INT;
    v_result JSONB;
BEGIN
    -- Check if any administrator currently exists
    SELECT COUNT(*) INTO v_existing_admin_count
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name = 'ROLE_ADMIN';

    IF v_existing_admin_count > 0 THEN
        RETURN jsonb_build_object(
            'status', 'ALREADY_EXISTS',
            'message', 'Initial administrator is already provisioned in BalanceVault'
        );
    END IF;

    -- Ensure ROLE_ADMIN exists
    INSERT INTO roles (id, name) VALUES (v_admin_role_id, 'ROLE_ADMIN')
    ON CONFLICT (id) DO NOTHING;

    -- Create Admin User
    INSERT INTO users (id, username, email, password_hash, full_name, enabled, onboarding_status, failed_login_attempts)
    VALUES (v_user_id, p_username, p_email, p_password_hash, p_full_name, TRUE, 'VERIFIED', 0)
    ON CONFLICT (username) DO NOTHING;

    -- Assign ROLE_ADMIN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (v_user_id, v_admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    -- Write Audit Event
    INSERT INTO audit_events (id, event_type, actor_username, target_id, action_status, ip_address, metadata_json, timestamp)
    VALUES (
        gen_random_uuid(),
        'FIRST_ADMIN_BOOTSTRAP',
        p_username,
        v_user_id::text,
        'SUCCESS',
        '127.0.0.1',
        jsonb_build_object('action', 'BOOTSTRAP_ADMIN_FUNCTION', 'email', p_email)::text,
        CURRENT_TIMESTAMP
    );

    RETURN jsonb_build_object(
        'status', 'SUCCESS',
        'userId', v_user_id,
        'username', p_username,
        'email', p_email
    );
END;
$$;

-- Grant execution of bootstrap function to bootstrap operator
REVOKE ALL ON FUNCTION public.bootstrap_admin_user FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin_user TO bv_bootstrap_operator;
