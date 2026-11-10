-- ==============================================================================
-- BalanceVault - PostgreSQL Initialization Script for Docker & Local Dev
-- ==============================================================================

-- Create ledgerline / balancevault database if not exists
SELECT 'CREATE DATABASE ledgerline'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ledgerline')\gexec

\c ledgerline;

-- Create Roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_app') THEN
        CREATE ROLE bv_app WITH LOGIN PASSWORD 'app_secret_pass' NOSUPERUSER NOCREATEDB NOCREATEROLE;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_auditor') THEN
        CREATE ROLE bv_auditor WITH LOGIN PASSWORD 'auditor_secret_pass' NOSUPERUSER NOCREATEDB NOCREATEROLE;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bv_bootstrap_operator') THEN
        CREATE ROLE bv_bootstrap_operator WITH LOGIN PASSWORD 'bootstrap_secret_pass' NOSUPERUSER NOCREATEDB NOCREATEROLE;
    END IF;
END $$;
