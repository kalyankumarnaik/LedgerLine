-- ============================================================================
-- BalanceVault Migration V4: Principle of Least Privilege Database Roles
-- Defines specialized PostgreSQL roles: App, Auditor, Bootstrap Operator, Owner
-- Engineered to work seamlessly across local, Docker, and cloud databases (Render, Neon, RDS)
-- ============================================================================

-- 1. Create specialized database roles if permitted by the database engine
DO $$
DECLARE
    v_db_name TEXT := current_database();
BEGIN
    -- Operational Application Role (DML only, no DDL/DROP)
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_app') THEN
            CREATE ROLE bv_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
        END IF;
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'Skipping CREATE ROLE bv_app due to cloud database privileges';
    END;

    -- Read-Only Auditor Role (Zero writes, immutable audit inspection)
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_auditor') THEN
            CREATE ROLE bv_auditor WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
        END IF;
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'Skipping CREATE ROLE bv_auditor due to cloud database privileges';
    END;

    -- Bootstrap Operator Role (Permitted only to invoke admin bootstrap functions)
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_bootstrap_operator') THEN
            CREATE ROLE bv_bootstrap_operator WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
        END IF;
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'Skipping CREATE ROLE bv_bootstrap_operator due to cloud database privileges';
    END;

    -- 2. Grant permissions dynamically on current_database() to bv_app if role exists
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_app') THEN
        BEGIN
            EXECUTE format('GRANT CONNECT ON DATABASE %I TO bv_app', v_db_name);
            EXECUTE 'GRANT USAGE ON SCHEMA public TO bv_app';
            EXECUTE 'GRANT SELECT, INSERT, UPDATE ON TABLE users, accounts, account_balances, account_permissions,
                transaction_limits, financial_transactions, journal_entries, ledger_entries,
                idempotency_records, audit_events, risk_flags, account_adjustment_requests TO bv_app';
            EXECUTE 'GRANT SELECT ON TABLE roles, user_roles TO bv_app';
            EXECUTE 'REVOKE DELETE ON TABLE journal_entries, ledger_entries, audit_events FROM bv_app';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Granting permissions to bv_app skipped: %', SQLERRM;
        END;
    END IF;

    -- 3. Grant permissions dynamically to bv_auditor if role exists
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_auditor') THEN
        BEGIN
            EXECUTE format('GRANT CONNECT ON DATABASE %I TO bv_auditor', v_db_name);
            EXECUTE 'GRANT USAGE ON SCHEMA public TO bv_auditor';
            EXECUTE 'GRANT SELECT, INSERT, UPDATE ON TABLE users, accounts, account_balances, account_permissions,
                financial_transactions, journal_entries, ledger_entries, audit_events,
                risk_flags, account_adjustment_requests TO bv_auditor';
            EXECUTE 'REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM bv_auditor';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Granting permissions to bv_auditor skipped: %', SQLERRM;
        END;
    END IF;

    -- 4. Grant permissions dynamically to bv_bootstrap_operator if role exists
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_bootstrap_operator') THEN
        BEGIN
            EXECUTE format('GRANT CONNECT ON DATABASE %I TO bv_bootstrap_operator', v_db_name);
            EXECUTE 'GRANT USAGE ON SCHEMA public TO bv_bootstrap_operator';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Granting permissions to bv_bootstrap_operator skipped: %', SQLERRM;
        END;
    END IF;
END $$;

-- 5. Secure First-Admin Bootstrap Function
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

-- 6. Grant execution of bootstrap function to bootstrap operator if role exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_bootstrap_operator') THEN
        BEGIN
            REVOKE ALL ON FUNCTION public.bootstrap_admin_user FROM PUBLIC;
            EXECUTE 'GRANT EXECUTE ON FUNCTION public.bootstrap_admin_user TO bv_bootstrap_operator';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Function grant to bv_bootstrap_operator skipped: %', SQLERRM;
        END;
    END IF;
END $$;
