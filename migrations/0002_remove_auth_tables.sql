-- Remove password-based auth fields and tables (migrated to Cloudflare Access)
ALTER TABLE users DROP COLUMN local_password_hash;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS invitations;
