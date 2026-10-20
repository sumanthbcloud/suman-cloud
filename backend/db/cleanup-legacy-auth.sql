-- ============================================================================
-- SUMAN CLOUD — Legacy Authentication Schema Compatibility Migration
-- ============================================================================
-- Description:
-- One-time safe and idempotent migration script to remove legacy OTP/email
-- verification columns from existing PostgreSQL databases.
--
-- Background:
-- Earlier versions of SUMAN required OTP verification and maintained
-- email_verified, otp_code, and otp_expires_at columns on the users table.
-- With the simplified authentication system (username, email, password),
-- these columns are no longer used by the application entity model.
--
-- Usage:
-- Apply this script once to an existing PostgreSQL database:
--
--   docker compose exec -T postgres psql -U suman -d suman < backend/db/cleanup-legacy-auth.sql
--
-- Or via direct psql connection:
--
--   psql -h <DB_HOST> -p 5432 -U suman -d suman -f backend/db/cleanup-legacy-auth.sql
--
-- Safety Guarantees:
-- 1. Idempotent: Uses DROP COLUMN IF EXISTS so it is safe to run multiple times.
-- 2. Non-destructive: Does NOT drop the users table, files, or any existing accounts.
-- 3. Retains all core columns: id, username, name, email, password, created_at.
-- ============================================================================

ALTER TABLE users DROP COLUMN IF EXISTS email_verified;
ALTER TABLE users DROP COLUMN IF EXISTS otp_code;
ALTER TABLE users DROP COLUMN IF EXISTS otp_expires_at;
