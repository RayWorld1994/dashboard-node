-- =============================================================================
-- Read-only database role for the chatbot
--
-- Run this once against your PostgreSQL instance as a superuser or the DB owner.
-- Then set CHATBOT_DATABASE_URL in .env to use this user's credentials.
--
-- Usage:
--   psql -U postgres -d dashboard_db -f scripts/create-readonly-role.sql
-- =============================================================================

-- 1. Create the role (change the password)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'chatbot_readonly'
  ) THEN
    CREATE ROLE chatbot_readonly LOGIN PASSWORD 'change_me_strong_password';
  END IF;
END
$$;

-- 2. Allow the role to connect to the database
GRANT CONNECT ON DATABASE dashboard_db TO chatbot_readonly;

-- 3. Allow schema usage (required to see tables)
GRANT USAGE ON SCHEMA public TO chatbot_readonly;

-- 4. Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO chatbot_readonly;

-- 5. Ensure SELECT on any future tables created by migrations
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO chatbot_readonly;

-- 6. Explicitly REVOKE any write capabilities (defense in depth)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public
  FROM chatbot_readonly;

REVOKE CREATE ON SCHEMA public FROM chatbot_readonly;
REVOKE CREATE ON DATABASE dashboard_db FROM chatbot_readonly;

-- =============================================================================
-- Verification — run these to confirm the role has no write access:
--
--   \c dashboard_db chatbot_readonly
--   INSERT INTO projects (name, status, "ownerId") VALUES ('test', 'active', 1);
--   -- Should return: ERROR: permission denied for table projects
--
--   SELECT count(*) FROM tasks;
--   -- Should work fine
-- =============================================================================
