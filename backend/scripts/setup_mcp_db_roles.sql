-- ============================================================================
-- WinVinaya MIS — Claude MCP Connector PostgreSQL Role Setup (Idempotent)
-- ============================================================================
-- Run once per environment AFTER running `alembic upgrade head`:
--
--   sudo -u postgres psql -d winvinaya_prod \
--     -v ro_pw="'<strong-ro-password>'" \
--     -v auth_pw="'<strong-auth-password>'" \
--     -f backend/scripts/setup_mcp_db_roles.sql
-- ============================================================================

-- 1. Create or update read-only role for business data queries
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mis_mcp_ro') THEN
        CREATE ROLE mis_mcp_ro LOGIN CONNECTION LIMIT 10;
    END IF;
END
$$;

ALTER ROLE mis_mcp_ro WITH LOGIN PASSWORD :ro_pw CONNECTION LIMIT 10;
ALTER ROLE mis_mcp_ro SET default_transaction_read_only = on;
ALTER ROLE mis_mcp_ro SET statement_timeout = '15s';
ALTER ROLE mis_mcp_ro SET idle_in_transaction_session_timeout = '30s';

GRANT USAGE ON SCHEMA public TO mis_mcp_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mis_mcp_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mis_mcp_ro;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT ON TABLES TO mis_mcp_ro;

-- 2. Create or update auth/audit role (writes ONLY to OAuth + MCP audit tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mis_mcp_auth') THEN
        CREATE ROLE mis_mcp_auth LOGIN CONNECTION LIMIT 5;
    END IF;
END
$$;

ALTER ROLE mis_mcp_auth WITH LOGIN PASSWORD :auth_pw CONNECTION LIMIT 5;
ALTER ROLE mis_mcp_auth SET statement_timeout = '10s';
ALTER ROLE mis_mcp_auth SET idle_in_transaction_session_timeout = '15s';

GRANT USAGE ON SCHEMA public TO mis_mcp_auth;
GRANT SELECT ON TABLE users TO mis_mcp_auth;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE oauth_clients, oauth_auth_codes, oauth_tokens TO mis_mcp_auth;
GRANT SELECT, INSERT, UPDATE ON TABLE mcp_audit_log TO mis_mcp_auth;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mis_mcp_auth;

